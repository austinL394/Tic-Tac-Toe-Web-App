interface GameStatusProps {
  status: 'waiting' | 'playing' | 'finished';
  playersCount: number;
  isMyTurn: boolean;
  winner?: string | 'draw';
  currentUserId?: string;
}

const GameStatus = ({ status, playersCount, isMyTurn, winner, currentUserId }: GameStatusProps) => {
  if (status === 'waiting') {
    return (
      <div className="absolute mt-80 p-4 bg-gray-800 rounded-lg text-center text-gray-400 w-64">
        {playersCount < 2 ? 'Waiting for another player to join...' : 'Waiting for all players to be ready...'}
      </div>
    );
  }

  if (status === 'playing') {
    return (
      <div className="absolute mt-80 mb-64">
        <p className="text-white text-center">{isMyTurn ? 'Your turn!' : "Opponent's turn"}</p>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="absolute mt-80 p-4 bg-gray-800 rounded-lg text-center text-white w-64">
        {winner === currentUserId ? '🎉 You won!' : winner === 'draw' ? "It's a draw!" : '😔 You lost!'}
      </div>
    );
  }

  return null;
};

export default GameStatus;
