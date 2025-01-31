import React from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores/authStore';

interface OnlinePlayer {
  id: string;
  username: string;
  status: 'online' | 'in-game';
  rating: number;
}

interface OnlinePlayersListProps {
  isDrawerOpen: boolean;
  onClose: () => void;
}

export const OnlinePlayersList: React.FC<OnlinePlayersListProps> = ({ isDrawerOpen, onClose }) => {
  const { onlineUsers, isConnected } = useSocket();
  const authUser = useAuthStore((store) => store.user);

  const handleChallenge = (playerId: string) => {
    // sendMessage('challenge_request', { challengedUserId: playerId });
  };

  return (
    <>
      {/* Overlay - only shown on mobile when drawer is open */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Online Players Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-slate-800/95 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Online Players ({onlineUsers.length})</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {onlineUsers.map((player) => (
              <div
                key={player.userId}
                className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-gray-300">
                      {player.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white">{player.userId === authUser!.id ? 'You' : player.username}</p>
                    </div>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-[50%] ${player.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}
                  />
                </div>
                {player.userId !== authUser!.id && (
                  <button
                    className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={player?.status === 'in-game'}
                    onClick={() => handleChallenge(player.userId)}
                  >
                    Challenge
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
