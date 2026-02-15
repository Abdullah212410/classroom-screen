
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const TimetableWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { rows } = widget.settings; // rows: [{ time: string, activity: string }]

  const handleUpdateRow = (index: number, field: 'time' | 'activity', value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    onUpdate({ settings: { ...widget.settings, rows: newRows } });
  };

  const handleAddRow = () => {
    onUpdate({ settings: { ...widget.settings, rows: [...rows, { time: '00:00', activity: 'New Activity' }] } });
  };

  const handleRemoveRow = (index: number) => {
    const newRows = rows.filter((_: any, i: number) => i !== index);
    onUpdate({ settings: { ...widget.settings, rows: newRows } });
  };

  return (
    <div className="flex flex-col h-full bg-white p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-2">
         {rows.map((row: any, i: number) => (
             <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
                 {isTeacher ? (
                    <input 
                      className="w-16 font-mono font-bold text-slate-500 bg-transparent text-right outline-none focus:text-indigo-600"
                      value={row.time}
                      onChange={(e) => handleUpdateRow(i, 'time', e.target.value)}
                    />
                 ) : (
                    <span className="w-16 font-mono font-bold text-slate-500 text-right">{row.time}</span>
                 )}
                 
                 <div className="w-px h-6 bg-gray-200"></div>

                 {isTeacher ? (
                    <input 
                      className="flex-1 font-bold text-slate-800 bg-transparent outline-none focus:text-indigo-600"
                      value={row.activity}
                      onChange={(e) => handleUpdateRow(i, 'activity', e.target.value)}
                    />
                 ) : (
                    <span className="flex-1 font-bold text-slate-800">{row.activity}</span>
                 )}

                 {isTeacher && (
                    <button 
                      onClick={() => handleRemoveRow(i)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all px-2"
                    >
                        ×
                    </button>
                 )}
             </div>
         ))}
      </div>

      {isTeacher && (
          <button 
            onClick={handleAddRow}
            className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
             <span>+ Add Activity</span>
          </button>
      )}
    </div>
  );
};
