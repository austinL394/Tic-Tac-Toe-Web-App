// components/game/PlayerSection.tsx
interface Player {
  username: string;
  symbol: 'X' | 'O';
  ready: boolean;
}

interface PlayerSectionProps {
  playerId: string;
  player: Player;
  isLeft: boolean;
  isCurrentPlayer: boolean;
  isHost: boolean;
  isCurrentTurn: boolean;
  isWaiting: boolean;
  onReadyToggle?: () => void;
}

const PlayerSection = ({
  playerId,
  player,
  isLeft,
  isCurrentPlayer,
  isHost,
  isCurrentTurn,
  isWaiting,
  onReadyToggle,
}: PlayerSectionProps) => {
  return (
    <div className={`w-64 h-[192px] bg-gray-800 p-6 rounded-lg ${isLeft ? 'text-right' : 'text-left'}`}>
      {/* Player Info */}
      <div className={`flex items-center gap-3 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl font-bold">
          {player.username[0].toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{player.username}</p>
          <p className="text-gray-400 text-sm">
            {isHost && 'Host • '}
            <span className={player.symbol === 'X' ? 'text-blue-500' : 'text-red-500'}>{player.symbol}</span>
          </p>
        </div>
      </div>

      {/* Status Section */}
      <div className={`mt-4 flex flex-col ${isLeft ? 'items-end' : 'items-start'}`}>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            player.ready ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-400'
          }`}
        >
          {player.ready ? 'Ready' : 'Not Ready'}
        </span>

        {isCurrentPlayer && isWaiting && onReadyToggle && (
          <button
            onClick={onReadyToggle}
            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            {player.ready ? 'Cancel Ready' : 'Ready Up'}
          </button>
        )}
      </div>

      {/* Turn Indicator */}
      {isCurrentTurn && (
        <div className="mt-4">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm">Current Turn</span>
        </div>
      )}
    </div>
  );
};

export default PlayerSection;
