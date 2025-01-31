import React, { useState, useEffect } from 'react';

// Mock data
const onlinePlayers = [
  { id: 1, username: 'Player1', status: 'online', rating: 1200 },
  { id: 2, username: 'Player2', status: 'in-game', rating: 1350 },
  { id: 3, username: 'Player3', status: 'online', rating: 1100 },
  { id: 4, username: 'Player4', status: 'online', rating: 1400 },
];

const activeGames = [
  { id: 1, player1: 'Player2', player2: 'Player5', status: 'in-progress' },
  { id: 2, player1: 'Player6', player2: 'Player7', status: 'in-progress' },
  { id: 3, player1: 'Player8', player2: 'Player9', status: 'in-progress' },
  { id: 4, player1: 'Player10', player2: 'Player11', status: 'in-progress' },
];

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(window.innerWidth >= 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsDrawerOpen(true);
      } else {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black font-sans">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Game Rooms</h1>
          {/* Show button only on mobile/tablet */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {isDrawerOpen ? 'Hide Players' : 'Show Players'}
          </button>
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

      {/* Overlay - only shown on mobile when drawer is open */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Online Players Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-slate-800/95 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Online Players</h2>
            {/* Close button only shown on mobile/tablet */}
            <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {onlinePlayers.map((player) => (
              <div key={player.id} className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-gray-300">
                      {player.username.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white">{player.username}</p>
                      <p className="text-sm text-gray-400">Rating: {player.rating}</p>
                    </div>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${player.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}
                  />
                </div>
                <button
                  className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={player.status === 'in-game'}
                >
                  Challenge
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
