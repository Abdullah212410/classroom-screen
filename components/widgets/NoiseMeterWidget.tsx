
import React, { useEffect, useState, useRef } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const NoiseMeterWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const [level, setLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const threshold = widget.settings.threshold || 50;

  useEffect(() => {
    if (level > threshold) {
      setIsAlert(true);
      const timer = setTimeout(() => setIsAlert(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [level, threshold]);

  const tick = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const avg = sum / dataArrayRef.current.length;
      const normalized = Math.min(100, (avg / 128) * 100);
      setLevel(normalized);
      animationRef.current = requestAnimationFrame(tick);
    }
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    setHasPermission(false);
  };

  const startMic = async () => {
    try {
      if (audioContextRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      setHasPermission(true);
      tick();
    } catch (err) {
      console.error('Mic access error:', err);
      alert('Microphone access is required for the noise meter.');
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
      cleanup();
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center h-full p-6 transition-colors duration-300 ${isAlert ? 'bg-red-50' : 'bg-white'}`}>
      {!hasPermission ? (
        <button 
          onClick={startMic}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-hover shadow-lg active:scale-95 transition-all"
        >
          Enable Microphone
        </button>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="text-[10px] font-black text-text-secondary mb-2 uppercase tracking-widest">Noise Level</div>
          
          <div className="w-full h-8 bg-bg-alt rounded-full overflow-hidden border border-border-default relative shadow-inner">
             <div 
               className={`h-full transition-all duration-100 ${level > threshold ? 'bg-danger' : 'bg-focus'}`}
               style={{ width: `${level}%` }}
             />
             <div 
               className="absolute top-0 bottom-0 border-l-2 border-danger z-10"
               style={{ left: `${threshold}%` }}
             />
          </div>

          <div className="mt-4 flex items-center justify-center">
             <div className={`text-4xl font-black ${isAlert ? 'text-danger scale-110' : 'text-text-main'} transition-all tabular-nums`}>
                {Math.round(level)}%
             </div>
          </div>
          
          {isTeacher && (
             <div className="mt-6 w-full px-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Sensitivity</label>
                  <span className="text-[9px] font-bold text-text-secondary">{threshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={threshold} 
                  onChange={(e) => onUpdate({ settings: { ...widget.settings, threshold: parseInt(e.target.value) }})}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-border-default rounded-lg appearance-none"
                />
             </div>
          )}
          
          <button 
            onClick={cleanup}
            className="mt-6 text-[9px] font-bold text-text-secondary hover:text-danger uppercase tracking-widest transition-colors"
          >
            Stop Listening
          </button>
        </div>
      )}
    </div>
  );
};
