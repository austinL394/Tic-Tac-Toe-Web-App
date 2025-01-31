// src/socketio/socketServer.ts
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import * as jwt from "jsonwebtoken";
import { payload } from "../dto/user.dto";
import * as dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.initialize();
  }

  private verifyToken(token: string): payload | null {
    try {
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }
      return jwt.verify(token, JWT_SECRET) as payload;
    } catch (error) {
      return null;
    }
  }

  private initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication token is required"));
        }

        const decoded = this.verifyToken(token);
        if (!decoded) {
          return next(new Error("Invalid authentication token"));
        }

        socket.data.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      this.connectedUsers.set(userId, socket.id);

      console.log(`User connected: ${userId}`);

      // Send welcome message
      socket.emit("connect_status", {
        status: "connected",
        message: "Connected to server",
        userId: userId,
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
      });

      // Example: Handle custom events
      socket.on("client_message", (data) => {
        console.log(`Message from ${userId}:`, data);
        // Broadcast to other users or handle the message
        this.broadcast(
          "new_message",
          {
            userId: userId,
            message: data,
          },
          userId
        );
      });
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public broadcast(event: string, data: any, excludeUserId?: string) {
    if (excludeUserId) {
      const socketId = this.connectedUsers.get(excludeUserId);
      if (socketId) {
        this.io.except(socketId).emit(event, data);
      }
    } else {
      this.io.emit(event, data);
    }
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export default SocketService;
