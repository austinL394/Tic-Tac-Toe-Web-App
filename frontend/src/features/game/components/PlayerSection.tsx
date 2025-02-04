import classNames from 'classnames';

interface Player {
  username: string;
  symbol: 'X' | 'O';
  ready: boolean;
}

interface PlayerSectionProps {
  player: Player;
  isLeft: boolean;
  isCurrentPlayer: boolean;
  isHost: boolean;
  isCurrentTurn: boolean;
  isWaiting: boolean;
  onReadyToggle?: () => void;
}

const PlayerSection = ({
  player,
  isLeft,
  isCurrentPlayer,
  isHost,
  isCurrentTurn,
  isWaiting,
  onReadyToggle,
}: PlayerSectionProps) => {
  return (
    <div
      className={classNames('w-64 h-[192px] bg-gray-800 p-6 rounded-lg', {
        'text-right': isLeft,
        'text-left': !isLeft,
      })}
    >
      {/* Player Info */}
      <div className={classNames('flex items-center gap-3', { 'flex-row-reverse': isLeft, 'flex-row': !isLeft })}>
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
      <div className={classNames('mt-4 flex flex-col', { 'items-end': isLeft, 'items-start': !isLeft })}>
        <span
          className={classNames(`px-3 py-1 rounded-full text-sm`, {
            'bg-green-500/10 text-green-500': player.ready,
            'bg-yellow-500/10 text-yellow-400': !player.ready,
          })}
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
