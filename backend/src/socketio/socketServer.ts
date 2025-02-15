import { Server as SocketIOServer } from "socket.io";
import { AuthMiddleware } from "./middleware/auth-middleware";
import { UserService } from "./services/userService";

import * as dotenv from "dotenv";

import { SharedStore } from "./store/sharedStore";
import { GameService } from "./services/gameService";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

export interface TokenPayload {
  id: string;
  username: string;
}

/**
 * SocketServer: Central configuration and initialization for WebSocket server
 * 
 * Key Responsibilities:
 * - Socket.IO server configuration
 * - Authentication middleware setup
 * - Service event registration
 * - Connection lifecycle management
 * 
 */
export class SocketServer {
  private io: SocketIOServer;
  private store: SharedStore;
  private userService: UserService;
  private gameService: GameService;
  private authMiddleware: AuthMiddleware;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.store = SharedStore.getInstance();
    this.authMiddleware = new AuthMiddleware(JWT_SECRET);
    this.userService = new UserService(io);
    this.gameService = new GameService(io);
    this.initialize();
  }

  private initialize() {
    this.io.use((socket, next) =>
      this.authMiddleware.authenticate(socket, next)
    );

    this.io.on("connection", async (socket) => {
      await this.userService.handleConnection(socket);
      this.userService.setupEvents(socket);
      this.gameService.setupEvents(socket);
    });
  }
}

export default SocketServer;
