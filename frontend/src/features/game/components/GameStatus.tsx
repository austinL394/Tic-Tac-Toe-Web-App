interface GameStatusProps {
  status: string;
  playersCount: number;
  isMyTurn: boolean;
  winner?: string;
  currentUserId?: string;
  onRequestRematch?: () => void;
  showRematchButton?: boolean;
}

const GameStatus = ({
  status,
  playersCount,
  isMyTurn,
  winner,
  currentUserId,
  onRequestRematch,
  showRematchButton,
}: GameStatusProps) => {
  const getStatusMessage = () => {
    if (status === 'waiting') {
      return playersCount === 1 ? 'Waiting for opponent...' : 'Waiting for players to ready up...';
    }

    if (status === 'finished') {
      if (winner === 'draw') return "It's a draw!";
      return winner === currentUserId ? 'You won!' : 'You lost!';
    }

    return isMyTurn ? 'Your turn!' : "Opponent's turn...";
  };

  return (
    <div className="mb-8 text-center">
      <h2 className="text-xl font-semibold text-white mb-2">{getStatusMessage()}</h2>
      {status === 'finished' && showRematchButton && (
        <button
          onClick={onRequestRematch}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Request Rematch
        </button>
      )}
    </div>
  );
};

export default GameStatus;
