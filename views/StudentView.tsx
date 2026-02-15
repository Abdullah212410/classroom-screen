
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { RoomState } from '../types';
import ScreenLayout from '../components/ScreenLayout';

const StudentView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    if (!roomId) return;
    
    // Initial fetch
    setRoom(roomService.getRoomState(roomId));

    // Request full sync from any teacher tab
    roomService.broadcast({
      type: 'SYNC_REQUEST',
      payload: null,
      roomId,
      sender: 'student'
    });

    const unsubscribe = roomService.addListener((msg) => {
      if (msg.roomId === roomId && (msg.type === 'UPDATE_ROOM' || msg.type === 'SYNC_RESPONSE')) {
        setRoom(msg.payload);
      }
    });

    return unsubscribe;
  }, [roomId]);

  if (!room) return <div className="p-8">Waiting for teacher...</div>;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ScreenLayout 
        room={room} 
        isTeacher={false} 
      />
    </div>
  );
};

export default StudentView;
