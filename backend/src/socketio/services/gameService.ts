import { v4 as uuidv4 } from "uuid";
import { Server as SocketIOServer, Socket } from "socket.io";

import { BaseService } from "./baseService";
import { GameRoom, MovePayload, UserStatus } from "../../types";

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

      let symbol: "O" | "X" = "O";

      if (gameRoom.hostId === user.userId) {
        socket.emit("game:error", "You are the host of the game room.");
        symbol = "X";
      }

      // Add player to game room
      gameRoom.players[userId] = {
        symbol: symbol,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ready: false,
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
   * Handles a player's move in an active game room
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the player making the move
   * @param {Object} moveDetails - Details of the player's move
   * @property {number} moveDetails.position - Board position (0-8) where the player places their symbol
   * @property {string} moveDetails.roomId - Unique identifier of the game room
   *
   * @throws {Error} Throws errors during move validation and processing
   *
   * @returns {void}
   *
   * @description
   * - Validates move legality and game state
   * - Updates game board and player turns
   * - Checks for game completion (win/draw)
   * - Manages room and player state transitions
   *
   * @example
   * socket.emit('game:make_move', {
   *   position: 4,  // Center of the board
   *   roomId: 'room123'
   * })
   */
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

  /**
   * Handles toggling a player's ready status in a game room
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the player toggling ready status
   * @param {string} roomId - Unique identifier of the game room
   *
   * @returns {void}
   *
   * @description
   * - Toggles player's ready state
   * - Checks if all players are ready to start the game
   * - Initializes game state when both players are ready
   * - Broadcasts updated room state
   */
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

  /**
   * Handles rematch request from a player in a finished game room
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} userId - Unique identifier of the player requesting rematch
   * @param {string} roomId - Unique identifier of the game room
   *
   * @returns {void}
   *
   * @description
   * - Validates rematch request for finished game
   * - Marks player as ready for rematch
   * - Resets game if all players are ready
   * - Broadcasts updated room state
   */
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

  /**
   * Retrieves and sends the current state of a specific game room
   *
   * @param {Socket} socket - The client's active socket connection
   * @param {string} roomId - Unique identifier of the game room to retrieve
   *
   * @returns {void}
   *
   * @description
   * - Fetches game room state from store
   * - Emits room state if found
   * - Sends error if room does not exist
   */
  private handleGetRoom(socket: Socket, roomId: string) {
    const gameRoom = this.store.getGameRoom(roomId);
    if (gameRoom) {
      socket.emit("game:room_state", gameRoom);
    } else {
      socket.emit("game:error", "Room not found");
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
    if (room) {
      this.handleLeaveRoom(socket, userId, room.id);
    }
  }

  /**
   * Checks the game result for a Tic-Tac-Toe board
   * Determines if there's a win or a draw
   *
   * @param {(string | null)[]} board - The current game board state
   * @returns {GameResult} An object indicating game result status
   */
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

  /**
   * Resets the game room to its initial state
   *
   * @param {string} roomId - Unique identifier of the game room to reset
   *
   * @returns {void}
   *
   * @description
   * - Resets game room status to "waiting"
   * - Clears the game board
   * - Removes current turn and winner information
   * - Resets player ready status
   * - Updates game room in store
   * - Broadcasts updated room state to all players
   * - Updates global room list
   */
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
