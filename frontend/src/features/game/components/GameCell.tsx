import classNames from 'classnames';

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
      className={classNames(
        'w-20 h-20 bg-gray-800 border border-gray-700 flex items-center justify-center text-4xl font-bold transition-colors duration-200',
        {
          'hover:bg-gray-700 cursor-pointer': isClickable,
          'cursor-not-allowed': !isClickable,
        },
      )}
      onClick={() => isClickable && onClick(position)}
      disabled={!isClickable}
    >
      {value === 'X' && <span className="text-blue-500">X</span>}
      {value === 'O' && <span className="text-red-500">O</span>}
    </button>
  );
};

export default GameCell;
