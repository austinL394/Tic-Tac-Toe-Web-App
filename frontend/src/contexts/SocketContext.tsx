import { useAuthStore } from '@/stores/authStore';
import { GameRoom, UserStatus } from '@/types';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  currentSession: UserSession | null;
  rooms: GameRoom;
  currentRoom: GameRoom;
  connect: () => void;
  disconnect: () => void;
  updateUserStatus: (status: UserStatus) => void;

  createRoom: () => void;
  getRoomList: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  toggleReady: (roomId: string) => void;
}

interface OnlineUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

interface UserSession {
  userId: string;
  status: UserStatus;
  lastActivity: Date;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  // Game-related state
  const [rooms, setRooms] = useState<Array<GameRoom>>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  const token = useAuthStore((store) => store.token);
  const user = useAuthStore((store) => store.user);

  // User methods
  const updateUserStatus = useCallback((status: UserStatus) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('user:status_update', { status });
    setCurrentSession((prev) => (prev ? { ...prev, status, lastActivity: new Date() } : null));
  }, []);

  const handleUserStatusUpdate = useCallback(
    (data: { userId: string; status: UserStatus }) => {
      setOnlineUsers((prevUsers) =>
        prevUsers.map((user) => (user.userId === data.userId ? { ...user, status: data.status } : user)),
      );

      if (data.userId === user?.id) {
        setCurrentSession((prev) => (prev ? { ...prev, status: data.status, lastActivity: new Date() } : null));
      }
    },
    [user?.id],
  );

  // Game methods
  const createRoom = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('game:create_room');
  }, []);

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current?.connected) return;
      socketRef.current.emit('game:join_room', roomId);
    },
    [navigate],
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current?.connected) return;
      socketRef.current.emit('game:leave_room', roomId);
      setCurrentRoom(null);
      navigate('/');
    },
    [navigate],
  );

  const toggleReady = useCallback((roomId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('game:toggle_ready', roomId);
  }, []);

  const makeMove = useCallback(
    (position: number) => {
      if (!socketRef.current?.connected || !currentRoom) return;
      socketRef.current.emit('game:make_move', { roomId: currentRoom.id, position });
    },
    [currentRoom],
  );

  const getRoomList = () => {
    console.log('@ ghet room list');
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('game:room_list');
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

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setCurrentSession({
        userId: user.id,
        status: UserStatus.ONLINE,
        lastActivity: new Date(),
      });

      const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat');
      }, 5000);

      socket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
      });
    });

    // User events
    socket.on('user_list_update', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    socket.on('user:status_changed', handleUserStatusUpdate);

    // Game events
    socket.on('game:room_list', (updatedRooms: GameRoom[]) => {
      console.log('@ got updated rooms', updatedRooms);
      setRooms(updatedRooms);
    });

    socket.on('game:room_created', (room: GameRoom) => {
      setCurrentRoom(room);
      navigate(`/game/${room.id}`);
    });

    socket.on('game:room_joined', (room: GameRoom) => {
      setCurrentRoom(room);
      navigate(`/game/${room.id}`);
    });

    socket.on('game:room_state', (room: GameRoom) => {
      setCurrentRoom(room);
      setRooms((prevRooms) => prevRooms.map((r) => (r.id === room.id ? room : r)));
    });

    socket.on('game:error', (errorMessage: string) => {
      setGameError(errorMessage);
    });

    socket.on('game:room_closed', () => {
      setCurrentRoom(null);
      navigate('/');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setCurrentSession(null);
      setRooms([]);
      setCurrentRoom(null);
      setGameError(null);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setCurrentSession(null);
      setGameError('Connection error');
    });

    const autoAwayTimeout = setTimeout(() => {
      if (currentSession?.status === 'online') {
        updateUserStatus(UserStatus.BUSY);
      }
    }, 300000);

    console.log('@@@ rooms', rooms);

    return () => {
      clearTimeout(autoAwayTimeout);
    };
  }, [isAuthenticated, token, user, handleUserStatusUpdate, updateUserStatus, navigate]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
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

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    currentSession,
    // Game state
    rooms,
    currentRoom,
    gameError,
    // Methods
    connect,
    disconnect,
    updateUserStatus,
    // Game methods
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    makeMove,
    getRoomList,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
