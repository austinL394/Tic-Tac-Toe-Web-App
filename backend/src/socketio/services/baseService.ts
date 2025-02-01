import { Server as SocketIOServer } from "socket.io";
import { ConnectedUser } from "../../types";
// BaseService.ts
export abstract class BaseService {
  constructor(
    protected io: SocketIOServer,
    protected connectedUsers: Map<string, ConnectedUser>
  ) {}

  protected broadcastUserList() {
    const userList = Array.from(this.connectedUsers.values()).map((user) => ({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      status: user.status,
    }));
    this.io.emit("user_list_update", userList);
  }
}
