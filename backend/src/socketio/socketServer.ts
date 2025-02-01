import { Server as SocketIOServer } from "socket.io";
import { ConnectedUser, UserStatus } from "../types";
import { AuthMiddleware } from "./middleware/authMiddleware";
import { UserService } from "./services/userService";

import * as dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

// types.ts
export interface TokenPayload {
  id: string;
  username: string;
}

export class SocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userService: UserService;
  private authMiddleware: AuthMiddleware;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.authMiddleware = new AuthMiddleware(JWT_SECRET);
    this.userService = new UserService(io, this.connectedUsers);
    this.initialize();
  }

  private initialize() {
    // Setup authentication middleware
    this.io.use((socket, next) =>
      this.authMiddleware.authenticate(socket, next)
    );

    // Handle connections
    this.io.on("connection", async (socket) => {
      await this.userService.handleConnection(socket);
      this.userService.setupEvents(socket);
    });
  }

  // Public methods
  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getUserStatus(userId: string): UserStatus | null {
    return this.connectedUsers.get(userId)?.status || null;
  }

  public updateGameStatus(userId: string, inGame: boolean) {
    this.userService.updateUserStatus(
      userId,
      inGame ? UserStatus.INGAME : UserStatus.ONLINE
    );
  }
}

export default SocketServer;
