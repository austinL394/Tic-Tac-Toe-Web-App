import { Socket } from 'socket.io-client';

export enum UserStatus {
  ONLINE = 'online',
  BUSY = 'busy',
  INGAME = 'in-game',
}

export interface OnlineUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

export interface UserSession {
  userId: string;
  status: UserStatus;
  lastActivity: Date;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  currentSession: UserSession | null;
  rooms: GameRoom[];
  currentRoom: GameRoom | null;
  gameError: string | null;
  connect: () => void;
  disconnect: () => void;
  updateUserStatus: (status: UserStatus) => void;
  createRoom: () => void;
  getRoomList: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  toggleReady: (roomId: string) => void;
  makeMove: (position: number) => void;
}

export interface SocketEventHandlers {
  setOnlineUsers: React.Dispatch<React.SetStateAction<OnlineUser[]>>;
  setCurrentSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  setRooms: React.Dispatch<React.SetStateAction<GameRoom[]>>;
  setCurrentRoom: React.Dispatch<React.SetStateAction<GameRoom | null>>;
  setGameError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: (path: string) => void;
  user: {
    id: string;
    username: string;
  };
}

export interface UserEventHandlers {
  setOnlineUsers: React.Dispatch<React.SetStateAction<OnlineUser[]>>;
  setCurrentSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  user: {
    id: string;
    username: string;
  };
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
