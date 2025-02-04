// pages/GameRoom.tsx
import { useParams } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket';
import { useEffect } from 'react';

const GameRoom = () => {
  const { roomId } = useParams();
  const { currentRoom, leaveRoom, toggleReady } = useSocket();
  const { currentSession } = useSocket();
  useEffect(() => {
    return () => {
      leaveRoom(currentRoom.id);
    };
  }, []);
  return (
    <div className="p-6">
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

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-6">
          {currentRoom?.players &&
            Object.entries(currentRoom.players).map(([playerId, player]) => (
              <div key={playerId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                    {player.username[0]}
                  </div>
                  <div>
                    <p className="text-white">{player.username}</p>
                    <p className="text-gray-400 text-sm">
                      {playerId === currentRoom.hostId ? 'Host • ' : ''}
                      {player.symbol}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      player.ready ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {player.ready ? 'Ready' : 'Not Ready'}
                  </span>
                  {playerId === currentSession?.userId && (
                    <button
                      onClick={() => roomId && toggleReady(roomId)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      {player.ready ? 'Cancel Ready' : 'Ready Up'}
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {currentRoom && currentRoom.status === 'waiting' && (
          <div className="mt-8 p-4 bg-gray-700/50 rounded-lg text-center text-gray-400">
            {currentRoom?.players && Object.keys(currentRoom.players).length < 2
              ? 'Waiting for another player to join...'
              : 'Waiting for all players to be ready...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
