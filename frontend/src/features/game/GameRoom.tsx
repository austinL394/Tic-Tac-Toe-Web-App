import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSocket } from '@/hooks/useSocket';
import { useNavigate, useParams } from 'react-router-dom';

const CodeStrategyEditor = () => {
  // Editor State

  const { roomId } = useParams();
  const { updateCode, currentRoom, currentSession, kickPlayer, joinRoom, leaveRoom, isConnected } = useSocket();
  const navigate = useNavigate();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('// Write your strategy here');
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const editorRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  // Language Options
  const LANGUAGE_OPTIONS = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'text', label: 'Plain Text' },
  ];

  useEffect(() => {
    if (!isEditing) setEditorContent(currentRoom?.content || '');
  }, [currentRoom?.content]);

  const isHost = currentRoom?.hostId === currentSession?.userId;

  // Editor Handlers
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value) => {
    setIsEditing(true);
    setEditorContent(value);
    updateCode(editorContent);

    setTimeout(() => setIsEditing(false), 200);
  };

  const handleSaveCode = () => {
    console.log('Saved Strategy:', editorContent);
  };

  const renderCodeEditorWidget = () => (
    <div className="fixed bottom-4 right-4 z-50 w-[500px] bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center p-3 bg-gray-900 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={editorLanguage}
            onChange={(e) => setEditorLanguage(e.target.value)}
            className="bg-gray-700 text-white rounded px-2 py-1 mr-2"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSaveCode}
            className="text-green-500 hover:bg-green-900/50 p-1 rounded"
            title="Save Strategy"
          >
            ✓
          </button>
          <button
            onClick={() => setIsEditorOpen(false)}
            className="text-red-500 hover:bg-red-900/50 p-1 rounded"
            title="Close Editor"
          >
            ✕
          </button>
        </div>
      </div>
      <Editor
        height="400px"
        language={editorLanguage}
        value={editorContent}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );

  useEffect(() => {
    if (!currentRoom && roomId && isConnected) {
      joinRoom(roomId);
    }
    return () => {
      if (currentRoom?.id) {
        leaveRoom(currentRoom.id);
        navigate('/dashboard');
      }
    };
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gray-900 p-6 relative">
      {/* Code Editor Toggle */}
      {currentRoom &&
        Object.entries(currentRoom.players)
          .filter(([playerId]) => playerId !== currentSession?.userId)
          .map(([playerId, playerInfo]) => (
            <div key={playerId} className="flex justify-between items-center bg-gray-700 p-2 rounded">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-white">{playerInfo.username}</span>
              </div>

              {isHost && playerId !== currentSession?.userId?.id && (
                <button
                  onClick={() => kickPlayer(playerId)}
                  className="text-red-500 hover:bg-red-900/50 p-1 rounded"
                  title="Kick Player"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
      <button
        onClick={() => setIsEditorOpen(!isEditorOpen)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {renderCodeEditorWidget()}
    </div>
  );
};

export default CodeStrategyEditor;
