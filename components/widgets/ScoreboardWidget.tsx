
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const ScoreboardWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const teams = widget.settings.teams || [{ name: 'Team A', score: 0 }, { name: 'Team B', score: 0 }];

  const updateTeam = (index: number, delta: Partial<{name: string, score: number}>) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], ...delta };
    onUpdate({ settings: { teams: newTeams } });
  };

  return (
    <div className="flex h-full bg-white divide-x divide-gray-100">
        {teams.map((team: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-center p-4 min-w-[100px]">
                {isTeacher ? (
                    <input 
                      className="text-center font-bold text-text-secondary uppercase tracking-widest text-xs mb-2 bg-transparent outline-none focus:text-focus"
                      value={team.name}
                      onChange={(e) => updateTeam(i, { name: e.target.value })}
                    />
                ) : (
                    <div className="font-bold text-text-secondary uppercase tracking-widest text-xs mb-2">{team.name}</div>
                )}
                
                <div className="text-6xl font-black text-text-main tabular-nums mb-4">{team.score}</div>
                
                {isTeacher && (
                    <div className="flex gap-2">
                        <button 
                          onClick={() => updateTeam(i, { score: team.score - 1 })}
                          className="w-8 h-8 rounded-full bg-bg-alt hover:bg-red-50 hover:text-red-600 text-text-secondary font-bold transition-colors"
                        >-</button>
                        <button 
                          onClick={() => updateTeam(i, { score: team.score + 1 })}
                          className="w-8 h-8 rounded-full bg-primary text-white hover:bg-primary-hover font-bold transition-colors shadow-sm"
                        >+</button>
                    </div>
                )}
            </div>
        ))}
        {isTeacher && teams.length < 4 && (
            <button 
              onClick={() => onUpdate({ settings: { teams: [...teams, { name: `Team ${String.fromCharCode(65+teams.length)}`, score: 0 }] } })}
              className="w-8 bg-bg-alt hover:bg-gray-100 text-text-secondary flex items-center justify-center transition-colors"
              title="Add Team"
            >
                +
            </button>
        )}
    </div>
  );
};
