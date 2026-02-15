
import React, { useState, useEffect } from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const ClockWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const [time, setTime] = useState(new Date());
  const { format24 } = widget.settings;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate angles for clock hands
  const secondAngle = (seconds * 6); // 360 / 60 = 6 degrees per second
  const minuteAngle = (minutes * 6) + (seconds * 0.1); // 6 degrees per minute + smooth transition
  const hourAngle = ((hours % 12) * 30) + (minutes * 0.5); // 30 degrees per hour + smooth transition

  const timeString = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !format24
  });

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-3 md:p-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Analog Clock */}
      <div className="relative w-full max-w-[min(90%,240px)] aspect-square mx-auto flex-shrink-0">
        {/* Clock Face with Blue Border */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
        >
          {/* Outer Blue Border Circle */}
          <circle
            cx="100"
            cy="100"
            r="98"
            fill="white"
            stroke="#08b8fb"
            strokeWidth="2"
          />

          {/* Inner Shadow Circle */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="white"
            opacity="0.1"
          />

          {/* Hour Markers and Numbers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i + 1) * 30 - 90; // Start from 12 o'clock (top)
            const radians = (angle * Math.PI) / 180;
            const numberRadius = 72; // Distance from center for numbers
            const markerRadius = 88; // Distance for hour markers

            const numX = 100 + numberRadius * Math.cos(radians);
            const numY = 100 + numberRadius * Math.sin(radians);

            const markerStartX = 100 + (markerRadius - 8) * Math.cos(radians);
            const markerStartY = 100 + (markerRadius - 8) * Math.sin(radians);
            const markerEndX = 100 + markerRadius * Math.cos(radians);
            const markerEndY = 100 + markerRadius * Math.sin(radians);

            return (
              <g key={i}>
                {/* Hour Marker Line */}
                <line
                  x1={markerStartX}
                  y1={markerStartY}
                  x2={markerEndX}
                  y2={markerEndY}
                  stroke="#091e42"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Hour Number */}
                <text
                  x={numX}
                  y={numY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="14"
                  fontWeight="700"
                  fill="#091e42"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Minute Markers (thin lines between hours) */}
          {[...Array(60)].map((_, i) => {
            if (i % 5 === 0) return null; // Skip hour positions
            const angle = i * 6 - 90;
            const radians = (angle * Math.PI) / 180;
            const startX = 100 + 86 * Math.cos(radians);
            const startY = 100 + 86 * Math.sin(radians);
            const endX = 100 + 90 * Math.cos(radians);
            const endY = 100 + 90 * Math.sin(radians);

            return (
              <line
                key={`min-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}

          {/* Hour Hand (Black) */}
          <line
            x1="100"
            y1="100"
            x2={100 + 45 * Math.cos((hourAngle - 90) * Math.PI / 180)}
            y2={100 + 45 * Math.sin((hourAngle - 90) * Math.PI / 180)}
            stroke="#091e42"
            strokeWidth="6"
            strokeLinecap="round"
            style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Minute Hand (Black) */}
          <line
            x1="100"
            y1="100"
            x2={100 + 65 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
            y2={100 + 65 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
            stroke="#091e42"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Second Hand (Red) */}
          <line
            x1="100"
            y1="100"
            x2={100 + 75 * Math.cos((secondAngle - 90) * Math.PI / 180)}
            y2={100 + 75 * Math.sin((secondAngle - 90) * Math.PI / 180)}
            stroke="#FF3B30"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: 'none' }}
          />

          {/* Center Dot */}
          <circle
            cx="100"
            cy="100"
            r="5"
            fill="#091e42"
          />
          <circle
            cx="100"
            cy="100"
            r="3"
            fill="#FF3B30"
          />
        </svg>
      </div>

      {/* Digital Time Display */}
      <div className="mt-2 md:mt-3 text-center flex-shrink-0 w-full">
        <div className="text-xl md:text-2xl font-bold text-text-main tabular-nums tracking-tight">
          {timeString}
        </div>
        <div className="mt-0.5 text-[10px] md:text-xs font-medium text-text-secondary truncate">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Format Toggle Button */}
      {isTeacher && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUpdate({ settings: { ...widget.settings, format24: !format24 } })}
            className="bg-bg-alt hover:bg-border-hover px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-text-secondary border border-border-default hover:border-focus transition-all"
          >
            {format24 ? '24h' : '12h'}
          </button>
        </div>
      )}
    </div>
  );
};
