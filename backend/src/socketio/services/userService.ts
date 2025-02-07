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
      this.log(`Socket disconnected: ${socket.data.username}`);
      this.handleSocketDisconnect(userId, socket.id);
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
    const existingUser = this.store.getUser(userId);

    if (existingUser) {
      // User exists, add new socket ID to their socketIds array
      this.store.updateUser(userId, {
        socketIds: [...existingUser.socketIds, socket.id],
        lastActive: new Date(),
      });
    } else {
      // New user, create with initial socket ID
      this.store.addUser({
        socketIds: [socket.id],
        firstName,
        lastName,
        userId,
        username,
        status: UserStatus.ONLINE,
        lastActive: new Date(),
      });
    }

    this.log("Socket connected for user:", username);
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
  private async handleSocketDisconnect(userId: string, socketId: string) {
    const user = this.store.getUser(userId);
    if (!user) return;

    // Remove the disconnected socket ID
    const updatedSocketIds = user.socketIds.filter((id) => id !== socketId);

    if (updatedSocketIds.length === 0) {
      // No more active sockets for this user, remove them completely
      this.store.removeUser(userId);
    } else {
      // Update the user with remaining socket IDs
      this.store.updateUser(userId, {
        socketIds: updatedSocketIds,
      });
    }

    this.broadcastUserList();
  }

  /**
   * Broadcasts the current list of users to all connected clients
   * Triggered after user list modifications
   */
  protected broadcastUserList() {
    this.io.emit("user_list_update", this.store.getAllUsers());
  }
}
