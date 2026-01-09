
import React, { useState, useEffect } from 'react';
import { AppSettings, Theme } from '../types';
import { themes } from '../utils';
import { SlidersHorizontal, Timer, Palette } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange, currentTheme, onThemeChange }) => {
  const [localPomodoro, setLocalPomodoro] = useState({
    work: String(settings.pomodoro.work),
    shortBreak: String(settings.pomodoro.shortBreak),
    longBreak: String(settings.pomodoro.longBreak),
  });

  useEffect(() => {
    // This effect syncs the local state if the parent props change.
    setLocalPomodoro({
      work: String(settings.pomodoro.work),
      shortBreak: String(settings.pomodoro.shortBreak),
      longBreak: String(settings.pomodoro.longBreak),
    });
  }, [settings.pomodoro]);

  const handlePomodoroInputChange = (key: keyof AppSettings['pomodoro'], value: string) => {
    // Allow only digits and keep the value as a string.
    const filteredValue = value.replace(/[^0-9]/g, '');
    setLocalPomodoro(prev => ({ ...prev, [key]: filteredValue }));
  };

  const handlePomodoroInputBlur = (key: keyof AppSettings['pomodoro']) => {
    const localValue = localPomodoro[key];
    let numValue = Number(localValue);

    // If the input is empty or 0, default to 1 minute.
    if (isNaN(numValue) || numValue < 1) {
      numValue = 1;
    }

    // Update the global state
    onSettingsChange({
      ...settings,
      pomodoro: {
        ...settings.pomodoro,
        [key]: numValue,
      },
    });
    // The useEffect will sync the local state back to the new valid number string.
  };
  
  const handleAutoStartToggle = () => {
     onSettingsChange({
      ...settings,
      pomodoro: {
        ...settings.pomodoro,
        autoStart: !settings.pomodoro.autoStart,
      },
    });
  };

  const handleUrgentDaysChange = (days: number) => {
    if (days < 1) return; // Prevent setting to 0 or negative
    onSettingsChange({
      ...settings,
      urgentDays: days,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="mb-8">
         <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
         <p className="text-slate-500">Atur preferensi aplikasi sesuai kebutuhanmu.</p>
      </header>

      {/* To-Do Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
          <SlidersHorizontal className="text-blue-500" />
          Pengaturan To-Do List
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-slate-50 rounded-xl">
          <div className="text-sm">
            <label htmlFor="urgentDays" className="font-medium text-slate-700">Batas Mendesak (Urgent)</label>
            <p className="text-slate-500">Tugas dianggap mendesak jika deadline kurang dari hari yang ditentukan.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              id="urgentDays"
              type="number" 
              value={settings.urgentDays}
              onChange={(e) => handleUrgentDaysChange(Number(e.target.value))}
              className="w-20 p-2 text-center rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-sm text-slate-600">Hari</span>
          </div>
        </div>
      </div>

      {/* Pomodoro Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
          <Timer className="text-green-500" />
          Pengaturan Pomodoro (Menit)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-1">Fokus</label>
             <input 
               type="text"
               inputMode="numeric"
               value={localPomodoro.work}
               onChange={(e) => handlePomodoroInputChange('work', e.target.value)}
               onBlur={() => handlePomodoroInputBlur('work')}
               className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-1">Istirahat Pendek</label>
             <input 
               type="text"
               inputMode="numeric"
               value={localPomodoro.shortBreak}
               onChange={(e) => handlePomodoroInputChange('shortBreak', e.target.value)}
               onBlur={() => handlePomodoroInputBlur('shortBreak')}
               className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-1">Istirahat Panjang</label>
             <input 
               type="text"
               inputMode="numeric"
               value={localPomodoro.longBreak}
               onChange={(e) => handlePomodoroInputChange('longBreak', e.target.value)}
               onBlur={() => handlePomodoroInputBlur('longBreak')}
               className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
             />
           </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
           <div className="text-sm">
             <span className="font-medium text-slate-700">Mulai Otomatis?</span>
             <p className="text-slate-500">Mulai sesi berikutnya secara otomatis tanpa menekan start.</p>
           </div>
           <button 
             onClick={handleAutoStartToggle}
             className={`w-12 h-6 rounded-full transition-colors relative ${settings.pomodoro.autoStart ? 'bg-green-500' : 'bg-slate-300'}`}
           >
             <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.pomodoro.autoStart ? 'left-7' : 'left-1'}`} />
           </button>
        </div>
      </div>
      
      {/* Theme Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
          <Palette className="text-violet-500" />
          Tampilan & Warna (Pastel)
        </h3>
         <div className="flex justify-center gap-4 p-4 bg-slate-50 rounded-xl">
            {(Object.keys(themes) as Theme[]).map(theme => (
              <button
                key={theme}
                onClick={() => onThemeChange(theme)}
                className={`w-10 h-10 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 ${themes[theme]} ${currentTheme === theme ? 'ring-4 ring-offset-2 ring-slate-300' : ''}`}
                title={theme.charAt(0).toUpperCase() + theme.slice(1)}
              />
            ))}
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;