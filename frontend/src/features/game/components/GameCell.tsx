// components/game/GameCell.tsx
interface GameCellProps {
  value: string | null;
  position: number;
  isMyTurn: boolean;
  isPlayable: boolean;
  onClick: (position: number) => void;
}

const GameCell = ({ value, position, isMyTurn, isPlayable, onClick }: GameCellProps) => {
  const isClickable = isMyTurn && isPlayable && !value;

  return (
    <button
      className={`w-20 h-20 bg-gray-800 border border-gray-700 flex items-center justify-center text-4xl font-bold
          ${isClickable ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-not-allowed'}
          transition-colors duration-200`}
      onClick={() => isClickable && onClick(position)}
      disabled={!isClickable}
    >
      {value === 'X' && <span className="text-blue-500">X</span>}
      {value === 'O' && <span className="text-red-500">O</span>}
    </button>
  );
};

export default GameCell;
