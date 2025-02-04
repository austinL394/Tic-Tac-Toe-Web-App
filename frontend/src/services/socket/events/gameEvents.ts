import { Socket } from 'socket.io-client';
import { GameRoom, SocketEventHandlers } from '@/types';

export const setupGameEvents = (
  socket: Socket,
  { setRooms, setCurrentRoom, setGameError, navigate }: SocketEventHandlers,
) => {
  socket.on('game:room_list', (updatedRooms: GameRoom[]) => {
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

  socket.on('game:room_left', () => {
    setCurrentRoom(null);
    navigate('/');
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

  return () => {
    socket.off('game:room_list');
    socket.off('game:room_created');
    socket.off('game:room_joined');
    socket.off('game:room_state');
    socket.off('game:error');
    socket.off('game:room_closed');
  };
};
