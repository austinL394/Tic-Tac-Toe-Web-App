// src/socketio/socketServer.ts
import { Server as SocketIOServer, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

interface ConnectedUser {
  socketId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  status: "online" | "away";
  lastActive: Date;
}

interface TokenPayload {
  id: string;
  username: string;
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userRepository = AppDataSource.getRepository(User);
  private readonly sessionTimeout: number = 1000 * 60 * 30; // 30 minutes

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initialize();
    this.startSessionMonitoring();
  }
  private verifyToken(token: string): TokenPayload | null {
    try {
      if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  private startSessionMonitoring() {
    setInterval(() => {
      const now = new Date();
      this.connectedUsers.forEach((user, userId) => {
        const timeDiff = now.getTime() - user.lastActive.getTime();
        if (timeDiff > this.sessionTimeout) {
          this.disconnectUser(userId);
        } else if (timeDiff > 60000) {
          // 1 minute
          this.updateUserStatus(userId, "away");
        }
      });
    }, 30000); // Check every 30 seconds
  }

  private async updateUserStatus(userId: string, status: "online" | "away") {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.status = status;
      this.connectedUsers.set(userId, user);

      this.broadcastUserList();
    }
  }

  private async disconnectUser(userId: string) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      const socket = this.io.sockets.sockets.get(user.socketId);
      if (socket) {
        socket.disconnect(true);
      }

      this.connectedUsers.delete(userId);
      this.broadcastUserList();
    }
  }

  private broadcastUserList() {
    const userList = Array.from(this.connectedUsers.values()).map((user) => ({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      status: user.status,
    }));
    this.io.emit("user_list_update", userList);
  }

  private initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = this.verifyToken(token);
        if (!decoded) {
          return next(new Error("Invalid authentication token"));
        }

        // Get user data from database
        const user = await this.userRepository.findOne({
          where: { id: decoded.id },
        });

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.data.userId = decoded.id;
        socket.data.username = user.username;
        socket.data.firstName = user.firstName;
        socket.data.lastName = user.lastName;
        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });

    this.io.on("connection", async (socket) => {
      const userId = socket.data.userId;
      const username = socket.data.username;
      const firstName = socket.data.firstName;
      const lastName = socket.data.lastName;

      // Add to connected users
      this.connectedUsers.set(userId, {
        socketId: socket.id,
        firstName,
        lastName,
        userId,
        username,
        status: "online",
        lastActive: new Date(),
      });

      console.log("@@@ -> connectedUsers", this.connectedUsers.values());

      // Update user status in database
      await this.updateUserStatus(userId, "online");

      // Send initial data to connected user
      socket.emit("connect_status", {
        status: "connected",
        userId,
        username,
      });

      // Handle heartbeat
      socket.on("heartbeat", () => {
        const user = this.connectedUsers.get(userId);
        if (user) {
          user.lastActive = new Date();
          user.status = "online";
          this.connectedUsers.set(userId, user);
          this.broadcastUserList();
        }
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        await this.disconnectUser(userId);
        console.log(`User disconnected: ${userId}`);
      });
    });
  }

  // Public methods for external use
  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export default SocketService;
