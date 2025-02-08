import { v4 as uuidv4 } from "uuid";
import { Server as SocketIOServer, Socket } from "socket.io";

import { BaseService } from "./baseService";
import { GameRoom, UserStatus } from "../../types";
import { SharedStore } from "../store/sharedStore";

/**
 * GameService manages multiplayer Tic-Tac-Toe game interactions
 * Handles room creation, joining, gameplay, and socket event management
 */
export class GameService extends BaseService {
  constructor(io: SocketIOServer) {
    super(io, "gameService");
  }

  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    socket.on("game:create_room", (name: string) => this.handleCreateRoom(socket, userId, name));
    socket.on("game:join_room", (roomId: string) =>
      this.handleJoinRoom(socket, userId, roomId)
    );
    socket.on(
      "game:join_request_reply",
      (roomId: string, applicantId: string, acceptOrDecline: boolean) => {
        const user = SharedStore.getInstance().getUser(applicantId);
        user.socketIds.forEach((socketId) => {
          this.io.sockets.sockets
            .get(socketId)
            .emit("game:join_request_replied", roomId, acceptOrDecline);
        });
      }
    );
    socket.on("game:room_leave", (roomId: string) =>
      this.handleLeaveRoom(socket, userId, roomId)
    );
    socket.on("game:room_list", () => this.handleGetRoomList(socket));

    socket.on("game:update_content", (newContent: string) =>
      this.handleUpdateCode(socket, userId, newContent)
    );
    socket.on("game:request_join_room", (roomId: string) => {
      const room = SharedStore.getInstance().getGameRoom(roomId);
      const user = SharedStore.getInstance().getUser(room.hostId);
      if (!user || !room) {
        return;
      }
      user.socketIds.forEach((socketId) => {
        this.io.sockets.sockets
          .get(socketId)
          .emit("game:join_requested", userId, roomId);
      });
    });

