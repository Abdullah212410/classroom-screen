
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeView: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = (mode: 'teacher' | 'screen') => {
    if (!roomId.trim()) return;
    navigate(`/${mode}/${roomId}`);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-bg-alt to-bg-main p-4">
      <div className="card p-8 w-full max-w-md border-border-default shadow-floating bg-bg-main/90 backdrop-blur-md">
        <h1 className="text-4xl font-bold mb-6 text-center text-primary drop-shadow-sm">Classroom Screen</h1>
        <p className="mb-8 text-center text-text-secondary font-medium">Enter a Room ID to start your session</p>
        
        <input 
          type="text" 
          placeholder="Room ID (e.g., class-101)" 
          className="input-field mb-6 font-bold"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleJoin('teacher')}
            className="btn-primary shadow-glow"
          >
            Launch Teacher
          </button>
          <button 
            onClick={() => handleJoin('screen')}
            className="btn-secondary"
          >
            Student View
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-text-secondary text-center max-w-lg font-medium">
        <p>A collaborative whiteboard/dashboard system. Open the teacher view in one tab and the student view in another to see real-time syncing!</p>
      </div>
    </div>
  );
};

export default HomeView;
