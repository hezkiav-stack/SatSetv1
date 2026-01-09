import React from 'react';
import { Task } from '../types';
import { getCategoryStyles } from '../utils';
import { CheckCircle2, XCircle, Trash2, CalendarClock, PlayCircle, Loader2 } from 'lucide-react';

interface TodayListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onStartPomodoro: (id: string) => void;
  activeTaskId: string | null;
  currentWeight: number;
}

const TodayList: React.FC<TodayListProps> = ({ tasks, onComplete, onCancel, onDelete, onStartPomodoro, activeTaskId, currentWeight }) => {
  const activeTasks = tasks.filter(t => t.status === 'today');
  const completedToday = tasks.filter(t => t.status === 'completed');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <CalendarClock className="text-blue-600" />
          Target Hari Ini
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
          currentWeight > 7 ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'
        }`}>
          Bobot: {currentWeight} / 7
        </div>
      </div>

      <div className="p-4 min-h-[200px]">
        {activeTasks.length === 0 && completedToday.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Belum ada tugas yang dipilih hari ini.</p>
            <p className="text-sm">Klik tugas di bagan atas untuk mengerjakannya!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Items */}
            {activeTasks.map(task => {
              const styles = getCategoryStyles(task.category);
              const isTaskActive = task.id === activeTaskId;
              const loggedMinutes = Math.floor(task.timeLogged / 60);

              return (
                <div key={task.id} className={`flex items-center justify-between p-3 bg-white border rounded-xl hover:shadow-md transition group ${isTaskActive ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                     <div className={`w-2 h-10 rounded-full ${styles.badge}`}></div>
                     <div className="flex-1 overflow-hidden">
                       <h4 className="font-bold text-slate-800 truncate">{task.subject}</h4>
                       <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                            Bobot {task.weight}
                          </span>
                           <span className="text-slate-500 font-medium">
                            {loggedMinutes} / {task.timeEstimate} mnt
                           </span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 pl-2">
                    {isTaskActive ? (
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-sm px-3">
                        <Loader2 size={16} className="animate-spin" />
                        <span>FOKUS...</span>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => onCancel(task.id)}
                          className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                          title="Batalkan (Kembali ke Bagan)"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => onDelete(task.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Permanen"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button 
                          onClick={() => onStartPomodoro(task.id)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Mulai Sesi Fokus"
                        >
                          <PlayCircle size={24} />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => onComplete(task.id)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                      title="Tandai Selesai"
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Completed Items */}
            {completedToday.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Selesai</h4>
                {completedToday.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl opacity-75">
                     <div className="flex items-center gap-3">
                       <div className="w-2 h-10 rounded-full bg-slate-300"></div>
                       <div>
                         <h4 className="font-bold text-slate-500 line-through">{task.subject}</h4>
                         <span className="text-xs text-slate-400">
                           Selesai dalam {Math.ceil(task.timeLogged / 60)} menit dari estimasi {task.timeEstimate} menit
                         </span>
                       </div>
                    </div>
                    <button onClick={() => onDelete(task.id)} className="text-slate-300 hover:text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayList;