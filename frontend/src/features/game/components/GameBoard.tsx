import GameCell from './GameCell';

interface GameBoardProps {
  board: (string | null)[];
  isMyTurn: boolean;
  gameStatus: 'waiting' | 'playing' | 'finished';
  onCellClick: (position: number) => void;
}

const GameBoard = ({ board, isMyTurn, gameStatus, onCellClick }: GameBoardProps) => {
  return (
    <div className="grid grid-cols-3 gap-1 bg-gray-700 p-1 rounded-lg">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
        <GameCell
          key={position}
          value={board[position]}
          position={position}
          isMyTurn={isMyTurn}
          isPlayable={gameStatus === 'playing'}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
};

export default GameBoard;
