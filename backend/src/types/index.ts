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
  roomId?: string;
}

export interface GameRoom {
  id: string;
  hostId: string;
  players: {
    [userId: string]: {
      symbol: "X" | "O";
      username: string;
      firstName: string;
      lastName: string;
      ready: boolean;
    };
  };
  status: "waiting" | "playing" | "finished";
  board: Array<string | null>;
  currentTurn?: string;
  winner?: string;
}
