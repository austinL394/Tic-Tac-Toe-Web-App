export enum UserStatus {
  ONLINE = "online",
  BUSY = "busy",
  INGAME = "in-game",
}

export interface ConnectedUser {
  socketId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  status: UserStatus;
  lastActive: Date;
}
