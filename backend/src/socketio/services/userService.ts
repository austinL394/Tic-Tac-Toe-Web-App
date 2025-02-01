import { Server as SocketIOServer, Socket } from "socket.io";
import { BaseService } from "./baseService";

import { AppDataSource } from "../../data-source";

import { User } from "../../entity/User";
import { SharedStore } from "../store/sharedStore";

import { UserStatus } from "../../types";

export class UserService extends BaseService {
  private readonly sessionTimeout: number = 1000 * 60 * 30;
  private readonly autoAwayTimeout: number = 1000 * 60 * 5;
  private userRepository = AppDataSource.getRepository(User);
  F;

  constructor(io: SocketIOServer) {
    super(io);
    this.store = SharedStore.getInstance();
    this.startSessionMonitoring();
  }

  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    socket.on("user:status_update", ({ status }: { status: UserStatus }) => {
      this.updateUserStatus(userId, status);
    });

    socket.on("heartbeat", () => {
      this.updateUserHeartbeat(userId);
    });

    socket.on("disconnect", () => {
      this.disconnectUser(userId);
      console.log(`User disconnected: ${socket.data.username}`);
    });
  }

  async handleConnection(socket: Socket) {
    const { userId, username, firstName, lastName } = socket.data;

    this.store.addUser({
      socketId: socket.id,
      firstName,
      lastName,
      userId,
      username,
      status: UserStatus.ONLINE,
      lastActive: new Date(),
    });

    console.log("User connected:", username);
    await this.updateUserStatus(userId, UserStatus.ONLINE);
  }

  private startSessionMonitoring() {
    setInterval(() => {
      const now = new Date();
      this.store.getAllUsers().forEach((user) => {
        const timeDiff = now.getTime() - user.lastActive.getTime();
        if (timeDiff > this.sessionTimeout) {
          this.disconnectUser(user.userId);
        } else if (
          timeDiff > this.autoAwayTimeout &&
          user.status === UserStatus.ONLINE
        ) {
          this.updateUserStatus(user.userId, UserStatus.BUSY);
        }
      });
    }, 30000);
  }

  public async updateUserStatus(userId: string, status: UserStatus) {
    const user = this.store.getUser(userId);
    if (user) {
      this.store.updateUser(userId, {
        status,
        lastActive: new Date(),
      });

      this.io.emit("user:status_changed", { userId, status });
      this.broadcastUserList();
    }
  }

  private updateUserHeartbeat(userId: string) {
    const user = this.store.getUser(userId);
    if (user && user.status !== UserStatus.INGAME) {
      this.store.updateUser(userId, {
        lastActive: new Date(),
      });
    }
  }

  private async disconnectUser(userId: string) {
    const user = this.store.getUser(userId);
    if (user) {
      const socket = this.io.sockets.sockets.get(user.socketId);
      if (socket) {
        socket.disconnect(true);
      }

      this.store.removeUser(userId);
      this.broadcastUserList();
    }
  }

  protected broadcastUserList() {
    this.io.emit("user_list_update", this.store.getAllUsers());
  }
}
