import React, { useState } from 'react';
import classNames from 'classnames';
import { UserStatus } from '@/types';
import StatusIndicator from './StatusIndicator';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores/authStore';
interface OnlinePlayersListProps {
  isDrawerOpen: boolean;
  onClose: () => void;
}

export const OnlinePlayersList: React.FC<OnlinePlayersListProps> = ({ isDrawerOpen, onClose }) => {
  const { onlineUsers, updateUserStatus } = useSocket();
  const authUser = useAuthStore((store) => store.user);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(UserStatus.ONLINE);

  const handleChallenge = (playerId: string) => {
    // sendMessage('challenge_request', { challengedUserId: playerId });
  };

  const handleStatusChange = (status: UserStatus) => {
    setCurrentStatus(status);
    setIsStatusDropdownOpen(false);
    updateUserStatus(status);
  };

  return (
    <>
      <div
        className={classNames(
          'fixed top-0 right-0 h-full w-80 bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          {
            'translate-x-0': isDrawerOpen,
            'translate-x-full': !isDrawerOpen,
          },
        )}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Current User Profile Section */}
          <div className="mt-6 mb-8 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[50%] bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                {authUser?.firstName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{authUser?.username}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIndicator status={currentStatus} />
                  <span className="text-gray-300 text-sm capitalize">{currentStatus}</span>
                </div>
              </div>
            </div>

            {/* Status Selector */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={currentStatus} />
                    <span>Set Status</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-md shadow-lg overflow-hidden z-10">
                    {([UserStatus.ONLINE, UserStatus.BUSY] as UserStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={classNames(
                          'w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center gap-2',
                          {
                            'bg-gray-600': currentStatus === status,
                          },
                        )}
                      >
                        <StatusIndicator status={status} />
                        <span className="capitalize">{status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Online Players Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Online Players ({onlineUsers.length - 1})</h2>
          </div>

          <div className="space-y-3">
            {onlineUsers
              .filter((onlineUser) => onlineUser.userId !== authUser?.id)
              .map((player) => (
                <div key={player.userId} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[50%] bg-gray-700 flex items-center justify-center text-gray-300">
                        {player.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white">{player.userId === authUser!.id ? 'You' : player.username}</p>
                      </div>
                    </div>
                    <StatusIndicator status={player.status} />
                  </div>
                  {player.userId !== authUser!.id && (
                    <button
                      className={classNames(
                        'w-full mt-2 px-3 py-1 text-white text-sm rounded-lg transition-colors',
                        'bg-indigo-600 hover:bg-indigo-700',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
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
