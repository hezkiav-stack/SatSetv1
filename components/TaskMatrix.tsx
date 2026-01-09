

import React, { useState, useEffect, useRef } from 'react';
import { Category, Task } from '../types';
import { getCategoryStyles, getTimeUntilDeadline } from '../utils';
import { Clock, PlusCircle, MoreHorizontal } from 'lucide-react';

interface TaskMatrixProps {
  tasks: Task[];
  onMoveToToday: (task: Task) => void;
  onUpdateCategory: (taskId: string, newCategory: Category) => void;
}

const TaskItem: React.FC<{
  task: Task;
  onMoveToToday: (task: Task) => void;
  onUpdateCategory: (taskId: string, newCategory: Category) => void;
  styles: any;
}> = ({ task, onMoveToToday, onUpdateCategory, styles }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const deadlineInfo = getTimeUntilDeadline(task.deadline);
  
  const formatDeadlineText = () => {
    if (deadlineInfo.isPast) return 'Terlewat';
    if (deadlineInfo.days > 1) return `${deadlineInfo.days} hari lagi`;
    if (deadlineInfo.days === 1) return 'Besok';
    if (deadlineInfo.totalHours >= 1) return `${Math.floor(deadlineInfo.hours)} jam lagi`;
    if (deadlineInfo.minutes > 0) return `${deadlineInfo.minutes} menit lagi`;
    return 'Segera!';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative group bg-white/60 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-400 transition-all p-2.5">
      {/* Main Click Area */}
      <button
        onClick={() => onMoveToToday(task)}
        className="w-full text-left pr-6"
        title="Klik untuk kerjakan hari ini"
      >
        <h4 className={`font-semibold text-sm ${styles.text} line-clamp-1`}>{task.subject}</h4>
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDeadlineText()}
          </span>
          <PlusCircle size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      {/* Settings Dropdown Trigger */}
      <div className="absolute top-2 right-2" ref={menuRef}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition opacity-0 group-hover:opacity-100"
          title="Ubah Prioritas"
        >
          <MoreHorizontal size={16} />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-full right-0 mt-1 z-20 bg-white rounded-xl shadow-xl border border-slate-100 p-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
             <div className="text-xs font-semibold text-slate-400 mb-2 px-1">Pindah ke:</div>
             <div className="flex gap-2 justify-between">
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateCategory(task.id, Category.RED); setShowMenu(false); }}
                  className={`w-6 h-6 rounded-full border border-slate-200 bg-red-500 hover:scale-110 hover:ring-2 hover:ring-red-300 transition ${task.category === Category.RED ? 'ring-2 ring-red-300' : ''}`}
                  title="Sulit & Mendesak"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateCategory(task.id, Category.ORANGE); setShowMenu(false); }}
                  className={`w-6 h-6 rounded-full border border-slate-200 bg-orange-500 hover:scale-110 hover:ring-2 hover:ring-orange-300 transition ${task.category === Category.ORANGE ? 'ring-2 ring-orange-300' : ''}`}
                  title="Sulit & Tidak Mendesak"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateCategory(task.id, Category.YELLOW); setShowMenu(false); }}
                  className={`w-6 h-6 rounded-full border border-slate-200 bg-yellow-500 hover:scale-110 hover:ring-2 hover:ring-yellow-300 transition ${task.category === Category.YELLOW ? 'ring-2 ring-yellow-300' : ''}`}
                  title="Mudah & Mendesak"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateCategory(task.id, Category.GREEN); setShowMenu(false); }}
                  className={`w-6 h-6 rounded-full border border-slate-200 bg-green-500 hover:scale-110 hover:ring-2 hover:ring-green-300 transition ${task.category === Category.GREEN ? 'ring-2 ring-green-300' : ''}`}
                  title="Ringan & Rutin"
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MatrixQuadrant: React.FC<{
  category: Category;
  tasks: Task[];
  onMoveToToday: (task: Task) => void;
  onUpdateCategory: (taskId: string, newCategory: Category) => void;
}> = ({ category, tasks, onMoveToToday, onUpdateCategory }) => {
  const styles = getCategoryStyles(category);

  return (
    <div className={`rounded-xl border-2 ${styles.border} ${styles.bg} flex flex-col h-full overflow-hidden shadow-sm`}>
      <div className={`px-3 py-2 ${styles.badge} flex justify-between items-center`}>
        <span className="font-bold text-sm flex items-center gap-1">
          {styles.icon} {styles.label}
        </span>
        <span className="text-xs font-mono bg-white/20 px-1.5 py-0.5 rounded">Bobot: {tasks.length > 0 ? tasks[0].weight : '-'}</span>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto max-h-60 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-4">
            <span className="text-2xl mb-1">🍃</span>
            <p className="text-xs font-medium">Tidak ada tugas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onMoveToToday={onMoveToToday} 
                onUpdateCategory={onUpdateCategory}
                styles={styles} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks, onMoveToToday, onUpdateCategory }) => {
  const redTasks = tasks.filter(t => t.category === Category.RED && t.status === 'backlog');
  const orangeTasks = tasks.filter(t => t.category === Category.ORANGE && t.status === 'backlog');
  const yellowTasks = tasks.filter(t => t.category === Category.YELLOW && t.status === 'backlog');
  const greenTasks = tasks.filter(t => t.category === Category.GREEN && t.status === 'backlog');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <MatrixQuadrant category={Category.RED} tasks={redTasks} onMoveToToday={onMoveToToday} onUpdateCategory={onUpdateCategory} />
      <MatrixQuadrant category={Category.ORANGE} tasks={orangeTasks} onMoveToToday={onMoveToToday} onUpdateCategory={onUpdateCategory} />
      <MatrixQuadrant category={Category.YELLOW} tasks={yellowTasks} onMoveToToday={onMoveToToday} onUpdateCategory={onUpdateCategory} />
      <MatrixQuadrant category={Category.GREEN} tasks={greenTasks} onMoveToToday={onMoveToToday} onUpdateCategory={onUpdateCategory} />
    </div>
  );
};

export default TaskMatrix;