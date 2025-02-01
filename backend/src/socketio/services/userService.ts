import { BaseService } from "./baseService";
// UserService.ts
import { Server as SocketIOServer, Socket } from "socket.io";
import { ConnectedUser, UserStatus } from "../../types";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";

export class UserService extends BaseService {
  private readonly sessionTimeout: number = 1000 * 60 * 30; // 30 minutes
  private readonly autoAwayTimeout: number = 1000 * 60 * 5; // 5 minutes
  private userRepository = AppDataSource.getRepository(User);

  constructor(io: SocketIOServer, connectedUsers: Map<string, ConnectedUser>) {
    super(io, connectedUsers);
    this.startSessionMonitoring();
  }

  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    // Handle status updates
    socket.on("user:status_update", ({ status }: { status: UserStatus }) => {
      this.updateUserStatus(userId, status);
    });

    // Handle heartbeat
    socket.on("heartbeat", () => {
      this.updateUserHeartbeat(userId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      this.disconnectUser(userId);
      console.log(`User disconnected: ${socket.data.username}`);
    });
  }

  async handleConnection(socket: Socket) {
    const { userId, username, firstName, lastName } = socket.data;

    // Add to connected users
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      firstName,
      lastName,
      userId,
      username,
      status: UserStatus.ONLINE,
      lastActive: new Date(),
    });

    console.log("User connected:", username);

    // Update status and send initial data
    await this.updateUserStatus(userId, UserStatus.ONLINE);
    socket.emit("connect_status", {
      status: "connected",
      userId,
      username,
    });
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
    }, 30000);
  }

  public async updateUserStatus(userId: string, status: UserStatus) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.status = status;
      user.lastActive = new Date();
      this.connectedUsers.set(userId, user);

      this.io.emit("user:status_changed", { userId, status });
      this.broadcastUserList();
    }
  }

  private updateUserHeartbeat(userId: string) {
    const user = this.connectedUsers.get(userId);
    if (user && user.status !== UserStatus.INGAME) {
      user.lastActive = new Date();
      this.connectedUsers.set(userId, user);
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
}
