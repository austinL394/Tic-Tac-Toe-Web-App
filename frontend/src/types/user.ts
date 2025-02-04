export enum UserStatus {
    ONLINE = 'online',
    BUSY = 'busy',
    INGAME = 'in-game',
  }
  
  export interface GameRoom {
    id: string;
    hostId: string;
    players: {
      [userId: string]: {
        symbol: 'X' | 'O';
        username: string;
        firstName: string;
        lastName: string;
        ready: boolean;
      };
    };
    status: 'waiting' | 'playing' | 'finished';
    board: Array<string | null>;
    currentTurn?: string;
    winner?: string;
  }
  
  export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  