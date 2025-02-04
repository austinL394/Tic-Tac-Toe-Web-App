import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket';

import PlayerSection from './components/PlayerSection';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';

const GameRoom = () => {
  const { roomId } = useParams();
  const { currentRoom, leaveRoom, toggleReady, makeMove } = useSocket();
  const { currentSession } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (currentRoom?.id) {
        leaveRoom(currentRoom.id);
        navigate('/');
      }
    };
  }, []);

  const isMyTurn = currentRoom?.currentTurn === currentSession?.userId;

  const handleCellClick = (position: number) => {
    if (currentRoom?.status === 'playing' && isMyTurn && !currentRoom.board[position]) {
      makeMove(position);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Game Room</h1>
          {currentRoom?.id && <p className="text-gray-400 mt-1">Room ID: {currentRoom.id}</p>}
        </div>
        <button
          onClick={() => roomId && leaveRoom(roomId)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Leave Room
        </button>
      </div>

      {/* Game Area */}
      <div className="flex justify-center items-center gap-12">
        {/* Players and Game Board */}
        {currentRoom?.players && (
          <>
            {/* Left Player */}
            {Object.entries(currentRoom.players)[0] && (
              <PlayerSection
                player={Object.entries(currentRoom.players)[0][1]}
                isLeft={true}
                isCurrentPlayer={Object.entries(currentRoom.players)[0][0] === currentSession?.userId}
                isHost={Object.entries(currentRoom.players)[0][0] === currentRoom.hostId}
                isCurrentTurn={Object.entries(currentRoom.players)[0][0] === currentRoom.currentTurn}
                isWaiting={currentRoom.status === 'waiting'}
                onReadyToggle={() => roomId && toggleReady(roomId)}
              />
            )}

            <div className="flex flex-col items-center">
              <GameStatus
                status={currentRoom.status}
                playersCount={Object.keys(currentRoom.players).length}
                isMyTurn={isMyTurn}
                winner={currentRoom.winner}
                currentUserId={currentSession?.userId}
              />

              <GameBoard
                board={currentRoom.board}
                isMyTurn={isMyTurn}
                gameStatus={currentRoom.status}
                onCellClick={handleCellClick}
              />
            </div>

            {Object.entries(currentRoom.players)[1] && (
              <PlayerSection
                player={Object.entries(currentRoom.players)[1][1]}
                isLeft={false}
                isCurrentPlayer={Object.entries(currentRoom.players)[1][0] === currentSession?.userId}
                isHost={Object.entries(currentRoom.players)[1][0] === currentRoom.hostId}
                isCurrentTurn={Object.entries(currentRoom.players)[1][0] === currentRoom.currentTurn}
                isWaiting={currentRoom.status === 'waiting'}
                onReadyToggle={() => roomId && toggleReady(roomId)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
