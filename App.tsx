
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Theme, Page, AppSettings, Task, Category, Difficulty, Phase } from './types';
import { themes, playNotificationSound, sendNotification } from './utils';
import Sidebar from './components/Sidebar';
import ToDoPage from './components/ToDoPage';
import PomodoroPage from './components/PomodoroPage';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import { Menu, LogOut, Loader2 } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  urgentDays: 3,
  pomodoro: {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStart: false,
  },
};

const App: React.FC = () => {
  // --- SESSION STATE ---
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // --- THEME STATE ---
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('study-theme');
    return (savedTheme && themes[savedTheme as Theme]) ? (savedTheme as Theme) : 'sky';
  });

  useEffect(() => {
    localStorage.setItem('study-theme', currentTheme);
  }, [currentTheme]);

  // --- SETTINGS STATE ---
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('study-app-settings');
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('study-app-settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // --- NAVIGATION STATE ---
  const [activePage, setActivePage] = useState<Page>('todo');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- TASKS STATE ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // --- TIMER STATE ---
  const [phase, setPhase] = useState<Phase>('work');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(appSettings.pomodoro.work * 60);
  const [sessionTotalDuration, setSessionTotalDuration] = useState(appSettings.pomodoro.work * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [dailyStats, setDailyStats] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('pomodoro-stats-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed;
      } catch {}
    }
    return { date: today, count: 0, totalSeconds: 0 };
  });

  useEffect(() => {
    localStorage.setItem('pomodoro-stats-v2', JSON.stringify(dailyStats));
  }, [dailyStats]);

  // --- AUTH ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session) await fetchTasks();
      } catch (error: any) {
        console.error("Auth session error:", error.message);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTasks();
      else setTasks([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- API CALLS ---
  const fetchTasks = async () => {
    setIsDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setTasks(data.map((t: any) => ({
          id: t.id,
          subject: t.subject,
          deadline: t.deadline,
          difficulty: t.difficulty as Difficulty,
          category: t.category as Category,
          weight: t.weight,
          status: t.status,
          createdAt: Number(t.created_at),
          timeEstimate: t.time_estimate,
          timeLogged: t.time_logged
        })));
      }
    } catch (error: any) {
      console.error('Fetch error:', error.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  const addTaskToSupabase = async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (!session) return;
    const createdAt = Date.now();
    const { data, error } = await supabase.from('tasks').insert([{
      user_id: session.user.id,
      subject: newTask.subject,
      deadline: newTask.deadline,
      difficulty: newTask.difficulty,
      category: newTask.category,
      weight: newTask.weight,
      status: newTask.status,
      created_at: createdAt,
      time_estimate: newTask.timeEstimate,
      time_logged: newTask.timeLogged
    }]).select();

    if (error) {
      alert(`Gagal simpan: ${error.message}`);
      return;
    }
    if (data) fetchTasks();
  };

  const updateTaskInSupabase = async (id: string, updates: Partial<Task>) => {
    if (!session) return;
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.weight) dbUpdates.weight = updates.weight;
    if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
    if (updates.timeLogged !== undefined) dbUpdates.time_logged = updates.timeLogged;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) {
      alert(`Gagal update: ${error.message}`);
    } else {
      fetchTasks();
    }
  };

  const deleteTaskInSupabase = async (id: string) => {
    if (!session) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      alert(`Gagal hapus: ${error.message}`);
    } else {
      fetchTasks();
    }
  };

  // --- TIMER LOGIC (CRITICAL FIXES HERE) ---

  // 1. Initializer Effect: Only runs when phase or settings change AND timer is NOT active
  useEffect(() => {
    if (!isActive) {
      const duration = appSettings.pomodoro[phase] * 60;
      setTimeLeft(duration);
      setSessionTotalDuration(duration);
    }
  }, [phase, appSettings.pomodoro]);

  // 2. Ticker Effect: Runs only when isActive is true
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playNotificationSound();
    
    // Log time and update stats
    if (phase === 'work') {
      const workDuration = sessionTotalDuration; 
      logTimeForActiveTask(workDuration);
      updateDailyStats(workDuration, true);
    }
    
    // Cycle Management
    let nextPhase: Phase = 'work';
    if (phase === 'work') {
      sendNotification("Fokus Selesai!", "Kerja bagus! Waktunya istirahat.");
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      nextPhase = (newCycle >= 4) ? 'longBreak' : 'shortBreak';
      if (newCycle >= 4) setCycleCount(0);
    } else {
      nextPhase = 'work';
      sendNotification("Istirahat Selesai!", "Ayo kembali fokus bekerja.");
    }

    setPhase(nextPhase);
    
    if (appSettings.pomodoro.autoStart) {
      // Small timeout to allow state to settle
      setTimeout(() => setIsActive(true), 100);
    }
  };

  const logTimeForActiveTask = (secondsWorked: number) => {
    if (!activeTaskId || secondsWorked <= 0) return;
    const task = tasks.find(t => t.id === activeTaskId);
    if (!task) return;

    const newLogged = task.timeLogged + secondsWorked;
    const updates: Partial<Task> = { timeLogged: newLogged };
    
    // Automatically complete if log meets estimate
    if ((newLogged / 60) >= task.timeEstimate) {
      updates.status = 'completed';
      updates.timeLogged = task.timeEstimate * 60;
      setActiveTaskId(null);
    }
    
    updateTaskInSupabase(activeTaskId, updates);
  };

  const updateDailyStats = (secondsToAdd: number, isSessionComplete: boolean) => {
    const today = new Date().toDateString();
    setDailyStats(prev => {
      const sameDay = prev.date === today;
      return {
        date: today,
        count: isSessionComplete ? (sameDay ? prev.count + 1 : 1) : (sameDay ? prev.count : 0),
        totalSeconds: sameDay ? prev.totalSeconds + secondsToAdd : secondsToAdd
      };
    });
  };

  // --- HANDLERS ---
  const handleStartPomodoro = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setActiveTaskId(taskId);
    setPhase('work');
    const remaining = (task.timeEstimate * 60) - task.timeLogged;
    const duration = remaining > 0 ? remaining : appSettings.pomodoro.work * 60;
    
    setTimeLeft(duration);
    setSessionTotalDuration(duration);
    setIsActive(true);
    setActivePage('pomodoro');
  };

  const handleToggleTimer = () => setIsActive(!isActive);

  const handleStopTimer = () => {
    if (phase === 'work' && activeTaskId) {
      const elapsed = sessionTotalDuration - timeLeft;
      if (elapsed > 10) { // Only log if more than 10s elapsed
        logTimeForActiveTask(elapsed);
        updateDailyStats(elapsed, false);
      }
    }
    
    setIsActive(false);
    setActiveTaskId(null);
    setPhase('work');
    const defaultWork = appSettings.pomodoro.work * 60;
    setTimeLeft(defaultWork);
    setSessionTotalDuration(defaultWork);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isAuthLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (!session) return <AuthPage />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        currentTheme={currentTheme} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex-1 md:ml-64 transition-all duration-300">
        <div className="md:hidden p-4 flex items-center justify-between bg-white shadow-sm sticky top-0 z-30">
          <span className="font-bold text-slate-700">Smart Study</span>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        <div className="flex justify-end p-4 md:p-8 pb-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 transition"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>

        <main className="p-4 md:p-8 min-h-screen">
          {activePage === 'todo' && (
            <ToDoPage 
              currentTheme={currentTheme} 
              urgentDays={appSettings.urgentDays}
              tasks={tasks}
              activeTaskId={activeTaskId}
              onAddTask={addTaskToSupabase}
              onMoveToToday={(t) => updateTaskInSupabase(t.id, {status: 'today'})}
              onChangeTaskCategory={(id, cat) => updateTaskInSupabase(id, {category: cat})}
              onMarkCompleted={(id) => updateTaskInSupabase(id, {status: 'completed'})}
              onCancelTask={(id) => updateTaskInSupabase(id, {status: 'backlog'})}
              onDeleteTask={deleteTaskInSupabase}
              onStartPomodoro={handleStartPomodoro}
            />
          )}
          
          {activePage === 'pomodoro' && (
            <PomodoroPage 
              currentTheme={currentTheme}
              settings={appSettings.pomodoro}
              tasks={tasks}
              activeTaskId={activeTaskId}
              phase={phase}
              timeLeft={timeLeft}
              isActive={isActive}
              cycleCount={cycleCount}
              totalDuration={sessionTotalDuration}
              dailyStats={dailyStats}
              onToggleTimer={handleToggleTimer}
              onStop={handleStopTimer}
              onSwitchPhase={setPhase}
              onSkipBreak={() => {setIsActive(false); setPhase('work');}}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage 
              settings={appSettings}
              onSettingsChange={setAppSettings}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
