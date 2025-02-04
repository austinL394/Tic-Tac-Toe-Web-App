import classNames from 'classnames';

import JoinIcon from '@/components/Icons/JoinIcon';
import { GameRoom } from '@/types';

interface GameRoomListProps {
  rooms: GameRoom[];
  onJoinRoom?: (roomId: string) => void;
  currentUserId?: string;
}

const GameRoomList: React.FC<GameRoomListProps> = ({ rooms, onJoinRoom, currentUserId }) => {
  const getStatusColors = (status: GameRoom['status']) => {
    switch (status) {
      case 'waiting':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-100',
          label: 'Waiting',
        };
      case 'playing':
        return {
          bg: 'bg-rose-500',
          text: 'text-rose-100',
          label: 'Live',
        };
      case 'finished':
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-100',
          label: 'Finished',
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-100',
          label: status,
        };
    }
  };

  const getPlayersList = (room: GameRoom): Array<[string, { username: string; symbol: string }]> => {
    const players = Object.entries(room.players);
    if (players.length === 0) return [];

    if (players.length === 1) {
      return [players[0], ['waiting', { username: 'Waiting...', symbol: 'O' }]];
    }

    return players;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => {
        const players = getPlayersList(room);
        const canJoin =
          room.status === 'waiting' &&
          Object.keys(room.players).length < 2 &&
          !Object.keys(room.players).includes(currentUserId || '');
        const statusConfig = getStatusColors(room.status);

        return (
          <div
            key={room.id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-600"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-400">Room #{room.id.slice(0, 8)}</span>
              <div className="flex items-center gap-2">
                <div
                  className={classNames('w-2 h-2 rounded-full', statusConfig.bg, {
                    'animate-pulse': room.status === 'playing',
                  })}
                />
                <span className={`px-2 py-1 ${statusConfig.bg} ${statusConfig.text} text-xs rounded`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {players.map(([playerId, player], index) => (
                <div key={playerId}>
                  <div className="flex items-center gap-3">
                    <div
                      className={classNames(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        playerId === 'waiting' ? 'bg-gray-700 text-gray-400' : 'bg-indigo-900 text-indigo-100',
                      )}
                    >
                      {player.username.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className={classNames(playerId === 'waiting' ? 'text-gray-400' : 'text-white')}>
                        {player.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {player.symbol}
                        {room.hostId === playerId && ' • Host'}
                        {room.currentTurn === playerId && ' • Current Turn'}
                      </span>
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="flex items-center justify-center gap-2 my-4">
                      <div className="h-px w-full bg-gray-600"></div>
                      <span className="text-indigo-300 text-sm px-2">VS</span>
                      <div className="h-px w-full bg-gray-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => onJoinRoom?.(room.id)}
              disabled={!canJoin}
              className={classNames(
                'w-full mt-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2',
                canJoin
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed',
              )}
            >
              <JoinIcon />
              {canJoin
                ? 'Join Game'
                : room.status === 'playing'
                  ? 'Game in Progress'
                  : room.status === 'finished'
                    ? 'Game Finished'
                    : 'Cannot Join'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GameRoomList;
