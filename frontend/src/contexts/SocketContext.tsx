import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  sendMessage: (event: string, data: any) => void;
}

interface OnlineUser {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'offline';
  lastActive: Date;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [onlineUsers, setOnlineUsers] = React.useState<OnlineUser[]>([]);
  const { token, user, logout } = useAuthStore();

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;

    const connectSocket = () => {
      if (!token || !user || socketRef.current?.connected) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);

        // Start heartbeat
        heartbeatInterval = setInterval(() => {
          socket.emit('heartbeat');
        }, 25000); // 25 seconds
      });

      socket.on('connect_status', (data) => {
        console.log('Connection status:', data);
      });

      socket.on('user_list_update', (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      socket.on('force_disconnect', ({ reason, message }) => {
        console.log('Forced disconnect:', message);
        if (reason === 'session_timeout') {
          logout();
        }
        socket.disconnect();
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        clearInterval(heartbeatInterval);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Custom error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return socket;
    };

    const socket = connectSocket();

    // Cleanup function
    return () => {
      clearInterval(heartbeatInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user]);

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket is not connected');
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    sendMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
