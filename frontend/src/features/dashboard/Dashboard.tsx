import { useState } from 'react';
import { OnlinePlayersList } from './components/OnlinePlayersList';
const activeGames = [
  { id: 1, player1: 'Player2', player2: 'Player5', status: 'in-progress' },
  { id: 2, player1: 'Player6', player2: 'Player7', status: 'in-progress' },
  { id: 3, player1: 'Player8', player2: 'Player9', status: 'in-progress' },
  { id: 4, player1: 'Player10', player2: 'Player11', status: 'in-progress' },
];

// Dashboard component
const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black font-sans">
      {/* Main Content */}
      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${isDrawerOpen ? 'pr-80' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Game Rooms</h1>
        </div>

        {/* Quick Play Button */}
        <div className="mb-8">
          <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Quick Play
          </button>
        </div>

        {/* Game Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeGames.map((game) => (
            <div key={game.id} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Room #{game.id}</span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">Live</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-gray-300">
                    {game.player1.charAt(0)}
                  </div>
                  <span className="text-white">{game.player1}</span>
                </div>
                <div className="text-center text-gray-400 text-sm">VS</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-gray-300">
                    {game.player2.charAt(0)}
                  </div>
                  <span className="text-white">{game.player2}</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                Spectate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="text-white fixed right-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-l-lg shadow-lg hover:bg-gray-700 transition-colors z-50"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Online Players List Component */}
      <OnlinePlayersList isDrawerOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default Dashboard;
