import { useEffect, useState } from 'react';

import classNames from 'classnames';

import { OnlinePlayersList } from './components/OnlinePlayersList';
import PlusIcon from '@/components/Icons/PlusIcon';
import MinusIcon from '@/components/Icons/MinusIcon';

import { useSocket } from '@/hooks/useSocket';
import GameRoomList from './components/GameRoomList';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { createRoom, rooms, getRoomList, joinRoom, socket, requestJoinRoom } = useSocket();

  const handleClickCreateRoom = () => {
    const roomName = prompt('Input room name:');
    createRoom(roomName!);
  };

  useEffect(() => {
    getRoomList();
  }, [socket]);

  const handleJoinRoom = (roomId: string) => {
    // joinRoom(roomId);
    requestJoinRoom(roomId);
  };

  const handleJoinRoomByName = () => {
    const roomName = prompt('Input room name:');
    const selectedRoom = rooms.find((room) => room.name === roomName);
    if (selectedRoom) {
      requestJoinRoom(selectedRoom.id);
    } else toast.error("Room doesn't exist");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className={classNames(`p-6 transition-all duration-300`, { 'pr-80': isDrawerOpen })}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Game Rooms</h1>
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
          >
            {isDrawerOpen ? <MinusIcon /> : <PlusIcon />}
          </button>
        </div>

        <button
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          onClick={handleClickCreateRoom}
        >
          <PlusIcon />
          Share Code Now
        </button>

        <button
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          onClick={handleJoinRoomByName}
        >
          Join Room
        </button>

        <GameRoomList rooms={rooms} onJoinRoom={handleJoinRoom} />
      </div>

      <OnlinePlayersList isDrawerOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default Dashboard;
