import { Socket } from 'socket.io-client';
import { GameRoom, SocketEventHandlers } from '@/types';

export const setupGameEvents = (
  socket: Socket,
  { setRooms, setCurrentRoom, setGameError, navigate, toast }: SocketEventHandlers,
) => {
  socket.on('game:room_list', (updatedRooms: GameRoom[]) => {
    setRooms(updatedRooms);
  });

  socket.on('game:room_created', (room: GameRoom) => {
    setCurrentRoom(room);
    navigate(`/game/${room.id}`);
    toast.showSuccess('Game room created successfully');
  });

  socket.on('game:room_joined', (room: GameRoom) => {
    setCurrentRoom(room);
    navigate(`/game/${room.id}`);
    toast.showSuccess(`Joined game room: ${room.id}`);
  });

  socket.on('game:room_left', () => {
    setCurrentRoom(null);
    navigate('/');
    toast.showInfo('Left game room');
  });

  socket.on('game:room_state', (room: GameRoom) => {
    setCurrentRoom(room);
    setRooms((prevRooms) => prevRooms.map((r) => (r.id === room.id ? room : r)));
  });

  socket.on('game:error', (errorMessage: string) => {
    setGameError(errorMessage);
    toast.showError(errorMessage);
  });

  socket.on('game:room_closed', () => {
    setCurrentRoom(null);
    navigate('/');
    toast.showWarning('Game room has been closed');
  });

  // Player events
  socket.on('game:player_joined', ({ player }) => {
    toast.showInfo(`${player.username} joined the game`);
  });

  socket.on('game:player_left', ({ player }) => {
    toast.showWarning(`${player.username} left the game`);
  });

  socket.on('game:player_ready', ({ player }) => {
    toast.showInfo(`${player.username} is ready`);
  });

  // Game state events
  socket.on('game:turn_change', ({ currentPlayer }) => {
    toast.showInfo(`It's ${currentPlayer.username}'s turn`);
  });

  socket.on('game:invalid_move', (message) => {
    toast.showError(`Invalid move: ${message}`);
  });

  socket.on('game:connection_lost', ({ player }) => {
    toast.showWarning(`${player.username} lost connection`);
  });

  socket.on('game:connection_restored', ({ player }) => {
    toast.showSuccess(`${player.username} reconnected`);
  });

  // Cleanup function
  return () => {
    socket.off('game:room_list');
    socket.off('game:room_created');
    socket.off('game:room_joined');
    socket.off('game:room_left');
    socket.off('game:room_state');
    socket.off('game:error');
    socket.off('game:room_closed');
    socket.off('game:player_joined');
    socket.off('game:player_left');
    socket.off('game:player_ready');
    socket.off('game:turn_change');
    socket.off('game:invalid_move');
    socket.off('game:connection_lost');
    socket.off('game:connection_restored');
  };
};
