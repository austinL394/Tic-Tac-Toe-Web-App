import { Dispatch, SetStateAction } from 'react';
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
  createRoom: (name: string) => void;
  getRoomList: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  makeMove: (position: number) => void;
  logoutSocketSession: () => void;
  updateCode: (newCode: string) => void;
  kickPlayer: (playerId: string) => void;
  requestJoinRoom: (roomId: string) => void;
  handleGameJoinRequestResponse: (roomId: string, confirm: boolean) => void;
}

interface ToastContext {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export interface SocketEventHandlers {
  setOnlineUsers: Dispatch<SetStateAction<OnlineUser[]>>;
  setCurrentSession: Dispatch<SetStateAction<UserSession | null>>;
  setRooms: Dispatch<SetStateAction<GameRoom[]>>;
  setCurrentRoom: Dispatch<SetStateAction<GameRoom | null>>;
  setGameError: Dispatch<SetStateAction<string | null>>;
  setIsConnected: Dispatch<SetStateAction<boolean>>;
  navigate: (path: string) => void;
  user: {
    id: string;
    username: string;
  };
  toast: ToastContext;
  handleGameJoinRequest: (userId: string, roomId: string) => void;
  handleGameJoinRequestResponse: (roomId: string, responseType: boolean) => void;
}

export interface UserEventHandlers {
  setOnlineUsers: Dispatch<SetStateAction<OnlineUser[]>>;
  setCurrentSession: Dispatch<SetStateAction<UserSession | null>>;
  user: {
    id: string;
    username: string;
  };
  toast: ToastContext;
  logoutSession: () => void;
}

export interface GameRoom {
  id: string;
  hostId: string;
  name: string;
  players: {
    [userId: string]: {
      symbol: 'X' | 'O';
      username: string;
      firstName: string;
      lastName: string;
    };
  };
  status: 'waiting' | 'playing' | 'finished';
  board: Array<string | null>;
  currentTurn?: string;
  winner?: string;
  content?: string;
}
