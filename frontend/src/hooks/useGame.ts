import { useSocket } from './useSocket';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface GameRoom {
  id: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: {
    [key: string]: {
      symbol: 'X' | 'O';
      username: string;
      ready: boolean;
    };
  };
  board: (string | null)[];
  currentTurn?: string;
  winner?: string;
}

export const useGame = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('game:room_list', (updatedRooms: GameRoom[]) => {
      console.log("@ got updated rooms", updatedRooms);
      setRooms(updatedRooms);
    });

    socket.on('game:room_created', (room: GameRoom) => {
      setCurrentRoom(room);
      navigate(`/game/${room.id}`);
    });

    socket.on('game:room_state', (room: GameRoom) => {
      setCurrentRoom(room);
    });

    socket.on('game:error', (errorMessage: string) => {
      setError(errorMessage);
    });

    socket.on('game:room_closed', () => {
      setCurrentRoom(null);
      navigate('/');
    });

    return () => {
      socket.off('game:room_list');
      socket.off('game:room_created');
      socket.off('game:room_state');
      socket.off('game:error');
      socket.off('game:room_closed');
    };
  }, [socket, navigate]);

  const createRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('game:create_room');
  }, [socket]);

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit('game:join_room', roomId);
      navigate(`/game/${roomId}`);
    },
    [socket, navigate],
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit('game:leave_room', roomId);
      setCurrentRoom(null);
      navigate('/');
    },
    [socket, navigate],
  );

  const toggleReady = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit('game:toggle_ready', roomId);
    },
    [socket],
  );

  return {
    rooms,
    currentRoom,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
  };
};
