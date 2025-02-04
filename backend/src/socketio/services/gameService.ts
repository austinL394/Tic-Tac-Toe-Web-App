import { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { BaseService } from "./baseService";
import { GameRoom, UserStatus } from "../../types";
import { ServiceRegistry } from "../serviceRegistry";

export class GameService extends BaseService {
  constructor(io: SocketIOServer) {
    super(io, "gameService");
  }

  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    socket.on("game:create_room", () => {
      console.log("@@@ handling game create event:", userId);
      this.handleCreateRoom(socket, userId);
    });

    socket.on("game:join_room", (roomId: string) => {
      this.handleJoinRoom(socket, userId, roomId);
    });

    socket.on("game:leave_room", (roomId: string) => {
      this.handleLeaveRoom(socket, userId, roomId);
    });

    socket.on("game:get_room", (roomId: string) => {
      this.handleGetRoom(socket, roomId);
    });

    socket.on("game:room_list", () => {
      this.handleGetRoomList(socket);
    });

    socket.on("game:toggle_ready", (roomId: string) => {
      this.handleToggleReady(socket, userId, roomId);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      this.handleDisconnect(socket, userId);
    });
  }

  private handleCreateRoom(socket: Socket, userId: string) {
    try {
      const user = this.store.getUser(userId);
      if (!user) {
        socket.emit("game:error", "User not found");
        return;
      }

      // Check if user is already in a room
      const existingRoom = this.findUserRoom(userId);
      if (existingRoom) {
        console.log("@@ already in room:", existingRoom);
        socket.emit("game:error", "You are already in a room");
        return;
      }

      // Create new game room
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
      };

      // Join socket room
      socket.join(roomId);

      // Update user status
      this.store.updateUser(userId, { status: UserStatus.INGAME });

      // Store game room
      this.store.setGameRoom(roomId, gameRoom);

      // Notify room creation
      socket.emit("game:room_created", gameRoom);

      // Broadcast updated room list
      this.broadcastRoomList();
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("game:error", "Failed to create room");
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
    console.log("@ all rooms", rooms);

    socket.emit("game:room_list", rooms);
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

      // Add player to room
      gameRoom.players[userId] = {
        symbol: "O",
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ready: false,
      };

      // Join socket room
      socket.join(roomId);

      // Update user status
      this.store.updateUser(userId, { status: UserStatus.INGAME });

      // Update game room
      this.store.setGameRoom(roomId, gameRoom);

      // Notify all players in room
      this.io.to(roomId).emit("game:room_state", gameRoom);

      // Broadcast updated room list
      this.broadcastRoomList();
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("game:error", "Failed to join room");
    }
  }

  private handleToggleReady(socket: Socket, userId: string, roomId: string) {
    const gameRoom = this.store.getGameRoom(roomId);
    if (!gameRoom || !gameRoom.players[userId]) return;

    // Toggle ready status
    gameRoom.players[userId].ready = !gameRoom.players[userId].ready;

    // Check if all players are ready
    const allPlayersReady = Object.values(gameRoom.players).every(
      (player) => player.ready
    );

    if (allPlayersReady && Object.keys(gameRoom.players).length === 2) {
      gameRoom.status = "playing";
      gameRoom.currentTurn = gameRoom.hostId;
    }

    // Update game room
    this.store.setGameRoom(roomId, gameRoom);

    // Notify all players in room
    this.io.to(roomId).emit("game:room_state", gameRoom);

    // Broadcast updated room list if status changed
    if (gameRoom.status === "playing") {
      this.broadcastRoomList();
    }
  }

  private handleLeaveRoom(socket: Socket, userId: string, roomId: string) {
    try {
      const gameRoom = this.store.getGameRoom(roomId);
      if (!gameRoom) return;

      // Remove player from room
      delete gameRoom.players[userId];
      socket.leave(roomId);

      // Update leaving player's status
      this.store.updateUser(userId, { status: UserStatus.ONLINE });

      // If host leaves, remove room
      if (userId === gameRoom.hostId) {
        const otherPlayerId = Object.keys(gameRoom.players)[0];
        if (otherPlayerId) {
          this.store.updateUser(otherPlayerId, { status: UserStatus.ONLINE });
          this.io.to(roomId).emit("game:room_closed", { roomId });
        }
        this.store.removeGameRoom(roomId);
      } else {
        // Update room status back to waiting
        gameRoom.status = "waiting";
        delete gameRoom.currentTurn;
        gameRoom.board = Array(9).fill(null);
        this.store.setGameRoom(roomId, gameRoom);
        this.io.to(roomId).emit("game:room_state", gameRoom);
      }

      // Broadcast updated room list
      this.broadcastRoomList();
    } catch (error) {
      console.error("Error leaving room:", error);
      socket.emit("game:error", "Failed to leave room");
    }
  }

  private handleDisconnect(socket: Socket, userId: string) {
    const room = this.findUserRoom(userId);
    if (room) {
      this.handleLeaveRoom(socket, userId, room.id);
    }
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
