import { Server as SocketIOServer, Socket } from "socket.io";
import { BaseService } from "./baseService";

import { SharedStore } from "../store/sharedStore";

import { UserStatus } from "../../types";
import { ServiceRegistry } from "../serviceRegistry";
import { GameService } from "./gameService";

export class UserService extends BaseService {
  private gameService: GameService;

  constructor(io: SocketIOServer) {
    super(io, "userService");
    this.store = SharedStore.getInstance();
  }

  setupEvents(socket: Socket) {
    this.gameService =
      ServiceRegistry.getInstance().get<GameService>("gameService");
    const userId = socket.data.userId;

    socket.on("user:status_update", ({ status }: { status: UserStatus }) => {
      this.updateUserStatus(userId, status);
    });

    socket.on("heartbeat", () => {
      this.updateUserHeartbeat(userId);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.username}`);
      this.disconnectUser(userId);
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

  public async updateUserStatus(userId: string, status: UserStatus) {
    const user = this.store.getUser(userId);
    if (user) {
      this.store.updateUser(userId, {
        status,
        lastActive: new Date(),
      });

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
