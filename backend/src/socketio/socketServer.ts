import { Server as SocketIOServer, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as dotenv from "dotenv";
import { UserStatus } from "../types";

dotenv.config();
const { JWT_SECRET = "password_secret" } = process.env;

interface ConnectedUser {
  socketId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  status: UserStatus;
  lastActive: Date;
  rating: number;
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
  private readonly autoAwayTimeout: number = 1000 * 60 * 5; // 5 minutes

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
        } else if (
          timeDiff > this.autoAwayTimeout &&
          user.status === UserStatus.ONLINE
        ) {
          this.updateUserStatus(userId, UserStatus.BUSY);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  private async updateUserStatus(userId: string, status: UserStatus) {
    const user = this.connectedUsers.get(userId);

    if (user) {
      user.status = status;
      user.lastActive = new Date();
      this.connectedUsers.set(userId, user);

      // Emit status change event to all clients
      this.io.emit("user:status_changed", {
        userId,
        status,
      });

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
      rating: user.rating,
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
      const rating = socket.data.rating;

      // Add to connected users
      this.connectedUsers.set(userId, {
        socketId: socket.id,
        firstName,
        lastName,
        userId,
        username,
        rating,
        status: UserStatus.ONLINE,
        lastActive: new Date(),
      });

      console.log("User connected:", username);

      // Update user status in database and broadcast
      await this.updateUserStatus(userId, UserStatus.ONLINE);

      // Send initial data to connected user
      socket.emit("connect_status", {
        status: "connected",
        userId,
        username,
      });

      // Handle status updates
      socket.on("user:status_update", ({ status }: { status: UserStatus }) => {
        this.updateUserStatus(userId, status);
      });

      // Handle heartbeat
      socket.on("heartbeat", () => {
        const user = this.connectedUsers.get(userId);
        if (user && user.status !== UserStatus.INGAME) {
          user.lastActive = new Date();
          this.connectedUsers.set(userId, user);
        }
      });

      // Handle game status
      socket.on("game:start", () => {
        this.updateUserStatus(userId, UserStatus.INGAME);
      });

      socket.on("game:end", () => {
        this.updateUserStatus(userId, UserStatus.ONLINE);
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        await this.disconnectUser(userId);
        console.log(`User disconnected: ${username}`);
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

  public getUserStatus(userId: string): UserStatus | null {
    return this.connectedUsers.get(userId)?.status || null;
  }

  public updateGameStatus(userId: string, inGame: boolean) {
    this.updateUserStatus(
      userId,
      inGame ? UserStatus.INGAME : UserStatus.ONLINE
    );
  }
}

export default SocketService;
