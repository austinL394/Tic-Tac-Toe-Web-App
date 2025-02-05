import { ConnectedUser, GameRoom, UserStatus } from "../../types";

export class SharedStore {
  private static instance: SharedStore;
  private users: Map<string, ConnectedUser> = new Map();
  private games: Map<string, GameRoom> = new Map();

  private constructor() {}

  static getInstance(): SharedStore {
    if (!SharedStore.instance) {
      SharedStore.instance = new SharedStore();
    }
    return SharedStore.instance;
  }

  addUser(user: ConnectedUser): void {
    this.users.set(user.userId, user);
  }

  getUser(userId: string): ConnectedUser | undefined {
    return this.users.get(userId);
  }

  updateUser(userId: string, updates: Partial<ConnectedUser>): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, ...updates });
    }
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
  }

  getAllUsers(): ConnectedUser[] {
    return Array.from(this.users.values());
  }

  isUserConnected(userId: string): boolean {
    return this.users.has(userId);
  }

  getUserStatus(userId: string): UserStatus | null {
    return this.users.get(userId)?.status || null;
  }

  setGameRoom(roomId: string, gameRoom: GameRoom) {
    this.games.set(roomId, gameRoom);
  }

  getGameRoom(roomId: string): GameRoom | undefined {
    return this.games.get(roomId);
  }

  removeGameRoom(roomId: string) {
    this.games.delete(roomId);
  }

  getAllGameRooms(): GameRoom[] {
    return Array.from(this.games.values());
  }
}
