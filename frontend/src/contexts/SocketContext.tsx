import { useAuthStore } from '@/stores/authStore';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  connect: () => void;
  disconnect: () => void;
}

interface OnlineUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  rating: number;
  status: 'online' | 'away' | 'in-game';
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [onlineUsers, setOnlineUsers] = React.useState<OnlineUser[]>([]);
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated); // Custom hook to manage auth state
  const token = useAuthStore((store) => store.token);

  const connect = React.useCallback(() => {
    if (socketRef.current?.connected || !isAuthenticated) return;

    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat');
      }, 25000);

      // Clean up heartbeat on disconnect
      socket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
      });
    });

    socket.on('connect_status', (data) => {
      console.log('Connection status:', data);
    });

    socket.on('user_list_update', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
  }, [isAuthenticated]);

  const disconnect = React.useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, []);

  // Connect when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('@@ try connecting socket.io');
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    connect,
    disconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Create AuthContext to manage authentication state
interface AuthContextType {
  isAuthenticated: boolean;
  getToken: () => string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return !!localStorage.getItem('token');
  });

  const getToken = React.useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const login = React.useCallback((token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }, []);

  const value = {
    isAuthenticated,
    getToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
