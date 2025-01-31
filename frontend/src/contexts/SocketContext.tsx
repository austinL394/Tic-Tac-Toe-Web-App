import { useAuthStore } from '@/stores/authStore';
import { UserStatus } from '@/types';
import React, { createContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  currentSession: UserSession | null;
  connect: () => void;
  disconnect: () => void;
  updateUserStatus: (status: UserStatus) => void;
}

interface OnlineUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  rating: number;
  status: UserStatus;
}

interface UserSession {
  userId: string;
  status: UserStatus;
  lastActivity: Date;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [onlineUsers, setOnlineUsers] = React.useState<OnlineUser[]>([]);
  const [currentSession, setCurrentSession] = React.useState<UserSession | null>(null);

  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  const token = useAuthStore((store) => store.token);
  const user = useAuthStore((store) => store.user);

  const updateUserStatus = React.useCallback((status: UserStatus) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('user:status_update', { status });

    // Update local session state
    setCurrentSession((prev) => (prev ? { ...prev, status, lastActivity: new Date() } : null));
  }, []);

  const handleUserStatusUpdate = React.useCallback(
    (data: { userId: string; status: UserStatus }) => {
      setOnlineUsers((prevUsers) =>
        prevUsers.map((user) => (user.userId === data.userId ? { ...user, status: data.status } : user)),
      );

      // Update current session if it's the current user
      if (data.userId === user?.id) {
        setCurrentSession((prev) => (prev ? { ...prev, status: data.status, lastActivity: new Date() } : null));
      }
    },
    [user?.id],
  );

  const connect = React.useCallback(() => {
    if (socketRef.current?.connected || !isAuthenticated || !token || !user) return;

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

      // Initialize current session
      setCurrentSession({
        userId: user.id,
        status: UserStatus.ONLINE,
        lastActivity: new Date(),
      });

      // Start heartbeat
      const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat');
      }, 5000);

      // Clean up heartbeat on disconnect
      socket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
      });
    });

    socket.on('user_list_update', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    socket.on('user:status_changed', handleUserStatusUpdate);

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setCurrentSession(null);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setCurrentSession(null);
    });

    // Auto-away detection
    const autoAwayTimeout = setTimeout(() => {
      if (currentSession?.status === 'online') {
        updateUserStatus('away');
      }
    }, 300000); // 5 minutes

    return () => {
      clearTimeout(autoAwayTimeout);
    };
  }, [isAuthenticated, token, user, handleUserStatusUpdate, updateUserStatus]);

  const disconnect = React.useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
      setCurrentSession(null);
    }
  }, []);

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
    currentSession,
    connect,
    disconnect,
    updateUserStatus,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
