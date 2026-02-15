
import React from 'react';
import { Widget } from '../../types';

interface WidgetProps {
  widget: Widget;
  isTeacher: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
}

export const PollWidget: React.FC<WidgetProps> = ({ widget, isTeacher, onUpdate }) => {
  const { question, options, showResults } = widget.settings;
  const { results } = widget.state;

  const totalVotes = results.reduce((a: number, b: number) => a + b, 0);
  const maxVotes = Math.max(...results, 1);

  const handleUpdateOption = (index: number, val: string) => {
    const nextOptions = [...options];
    nextOptions[index] = val;
    onUpdate({ settings: { ...widget.settings, options: nextOptions } });
  };

  const handleUpdateResult = (index: number, delta: number) => {
    const nextResults = [...results];
    nextResults[index] = Math.max(0, nextResults[index] + delta);
    onUpdate({ state: { ...widget.state, results: nextResults } });
  };

  return (
    <div className="flex flex-col bg-white/40 p-4 md:p-6 space-y-4 w-full" style={{ maxWidth: 'clamp(360px, 42vw, 560px)' }}>
      <div className="space-y-1.5">
        {isTeacher ? (
          <>
            <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Poll Question</label>
            <input
              type="text"
              value={question}
              placeholder="Type your question here..."
              onChange={(e) => onUpdate({ settings: { ...widget.settings, question: e.target.value }})}
              className="w-full text-lg font-extrabold bg-white/80 border-2 border-transparent focus:border-focus rounded-xl px-4 py-2 transition-all duration-300 text-text-main shadow-sm"
            />
          </>
        ) : (
          <h2 className="text-2xl font-black text-text-main leading-tight tracking-tight px-1">{question || "Class Poll"}</h2>
        )}
      </div>

      <div className="flex flex-col space-y-4 overflow-y-auto pr-2 scrollbar-hide" style={{ maxHeight: '65vh' }}>
        {options.map((opt: string, i: number) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((results[i] / totalVotes) * 100);
          return (
            <div key={i} className="flex flex-col space-y-3 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between gap-3">
                {isTeacher ? (
                  <input
                    type="text"
                    value={opt}
                    placeholder={`Option ${i+1}`}
                    onChange={(e) => handleUpdateOption(i, e.target.value)}
                    className="flex-1 p-4 text-base font-bold bg-white border-2 border-border-default rounded-2xl shadow-sm focus:border-focus transition-all outline-none text-text-main min-h-[48px]"
                  />
                ) : (
                  <button className="flex-1 text-left p-4 text-base font-bold bg-white/80 hover:bg-white border-2 border-border-default hover:border-primary rounded-2xl shadow-sm transition-all text-text-main min-h-[48px]">
                    {opt}
                  </button>
                )}

                {isTeacher && (
                  <div className="flex items-center gap-2 bg-bg-alt p-1.5 rounded-2xl border border-border-default">
                    <button
                      onClick={() => handleUpdateResult(i, -1)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-red-50 text-text-secondary hover:text-red-600 transition-all font-bold text-xl active:scale-90"
                    >–</button>
                    <span className="text-base font-black w-12 text-center tabular-nums text-text-main">{results[i]}</span>
                    <button
                      onClick={() => handleUpdateResult(i, 1)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary shadow-lg shadow-glow hover:bg-primary-hover text-white transition-all font-bold text-xl active:scale-90"
                    >+</button>
                  </div>
                )}
              </div>

              {showResults && (
                <div className="relative h-[10px] bg-bg-alt rounded-full overflow-hidden border border-border-default shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)] relative rounded-full"
                      style={{ width: `${(results[i] / maxVotes) * 100}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full" />
                    </div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-secondary">{percentage}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isTeacher && (
        <div className="pt-3 border-t border-border-default flex items-center justify-between">
           <button
             onClick={() => onUpdate({ settings: { ...widget.settings, showResults: !showResults }})}
             className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2.5 ${showResults ? 'bg-focus-light text-focus border border-focus' : 'bg-bg-alt text-text-secondary hover:bg-gray-200 border border-transparent'}`}
           >
             <div className={`w-2.5 h-2.5 rounded-full ${showResults ? 'bg-focus animate-pulse' : 'bg-gray-400'}`} />
             {showResults ? 'Public Results' : 'Show Results'}
           </button>
           <button
             onClick={() => {
                const newOpts = [...options, `Option ${options.length + 1}`];
                const newRes = [...results, 0];
                onUpdate({
                  settings: { ...widget.settings, options: newOpts },
                  state: { ...widget.state, results: newRes }
                });
             }}
             className="px-4 py-2 text-primary text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/5 rounded-xl transition-colors flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
             Add Option
           </button>
        </div>
      )}
    </div>
  );
};
