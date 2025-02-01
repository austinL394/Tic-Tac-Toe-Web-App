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

export interface Room {
  id: string;
  players: {
    [key: string]: {
      userId: string;
      symbol: "X" | "O";
    };
  };
  board: Array<string | null>;
  currentTurn?: string; // userId of current player
  status: "waiting" | "playing" | "finished";
  winner?: string;
}
