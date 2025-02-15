import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

import { setupUserEvents } from '@/services/socket/events/userEvents';
import { setupGameEvents } from '@/services/socket/events/gameEvents';

import { SocketContextType, OnlineUser, UserSession, UserStatus, GameRoom } from '@/types';
import { useToast } from './ToastrContext';
import { MainSocketService } from '@/services/socket/mainSocketService';

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const socketService = useRef<MainSocketService | null>(null);
  const toast = useToast();
  const logout = useAuthStore((store) => store.logout);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);

  const { isAuthenticated, token, user } = useAuthStore();

  const logoutSession = () => {
    disconnect();
    logout();
  };

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !isAuthenticated || !token || !user) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    socketService.current = new MainSocketService(socket);

    const handlers = {
      setOnlineUsers,
      setCurrentSession,
      setRooms,
      setCurrentRoom,
      setGameError,
      setIsConnected,
      navigate,
      user,
      toast,
      logoutSession,
    };

    socket.on('connect', () => {
      setIsConnected(true);
      setCurrentSession({
        userId: user.id,
        status: UserStatus.ONLINE,
        lastActivity: new Date(),
      });

      toast.showSuccess('Connected to server');

      // Setup heartbeat
      const heartbeatInterval = setInterval(() => {
        socketService.current?.sendHeartbeat();
      }, 5000);

      socket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
        navigate('/dashboard');
      });
    });

    // Setup event handlers
    const cleanupUserEvents = setupUserEvents(socket, handlers);
    const cleanupGameEvents = setupGameEvents(socket, handlers);

    // Connection error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setCurrentSession(null);
      setGameError('Connection error');
      toast.showError(`Connection error: ${error.message}`);
      if (error.message === 'Invalid authentication token') {
        logout();
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      setIsConnected(false);
      setCurrentSession(null);
      setRooms([]);
      setCurrentRoom(null);
      setGameError(null);
      navigate('/');
      toast.showWarning('Disconnected from server');
    });

    // Auto-away feature
    const autoAwayTimeout = setTimeout(() => {
      if (currentSession?.status === UserStatus.ONLINE) {
        socketService.current?.user.updateUserStatus(UserStatus.BUSY);
      }
    }, 300000); // 5 minutes

    return () => {
      clearTimeout(autoAwayTimeout);
      cleanupUserEvents();
      cleanupGameEvents();
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [isAuthenticated, token, user, navigate, toast]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      socketService.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
      setCurrentSession(null);
      setRooms([]);
      setCurrentRoom(null);
      setGameError(null);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    currentSession,
    rooms,
    currentRoom,
    gameError,
    connect,
    disconnect,
    updateUserStatus: (status) => socketService.current?.user.updateUserStatus(status),
    createRoom: () => socketService.current?.game.createRoom(),
    getRoomList: () => socketService.current?.game.getRoomList(),
    joinRoom: (roomId) => socketService.current?.game.joinRoom(roomId),
    leaveRoom: (roomId) => socketService.current?.game.leaveRoom(roomId),
    toggleReady: (roomId) => socketService.current?.game.toggleReady(roomId),
    makeMove: (position) => currentRoom && socketService.current?.game.makeMove(currentRoom.id, position),
    requestRematch: () => currentRoom && socketService.current?.game.requestRematch(currentRoom.id),
    logoutSocketSession: () => socketService.current?.user.logout(),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
