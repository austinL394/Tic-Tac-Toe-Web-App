export enum UserStatus {
  ONLINE = "online",
  BUSY = "busy",
  INGAME = "in-game",
}

export interface ConnectedUser {
  socketIds: string[];
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
  name: string
  players: {
    [userId: string]: {
      username: string;
      firstName: string;
      lastName: string;
    };
  };
  status: "waiting" | "playing" | "finished";
  board: Array<string | null>;
  currentTurn?: string;
  winner?: string;
  content?: string;
  createdAt: Date;
}

export interface MovePayload {
  roomId: string;
  position: number;
}
