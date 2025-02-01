import { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { BaseService } from "./baseService";
import { GameRoom, UserStatus } from "../../types";

export class GameService extends BaseService {
  constructor(io: SocketIOServer) {
    super(io);
  }

  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    socket.on("game:create_room", () => {
      this.handleCreateRoom(socket, userId);
    });

    socket.on("game:join_room", (roomId: string) => {
      this.handleJoinRoom(socket, userId, roomId);
    });

    socket.on("game:leave_room", (roomId: string) => {
      this.handleLeaveRoom(socket, userId, roomId);
    });
  }

  private handleCreateRoom(socket: Socket, userId: string) {
    const user = this.store.getUser(userId);
    if (!user) return;

    // Create new game room
    const roomId = uuidv4();
    const gameRoom: GameRoom = {
      id: roomId,
      hostId: userId,
      players: {
        [userId]: {
          symbol: "X",
          username: user.username,
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
  }

  private handleJoinRoom(socket: Socket, userId: string, roomId: string) {
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
      ready: false,
    };

    // Update game status
    gameRoom.status = "playing";
    gameRoom.currentTurn = gameRoom.hostId; // Host starts first

    // Join socket room
    socket.join(roomId);

    // Update user status
    this.store.updateUser(userId, { status: UserStatus.INGAME });

    // Update game room
    this.store.setGameRoom(roomId, gameRoom);

    // Notify all players in room
    this.io.to(roomId).emit("game:player_joined", gameRoom);

    // Broadcast updated room list
    this.broadcastRoomList();
  }

  private handleLeaveRoom(socket: Socket, userId: string, roomId: string) {
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
      this.io.to(roomId).emit("game:player_left", { gameId: roomId, userId });
    }

    // Broadcast updated room list
    this.broadcastRoomList();
  }

  private broadcastRoomList() {
    const rooms = this.store.getAllGameRooms().map((room) => ({
      id: room.id,
      hostId: room.hostId,
      status: room.status,
      playerCount: Object.keys(room.players).length,
    }));
    this.io.emit("game:room_list", rooms);
  }
}
