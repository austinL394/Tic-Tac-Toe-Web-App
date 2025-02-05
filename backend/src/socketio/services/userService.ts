import { Server as SocketIOServer, Socket } from "socket.io";
import { BaseService } from "./baseService";

import { SharedStore } from "../store/sharedStore";

import { UserStatus } from "../../types";

/**
 * UserService manages user-related socket events and interactions
 * Handles user connection, status updates, heartbeats, and disconnections
 */
export class UserService extends BaseService {
  constructor(io: SocketIOServer) {
    super(io, "userService");
    this.store = SharedStore.getInstance();
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
      console.log(`User disconnected: ${socket.data.username}`);
      this.disconnectUser(userId);
    });
  }

  /**
   * Handles new user connection
   * Adds user to the shared store and sets initial online status
   *
   * @param {Socket} socket - The newly connected socket
   * @returns {Promise<void>}
   */
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

  /**
   * Updates a user's status in the shared store
   * Broadcasts updated user list after status change
   *
   * @param {string} userId - Unique identifier of the user
   * @param {UserStatus} status - New status for the user
   * @returns {Promise<void>}
   */
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

  /**
   * Updates user's last active timestamp on heartbeat
   * Prevents updating for users in-game
   *
   * @param {string} userId - Unique identifier of the user
   */
  private updateUserHeartbeat(userId: string) {
    const user = this.store.getUser(userId);
    if (user && user.status !== UserStatus.INGAME) {
      this.store.updateUser(userId, {
        lastActive: new Date(),
      });
    }
  }

  /**
   * Handles user disconnection
   * Removes user from store and broadcasts updated user list
   *
   * @param {string} userId - Unique identifier of the user
   * @returns {Promise<void>}
   */
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

  /**
   * Broadcasts the current list of users to all connected clients
   * Triggered after user list modifications
   */
  protected broadcastUserList() {
    this.io.emit("user_list_update", this.store.getAllUsers());
  }
}