    socket.on("game:kick_player", (roomId: string, userId: string) => {
      this.handleKickPlayer(socket, roomId, userId);
    });
    socket.on("disconnect", () => this.handleDisconnect(socket, userId));
  }

  handleKickPlayer(socket: Socket, roomId: string, userId: string) {
    const user = SharedStore.getInstance().getUser(userId);
    user.socketIds.forEach((socketId) => {
      const targetedSocket = this.io.sockets.sockets.get(socketId);
      this.handleLeaveRoom(targetedSocket, userId, roomId);
    });
  }

  handleUpdateCode(socket: Socket, userId: string, code: string) {
    const existingRoom = this.findUserRoom(userId);
    if (existingRoom) {
      existingRoom.content = code;
      this.store.setGameRoom(existingRoom.id, existingRoom);
      this.io.to(existingRoom.id).emit("game:room_state", existingRoom);
      return;
    }
  }

  /**
   * Creates a new game room for a user, managing room initialization and state management
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the user creating the room
   *
   * @throws {Error} Throws errors during room creation process
   *
   * @returns {void}
   *
   * @description
   * - Validates user existence and current game state
   * - Generates a unique room identifier
   * - Initializes game room with default settings
   * - Manages user and room state transitions
   *
   * @example
   * socket.emit('game:create_room')
   */
  private handleCreateRoom(socket: Socket, userId: string, roomName: string) {
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
        name: roomName,
        players: {
          [userId]: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
        status: "waiting",
        board: Array(9).fill(null),
        createdAt: new Date(),
        content: "",
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

  /**
   * Handles a user's request to join an existing game room
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the user attempting to join
   * @param {string} roomId - Unique identifier of the target game room
   *
   * @throws {Error} Throws errors during room joining process
   *
   * @returns {void}
   *
   * @description
   * - Validates room and user existence
   * - Checks room availability and game status
   * - Assigns player symbol
   * - Manages room and user state transitions
   *
   * @example
   * socket.emit('game:join_room', { roomId: 'room123' })
   */
  private handleJoinRoom(socket: Socket, userId: string, roomId: string) {
    try {
      // Retrieve game room and user details from store
      const gameRoom = this.store.getGameRoom(roomId);
      const user = this.store.getUser(userId);

      // Validate room and user existence
      if (!gameRoom) {
        socket.emit("game:room_not_found");
        return;
      }

      if (!user) {
        socket.emit("game:error", "User not found");
        return;
      }

      const playerIds = Object.keys(gameRoom.players);

      if (playerIds.includes(userId)) {
        socket.emit("game:warning", "You've already joined the room");
      } else {
        if (playerIds.length === 5) socket.emit("game:error", "Room is full");
      }

      // Add player to game room
      gameRoom.players[userId] = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      try {
        socket.join(roomId); // Socket.IO room joining

        this.store.updateUser(userId, {
          status: UserStatus.INGAME,
        });
        this.store.setGameRoom(roomId, gameRoom);
      } catch (updateError) {
        this.error(`Room state update failed during join`, {
          error: updateError,
          roomId,
          userId,
        });

        socket.emit("game:error", "Unable to complete room joining process");
        return;
      }
      socket.emit("game:room_joined", gameRoom);
      this.io.to(roomId).emit("game:room_state", gameRoom);
      this.broadcastRoomList();
    } catch (error) {
      socket.emit(
        "game:error",
        "A critical error occurred during room joining. Our team has been notified."
      );
    }
  }
  /**
   * Handles a player leaving a game room
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the player leaving the room
   * @param {string} roomId - Unique identifier of the game room
   *
   * @returns {void}
   *
   * @description
   * - Removes player from game room
   * - Handles room state changes based on leaving player
   * - Updates user and room statuses
   * - Broadcasts room closure or updated state
   * - Notifies clients about room changes
   */
  private handleLeaveRoom(socket: Socket, userId: string, roomId: string) {
    try {
      const gameRoom = this.store.getGameRoom(roomId);
      if (!gameRoom) {
        socket.emit("game:room_not_found");
        return;
      }

      delete gameRoom.players[userId];
      this.store.updateUser(userId, { status: UserStatus.ONLINE });

      if (userId === gameRoom.hostId) {
        const otherPlayerId = Object.keys(gameRoom.players)[0];
        if (otherPlayerId) {
          this.store.updateUser(otherPlayerId, { status: UserStatus.ONLINE });
          this.io.to(roomId).emit("game:room_closed", { roomId });
        }
        this.store.removeGameRoom(roomId);
      } else {
        delete gameRoom.currentTurn;
        gameRoom.board = Array(9).fill(null);
        this.store.setGameRoom(roomId, gameRoom);
        this.io.to(roomId).emit("game:room_state", gameRoom);
      }

      const user = this.store.getUser(userId);
      user.socketIds.forEach((socketId) => {
        this.io.to(socketId).emit("game:room_left");
        this.io.sockets.sockets.get(socketId).leave(roomId);
      });
      this.broadcastRoomList();
    } catch (error) {
      this.error("Error leaving room:", error);
      socket.emit("game:error", "Failed to leave room");
    }
  }

  /**
   * Retrieves and sends the list of all available game rooms
   *
   * @param {Socket} socket - The client's active socket connection
   *
   * @returns {void}
   *
   * @description
   * - Fetches all game rooms from store
   * - Emits room list to the requesting client
   */
  private handleGetRoomList(socket: Socket) {
    const rooms = this.store.getAllGameRooms();
    socket.emit("game:room_list", rooms);
  }

  /**
   * Handles user disconnection from the game
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the disconnecting user
   *
   * @returns {void}
   *
   * @description
   * - Finds the room the user is currently in
   * - Automatically handles room leaving process if user is in a room
   * - Ensures clean room state management during unexpected disconnections
   */
  private handleDisconnect(socket: Socket, userId: string) {
    const room = this.findUserRoom(userId);
    const user = SharedStore.getInstance().getUser(userId);
    if (room && user && user.socketIds.length === 1) {
      this.handleLeaveRoom(socket, userId, room.id);
    }
  }

  /**
   * Finds the room a specific user is currently in
   *
   * @param {string} userId - Unique identifier of the user
   * @returns {GameRoom | undefined} The game room the user is in, or undefined if not in a room
   *
   * @description
   * - Searches through all game rooms
   * - Checks if user is a player in any room
   * - Returns the room if found, otherwise returns undefined
   */
  findUserRoom(userId: string): GameRoom | undefined {
    return this.store
      .getAllGameRooms()
      .find((room) => Object.keys(room.players).includes(userId));
  }

  /**
   * Broadcasts the current list of game rooms to all connected clients
   *
   * @returns {void}
   *
   * @description
   * - Retrieves all current game rooms
   * - Emits room list to all connected sockets
   * - Ensures all clients have up-to-date room information
   */
  broadcastRoomList() {
    const rooms = this.store.getAllGameRooms();
    this.io.emit("game:room_list", rooms);
  }
}
