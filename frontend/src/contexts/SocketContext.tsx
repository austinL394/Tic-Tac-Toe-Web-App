import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

import { setupUserEvents } from '@/services/socket/userEvents';
import { setupGameEvents } from '@/services/socket/gameEvents';
import { SocketService } from '@/services/socket/socketService';

import { SocketContextType, OnlineUser, UserSession, UserStatus, GameRoom } from '@/types';

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const socketService = useRef<SocketService | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);

  const { isAuthenticated, token, user } = useAuthStore();

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
    socketService.current = new SocketService(socket);

    const handlers = {
      setOnlineUsers,
      setCurrentSession,
      setRooms,
      setCurrentRoom,
      setGameError,
      setIsConnected,
      navigate,
      user,
    };

    socket.on('connect', () => {
      setIsConnected(true);
      setCurrentSession({
        userId: user.id,
        status: UserStatus.ONLINE,
        lastActivity: new Date(),
      });

      // Setup heartbeat
      const heartbeatInterval = setInterval(() => {
        socketService.current?.sendHeartbeat();
      }, 5000);

      socket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
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
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      setIsConnected(false);
      setCurrentSession(null);
      setRooms([]);
      setCurrentRoom(null);
      setGameError(null);
    });

    // Auto-away feature
    const autoAwayTimeout = setTimeout(() => {
      if (currentSession?.status === UserStatus.ONLINE) {
        socketService.current?.updateUserStatus(UserStatus.BUSY);
      }
    }, 300000); // 5 minutes

    return () => {
      clearTimeout(autoAwayTimeout);
      cleanupUserEvents();
      cleanupGameEvents();
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [isAuthenticated, token, user, navigate]);

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
    updateUserStatus: (status) => socketService.current?.updateUserStatus(status),
    createRoom: () => socketService.current?.createRoom(),
    getRoomList: () => socketService.current?.getRoomList(),
    joinRoom: (roomId) => socketService.current?.joinRoom(roomId),
    leaveRoom: (roomId) => socketService.current?.leaveRoom(roomId),
    toggleReady: (roomId) => socketService.current?.toggleReady(roomId),
    makeMove: (position) => currentRoom && socketService.current?.makeMove(currentRoom.id, position),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
