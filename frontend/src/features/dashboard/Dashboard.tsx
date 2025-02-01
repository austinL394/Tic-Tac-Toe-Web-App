import { useState } from 'react';
import { OnlinePlayersList } from './components/OnlinePlayersList';
import PlusIcon from '@/components/Icons/PlusIcon';
import MinusIcon from '@/components/Icons/MinusIcon';

const activeGames = [
  { id: 1, player1: 'Player2', player2: 'Player5', status: 'in-progress' },
  { id: 2, player1: 'Player6', player2: 'Player7', status: 'in-progress' },
  { id: 3, player1: 'Player8', player2: 'Player9', status: 'in-progress' },
  { id: 4, player1: 'Player10', player2: 'Player11', status: 'in-progress' },
];

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className={`p-6 transition-all duration-300 ${isDrawerOpen ? 'pr-80' : ''}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Game Rooms</h1>
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
          >
            {isDrawerOpen ? <MinusIcon /> : <PlusIcon />}
          </button>
        </div>

        <button className="mb-8 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
          <PlusIcon />
          Create Room
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeGames.map((game) => (
            <div key={game.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Room #{game.id}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="px-2 py-1 bg-gray-700 text-green-400 text-xs rounded">Live</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[50%] bg-gray-700 flex items-center justify-center text-gray-300">
                    {game.player1.charAt(0)}
                  </div>
                  <span className="text-white">{game.player1}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-full bg-gray-700"></div>
                  <span className="text-gray-400 text-sm px-2">VS</span>
                  <div className="h-px w-full bg-gray-700"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[50%] bg-gray-700 flex items-center justify-center text-gray-300">
                    {game.player2.charAt(0)}
                  </div>
                  <span className="text-white">{game.player2}</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Join Game
              </button>
            </div>
          ))}
        </div>
      </div>

      <OnlinePlayersList isDrawerOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default Dashboard;
