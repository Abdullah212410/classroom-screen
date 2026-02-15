
import React, { useEffect, useRef, useState } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
}

export const WebcamWidget: React.FC<WidgetProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setActive(true);
        }
      } catch (err) {
        setError('Camera access denied');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
      {error ? (
        <div className="text-white font-bold text-center px-4">
            <div className="text-2xl mb-2">🚫</div>
            {error}
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100"
        />
      )}
      {!active && !error && <div className="text-white animate-pulse">Starting camera...</div>}
    </div>
  );
};
