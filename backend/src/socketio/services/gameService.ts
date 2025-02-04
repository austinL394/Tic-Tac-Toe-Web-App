// src/services/gameService.ts
import { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { BaseService } from "./baseService";
import { GameRoom, MovePayload, UserStatus } from "../../types";

export class GameService extends BaseService {
  constructor(io: SocketIOServer) {
    super(io, "gameService");
  }

  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    socket.on("game:create_room", () => this.handleCreateRoom(socket, userId));
    socket.on("game:join_room", (roomId: string) =>
      this.handleJoinRoom(socket, userId, roomId)
    );
    socket.on("game:room_leave", (roomId: string) =>
      this.handleLeaveRoom(socket, userId, roomId)
    );
    socket.on("game:get_room", (roomId: string) =>
      this.handleGetRoom(socket, roomId)
    );
    socket.on("game:room_list", () => this.handleGetRoomList(socket));
    socket.on("game:toggle_ready", (roomId: string) =>
      this.handleToggleReady(socket, userId, roomId)
    );
    socket.on("game:make_move", (moveData: MovePayload) =>
      this.handleMove(socket, userId, moveData)
    );
    socket.on("game:request_rematch", (roomId: string) =>
      this.handleRematchRequest(socket, userId, roomId)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket, userId));
  }

  private handleCreateRoom(socket: Socket, userId: string) {
    try {
      const user = this.store.getUser(userId);
      if (!user) {
        socket.emit("game:error", "User not found");
        return;
      }

      const existingRoom = this.findUserRoom(userId);
      if (existingRoom) {
        socket.emit("game:error", "You are already in a room");
        return;
      }

      const roomId = uuidv4();
      const gameRoom: GameRoom = {
        id: roomId,
        hostId: userId,
        players: {
          [userId]: {
            symbol: "X",
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            ready: false,
          },
        },
        status: "waiting",
        board: Array(9).fill(null),
        lastMoveAt: new Date(),
      };

      socket.join(roomId);
      this.store.updateUser(userId, { status: UserStatus.INGAME });
      this.store.setGameRoom(roomId, gameRoom);

      socket.emit("game:room_created", gameRoom);
      this.broadcastRoomList();
    } catch (error) {
      this.error("Error creating room:", error);
      socket.emit("game:error", "Failed to create room");
    }
  }

  private handleJoinRoom(socket: Socket, userId: string, roomId: string) {
    try {
      const gameRoom = this.store.getGameRoom(roomId);
      const user = this.store.getUser(userId);

      if (!gameRoom || !user) {
        socket.emit("game:error", "Room not found");
        return;
      }

      if (gameRoom.status !== "waiting") {
        socket.emit("game:error", "Game already in progress");
        return;
      }

      if (Object.keys(gameRoom.players).length >= 2) {
        socket.emit("game:error", "Room is full");
        return;
      }

      gameRoom.players[userId] = {
        symbol: "O",
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ready: false,
      };

      socket.join(roomId);
      this.store.updateUser(userId, { status: UserStatus.INGAME });
      this.store.setGameRoom(roomId, gameRoom);

      socket.emit("game:room_joined", gameRoom);
      this.io.to(roomId).emit("game:room_state", gameRoom);
      this.broadcastRoomList();
    } catch (error) {
      this.error("Error joining room:", error);
      socket.emit("game:error", "Failed to join room");
    }
  }

  private handleMove(
    socket: Socket,
    userId: string,
    { position, roomId }: MovePayload
  ) {
    try {
      const gameRoom = this.store.getGameRoom(roomId);

      if (!gameRoom) {
        socket.emit("game:error", "Room not found");
        return;
      }

      if (gameRoom.status !== "playing") {
        socket.emit("game:error", "Game is not in progress");
        return;
      }

      if (gameRoom.currentTurn !== userId) {
        socket.emit("game:error", "Not your turn");
        return;
      }

      if (position < 0 || position > 8 || gameRoom.board[position] !== null) {
        socket.emit("game:error", "Invalid move");
        return;
      }

      const playerSymbol = gameRoom.players[userId].symbol;
      gameRoom.board[position] = playerSymbol;

      const gameResult = this.checkGameResult(gameRoom.board);

      if (gameResult.hasResult) {
        gameRoom.status = "finished";
        gameRoom.winner = gameResult.isDraw ? "draw" : userId;

        Object.keys(gameRoom.players).forEach((playerId) => {
          this.store.updateUser(playerId, { status: UserStatus.ONLINE });
        });
      } else {
        const playerIds = Object.keys(gameRoom.players);
        gameRoom.currentTurn = playerIds.find((id) => id !== userId)!;
      }

      this.store.setGameRoom(roomId, gameRoom);
      this.io.to(roomId).emit("game:room_state", gameRoom);

      if (gameRoom.status === "finished") {
        this.broadcastRoomList();
      }
    } catch (error) {
      this.error("Error handling move:", error);
      socket.emit("game:error", "Failed to make move");
    }
  }

  private handleToggleReady(socket: Socket, userId: string, roomId: string) {
    const gameRoom = this.store.getGameRoom(roomId);
    if (!gameRoom || !gameRoom.players[userId]) return;

    gameRoom.players[userId].ready = !gameRoom.players[userId].ready;

    const allPlayersReady = Object.values(gameRoom.players).every(
      (player) => player.ready
    );

    if (allPlayersReady && Object.keys(gameRoom.players).length === 2) {
      gameRoom.status = "playing";
      gameRoom.currentTurn = gameRoom.hostId;
      gameRoom.board = Array(9).fill(null);
    }

    this.store.setGameRoom(roomId, gameRoom);
    this.io.to(roomId).emit("game:room_state", gameRoom);

    if (gameRoom.status === "playing") {
      this.broadcastRoomList();
    }
  }

  private handleRematchRequest(socket: Socket, userId: string, roomId: string) {
    const gameRoom = this.store.getGameRoom(roomId);
    if (!gameRoom || gameRoom.status !== "finished") return;

    const player = gameRoom.players[userId];
    if (!player) return;

    player.ready = true;

    const allPlayersReady = Object.values(gameRoom.players).every(
      (p) => p.ready
    );
    if (allPlayersReady) {
      this.resetGame(roomId);
    } else {
      this.store.setGameRoom(roomId, gameRoom);
      this.io.to(roomId).emit("game:room_state", gameRoom);
    }
  }

  private handleLeaveRoom(socket: Socket, userId: string, roomId: string) {
    try {
      const gameRoom = this.store.getGameRoom(roomId);
      if (!gameRoom) return;

      delete gameRoom.players[userId];
      socket.leave(roomId);
      this.store.updateUser(userId, { status: UserStatus.ONLINE });

      if (userId === gameRoom.hostId) {
        const otherPlayerId = Object.keys(gameRoom.players)[0];
        if (otherPlayerId) {
          this.store.updateUser(otherPlayerId, { status: UserStatus.ONLINE });
          this.io.to(roomId).emit("game:room_closed", { roomId });
        }
        this.store.removeGameRoom(roomId);
      } else {
        gameRoom.status = "waiting";
        delete gameRoom.currentTurn;
        gameRoom.board = Array(9).fill(null);
        this.store.setGameRoom(roomId, gameRoom);
        this.io.to(roomId).emit("game:room_state", gameRoom);
      }

      socket.emit("game:room_left");
      this.broadcastRoomList();
    } catch (error) {
      this.error("Error leaving room:", error);
      socket.emit("game:error", "Failed to leave room");
    }
  }

  private handleGetRoom(socket: Socket, roomId: string) {
    const gameRoom = this.store.getGameRoom(roomId);
    if (gameRoom) {
      socket.emit("game:room_state", gameRoom);
    } else {
      socket.emit("game:error", "Room not found");
    }
  }

  private handleGetRoomList(socket: Socket) {
    const rooms = this.store.getAllGameRooms();
    socket.emit("game:room_list", rooms);
  }

  private handleDisconnect(socket: Socket, userId: string) {
    const room = this.findUserRoom(userId);
    if (room) {
      this.handleLeaveRoom(socket, userId, room.id);
    }
  }

  private checkGameResult(board: (string | null)[]) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { hasResult: true, isDraw: false };
      }
    }

    const isDraw = board.every((cell) => cell !== null);
    return { hasResult: isDraw, isDraw };
  }

  private resetGame(roomId: string) {
    const gameRoom = this.store.getGameRoom(roomId);
    if (!gameRoom) return;

    gameRoom.status = "waiting";
    gameRoom.board = Array(9).fill(null);
    gameRoom.currentTurn = undefined;
    gameRoom.winner = undefined;

    Object.keys(gameRoom.players).forEach((playerId) => {
      gameRoom.players[playerId].ready = false;
    });

    this.store.setGameRoom(roomId, gameRoom);
    this.io.to(roomId).emit("game:room_state", gameRoom);
    this.broadcastRoomList();
  }

  private findUserRoom(userId: string): GameRoom | undefined {
    return this.store
      .getAllGameRooms()
      .find((room) => Object.keys(room.players).includes(userId));
  }

  private broadcastRoomList() {
    const rooms = this.store.getAllGameRooms();
    this.io.emit("game:room_list", rooms);
  }
}
