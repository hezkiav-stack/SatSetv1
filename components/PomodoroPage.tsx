
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, FastForward, Clock, Volume2, VolumeX } from 'lucide-react';
import { Theme, PomodoroSettings, Task, Phase } from '../types';
import { themes, formatTime, formatDurationReadable, requestNotificationPermission } from '../utils';

interface PomodoroPageProps {
  currentTheme: Theme;
  settings: PomodoroSettings;
  tasks: Task[];
  activeTaskId: string | null;
  phase: Phase;
  timeLeft: number;
  isActive: boolean;
  cycleCount: number;
  totalDuration: number;
  dailyStats: { date: string, count: number, totalSeconds: number };
  onToggleTimer: () => void;
  onStop: () => void;
  onSwitchPhase: (phase: Phase) => void;
  onSkipBreak: () => void;
}

const PomodoroPage: React.FC<PomodoroPageProps> = ({
  currentTheme,
  settings,
  tasks,
  activeTaskId,
  phase,
  timeLeft,
  isActive,
  cycleCount,
  totalDuration,
  dailyStats,
  onToggleTimer,
  onStop,
  onSwitchPhase,
  onSkipBreak,
}) => {
  const [soundEnabled] = useState(true); // Sound effects are managed in App.tsx now
  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  // Update document title with timer
  useEffect(() => {
    if(isActive) {
      document.title = `${formatTime(timeLeft)} - ${phase === 'work' ? 'Fokus' : 'Istirahat'}`;
    } else {
      document.title = "Smart Study Planner";
    }
    return () => { document.title = "Smart Study Planner"; }
  }, [timeLeft, isActive, phase]);


  const getPhaseColor = () => {
    switch(phase) {
      case 'work': return themes[currentTheme];
      case 'shortBreak': return 'bg-teal-400';
      case 'longBreak': return 'bg-blue-400';
    }
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // Calculate live total focus time for display purposes.
  // This will now correctly show progress even when paused.
  const elapsedSecondsThisSession = (phase === 'work' && activeTaskId) ? totalDuration - timeLeft : 0;
  const displayTotalSeconds = dailyStats.totalSeconds + elapsedSecondsThisSession;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <header className="mb-8 text-center md:text-left">
         <h2 className="text-2xl font-bold text-slate-800">Pomodoro Timer</h2>
         {activeTask ? (
            <p className="text-slate-500 font-medium">Fokus pada: <span className={`font-bold ${themes[currentTheme].replace('bg-', 'text-')}`}>{activeTask.subject}</span></p>
         ) : (
            <p className="text-slate-500">Tetap fokus dengan teknik pomodoro.</p>
         )}
      </header>

      <div className={`rounded-3xl shadow-xl overflow-hidden text-white transition-colors duration-500 ${getPhaseColor()} relative`}>
        <div 
          className="absolute bottom-0 left-0 h-1.5 bg-white/30"
          style={{ width: `${progress}%`, transition: isActive ? 'width 1s linear' : 'none' }}
        />
        <div className="absolute top-4 right-4">
          <button 
            className={`p-2 rounded-full hover:bg-white/20 ${soundEnabled ? 'text-white' : 'text-white/50'}`}
            title={soundEnabled ? "Suara Aktif" : "Suara Mati (Fitur di App.tsx)"}
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        <div className="p-8 md:p-12 text-center">
          <div className="flex justify-center gap-2 mb-8">
             <button 
               onClick={() => onSwitchPhase('work')}
               disabled={!!(activeTaskId && isActive)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${phase === 'work' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 opacity-70'} ${!!(activeTaskId && isActive) ? 'cursor-not-allowed opacity-50' : ''}`}
             >
               Fokus
             </button>
             <button 
               onClick={() => onSwitchPhase('shortBreak')}
                disabled={!!(activeTaskId && isActive)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${phase === 'shortBreak' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 opacity-70'} ${!!(activeTaskId && isActive) ? 'cursor-not-allowed opacity-50' : ''}`}
             >
               Short Break
             </button>
             <button 
               onClick={() => onSwitchPhase('longBreak')}
               disabled={!!(activeTaskId && isActive)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${phase === 'longBreak' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 opacity-70'} ${!!(activeTaskId && isActive) ? 'cursor-not-allowed opacity-50' : ''}`}
             >
               Long Break
             </button>
          </div>

          <div className="text-[6rem] md:text-[8rem] font-bold leading-none tracking-tight font-mono mb-8 select-none">
            {formatTime(timeLeft)}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={onToggleTimer}
                className="bg-white text-slate-800 rounded-2xl px-8 py-4 font-bold text-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-3 min-w-[140px] justify-center"
              >
                {isActive ? ( <> <Pause size={24} fill="currentColor" /> Jeda </> ) : ( <> <Play size={24} fill="currentColor" /> Mulai </> )}
              </button>

              {(isActive || timeLeft < totalDuration) && (
                <button 
                  onClick={onStop}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-2xl p-4 shadow-lg transition"
                  title="Stop & Simpan Waktu (Selesaikan Sesi Tugas)"
                >
                  <Square size={24} fill="currentColor" />
                </button>
              )}
            </div>

            {phase !== 'work' && !activeTaskId && (
              <button 
                onClick={onSkipBreak}
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition text-sm font-medium mt-2"
              >
                <FastForward size={16} />
                Lewati Istirahat
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-3">
             <div className={`p-2 rounded-lg bg-opacity-10 ${themes[currentTheme].replace('bg-', 'bg-').replace('text-', 'text-')} text-${currentTheme}-600`}>
                <Clock size={20} className={`text-${currentTheme}-600`} />
             </div>
             <h3 className="font-bold text-slate-700">Waktu Fokus Hari Ini</h3>
           </div>
           
           <div className="flex flex-col gap-1">
             <div className="text-3xl font-extrabold text-slate-800">
               {formatDurationReadable(displayTotalSeconds)}
             </div>
             <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {dailyStats.count} Sesi Tuntas
                </span>
                <span>(Total Akumulasi)</span>
             </div>
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Siklus Pomodoro</span>
          <div className="flex gap-2 mb-3">
             {[0, 1, 2, 3].map(i => (
               <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < cycleCount ? themes[currentTheme] : 'bg-slate-200'}`} />
             ))}
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Mulai</span>
            <span>Long Break</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
