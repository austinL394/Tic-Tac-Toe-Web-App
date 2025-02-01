import React, { useState } from 'react';
import classNames from 'classnames';

const GameBoard = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // Mock player data - replace with actual player data
  const player1 = {
    id: 'player1',
    username: 'Player One',
    firstName: 'John',
  };

  const player2 = {
    id: 'player2',
    username: 'Player Two',
    firstName: 'Jane',
  };

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const winner = calculateWinner(board);
  const status = winner
    ? `Winner: ${winner === 'X' ? player1.username : player2.username}`
    : board.every((square) => square)
      ? 'Game Draw!'
      : `Next player: ${isXNext ? player1.username : player2.username}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black font-sans p-8">
      <div className="max-w-4xl mx-auto">
        {/* Game Status */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Tic Tac Toe</h1>
          <div className="bg-gray-800/50 rounded-lg py-2 px-4 inline-block">
            <span className="text-white">{status}</span>
          </div>
        </div>

        {/* Game Container */}
        <div className="flex items-center justify-between gap-8">
          {/* Player 1 */}
          <div className="w-48 bg-gray-800/50 p-4 rounded-lg text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              X
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                {player1.firstName.charAt(0)}
              </div>
              <span className="text-white font-medium">{player1.username}</span>
            </div>
            <div className={`text-sm ${isXNext ? 'text-green-400' : 'text-gray-400'}`}>
              {isXNext ? 'Your turn' : 'Waiting...'}
            </div>
          </div>

          {/* Game Board */}
          <div className="flex-1 max-w-md">
            <div className="grid grid-cols-3 gap-2 bg-gray-800/30 p-2 rounded-lg">
              {board.map((square, index) => (
                <button
                  key={index}
                  onClick={() => handleClick(index)}
                  disabled={!!square || !!winner}
                  className={classNames(
                    'w-full aspect-square rounded bg-gray-800/50 flex items-center justify-center text-4xl font-bold transition-colors',
                    {
                      'hover:bg-gray-700/50': !square && !winner,
                      'text-indigo-400': square === 'X',
                      'text-rose-400': square === 'O',
                    },
                  )}
                >
                  {square}
                </button>
              ))}
            </div>
          </div>

          {/* Player 2 */}
          <div className="w-48 bg-gray-800/50 p-4 rounded-lg text-center">
            <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              O
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                {player2.firstName.charAt(0)}
              </div>
              <span className="text-white font-medium">{player2.username}</span>
            </div>
            <div className={`text-sm ${!isXNext ? 'text-green-400' : 'text-gray-400'}`}>
              {!isXNext ? 'Your turn' : 'Waiting...'}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setBoard(Array(9).fill(null))}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate winner
function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default GameBoard;
