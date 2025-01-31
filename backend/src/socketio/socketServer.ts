import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
  lastActive: Date;
  status: 'online' | 'away' | 'offline';
}

interface TokenPayload {
  id: string;
  username: string;
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private readonly sessionTimeout: number = 1000 * 60 * 30; // 30 minutes
  private readonly heartbeatInterval: number = 1000 * 30; // 30 seconds
  private readonly userRepository = AppDataSource.getRepository(User);

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 10000, // 10 seconds
      pingInterval: 25000, // 25 seconds
    });

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
        
        // Update user status based on activity
        if (timeDiff > this.sessionTimeout) {
          this.disconnectUser(userId, "session_timeout");
        } else if (timeDiff > this.heartbeatInterval) {
          user.status = 'away';
          this.connectedUsers.set(userId, user);
          this.broadcastUserList();
        }
      });
    }, this.heartbeatInterval);
  }

  private async disconnectUser(userId: string, reason: string) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      const socket = this.io.sockets.sockets.get(user.socketId);
      if (socket) {
        // Emit disconnect event to the specific user
        socket.emit("force_disconnect", { 
          reason,
          message: this.getDisconnectMessage(reason)
        });
        socket.disconnect(true);
      }

      // Update user status in database
      await this.updateUserStatus(userId, 'offline');
      
      // Remove from connected users and broadcast update
      this.connectedUsers.delete(userId);
      this.broadcastUserList();
      
      // Log disconnect
      console.log(`User disconnected: ${userId}, Reason: ${reason}`);
    }
  }

  private getDisconnectMessage(reason: string): string {
    const messages = {
      session_timeout: "Your session has timed out due to inactivity",
      user_logout: "You have been logged out successfully",
      server_shutdown: "Server is shutting down",
      force_logout: "You have been logged out by an administrator",
      default: "Disconnected from server"
    };
    return messages[reason] || messages.default;
  }

  private async updateUserStatus(userId: string, status: 'online' | 'away' | 'offline') {
    try {
      await this.userRepository.update(userId, { status });
    } catch (error) {
      console.error(`Failed to update user status: ${error.message}`);
    }
  }

  private broadcastUserList() {
    const userList = Array.from(this.connectedUsers.values()).map(user => ({
      userId: user.userId,
      username: user.username,
      status: user.status,
      lastActive: user.lastActive
    }));
    this.io.emit("user_list_update", userList);
  }

  private async handleConnection(socket: Socket, userId: string, username: string) {
    // Update user status in database
    await this.updateUserStatus(userId, 'online');

    // Add to connected users
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      userId,
      username,
      lastActive: new Date(),
      status: 'online'
    });

    // Broadcast updated user list
    this.broadcastUserList();

    // Send initial data to connected user
    socket.emit("connect_status", {
      status: "connected",
      message: "Connected to server",
      userId,
      username,
      connectedUsers: Array.from(this.connectedUsers.values())
    });
  }

  private initialize() {
    // Middleware for authentication
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
        socket.data.username = decoded.username;
        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });

    // Handle socket connections
    this.io.on("connection", async (socket) => {
      const userId = socket.data.userId;
      const username = socket.data.username;

      console.log(`User connected: ${username} (${userId})`);

      // Handle new connection
      await this.handleConnection(socket, userId, username);

      // Handle heartbeat
      socket.on("heartbeat", () => {
        const user = this.connectedUsers.get(userId);
        if (user) {
          user.lastActive = new Date();
          user.status = 'online';
          this.connectedUsers.set(userId, user);
          this.broadcastUserList();
        }
      });

      // Handle status update
      socket.on("status_update", async (status: 'online' | 'away') => {
        const user = this.connectedUsers.get(userId);
        if (user) {
          user.status = status;
          this.connectedUsers.set(userId, user);
          await this.updateUserStatus(userId, status);
          this.broadcastUserList();
        }
      });

      // Handle manual logout
      socket.on("logout", async () => {
        await this.disconnectUser(userId, "user_logout");
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        await this.disconnectUser(userId, "disconnect");
      });

      // Handle errors
      socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
        socket.emit("error", { message: "An error occurred" });
      });
    });
  }

  // Public methods for external use
  public broadcastMessage(event: string, data: any, excludeUserId?: string) {
    if (excludeUserId) {
      const user = this.connectedUsers.get(excludeUserId);
      if (user) {
        this.io.except(user.socketId).emit(event, data);
      }
    } else {
      this.io.emit(event, data);
    }
  }

  public sendToUser(userId: string, event: string, data: any) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }

  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public async disconnectAll(reason: string = "server_shutdown") {
    const disconnectPromises = Array.from(this.connectedUsers.keys()).map(userId =>
      this.disconnectUser(userId, reason)
    );
    await Promise.all(disconnectPromises);
  }
}

export default SocketService;