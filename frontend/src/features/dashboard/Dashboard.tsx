import { useState } from 'react';

import classNames from 'classnames';

import { OnlinePlayersList } from './components/OnlinePlayersList';
import PlusIcon from '@/components/Icons/PlusIcon';
import MinusIcon from '@/components/Icons/MinusIcon';
import GameRooms from './components/GameRooms';

import { useSocket } from '@/hooks/useSocket';

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { createRoom, rooms } = useSocket();

  const handleClickCreateRoom = () => {
    createRoom();
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
          Create Room
        </button>

        <GameRooms rooms={rooms} />
      </div>

      <OnlinePlayersList isDrawerOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default Dashboard;
