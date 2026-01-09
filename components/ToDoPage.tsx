

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Theme, Category } from '../types';
import { themes } from '../utils';
import AddTaskModal from './AddTaskModal';
import ProgressBar from './ProgressBar';
import TaskMatrix from './TaskMatrix';
import TodayList from './TodayList';

interface ToDoPageProps {
  currentTheme: Theme;
  urgentDays: number;
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt'>) => void;
  onMoveToToday: (task: Task) => void;
  onChangeTaskCategory: (taskId: string, newCategory: Category) => void;
  onMarkCompleted: (id: string) => void;
  onCancelTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (id: string) => void;
}

const ToDoPage: React.FC<ToDoPageProps> = ({ 
  currentTheme, 
  urgentDays, 
  tasks,
  activeTaskId,
  onAddTask,
  onMoveToToday,
  onChangeTaskCategory,
  onMarkCompleted,
  onCancelTask,
  onDeleteTask,
  onStartPomodoro
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats derived from props
  const todayTasks = tasks.filter(t => t.status === 'today' || (t.status === 'completed' && new Date(t.deadline).toDateString() === new Date().toDateString())); // Simplified logic, can be improved
  const activeTodayTasks = tasks.filter(t => t.status === 'today');
  const completedTodayTasks = tasks.filter(t => t.status === 'completed');
  
  const totalToday = activeTodayTasks.length + completedTodayTasks.length;
  const completedCount = completedTodayTasks.length;

  const currentWeight = activeTodayTasks.reduce((acc, t) => acc + t.weight, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
         <h2 className="text-2xl font-bold text-slate-800">Dashboard Tugas</h2>
         <p className="text-slate-500">Kelola prioritas dan selesaikan target harianmu.</p>
      </header>

      {/* Progress Bar */}
      <ProgressBar 
        completed={completedCount} 
        total={totalToday} 
        themeColor={themes[currentTheme]} 
      />

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className={`${themes[currentTheme]} text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-900/10 hover:shadow-xl hover:scale-105 transition flex items-center gap-2`}
        >
          <Plus size={20} />
          Tambah Tugas
        </button>
      </div>

      {/* Matrix */}
      <div className="mb-8">
        <h3 className="text-slate-600 font-bold mb-3 px-1">Bagan Prioritas <span className="text-xs font-normal text-slate-400">(Klik tugas untuk kerjakan hari ini)</span></h3>
        <TaskMatrix 
          tasks={tasks} 
          onMoveToToday={onMoveToToday} 
          onUpdateCategory={onChangeTaskCategory}
        />
      </div>

      {/* Today List */}
      <TodayList 
        tasks={tasks}
        onComplete={onMarkCompleted}
        onCancel={onCancelTask}
        onDelete={onDeleteTask}
        onStartPomodoro={onStartPomodoro}
        activeTaskId={activeTaskId}
        currentWeight={currentWeight}
      />

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={onAddTask}
        themeColor={themes[currentTheme]}
        urgentDays={urgentDays}
      />
    </div>
  );
};

export default ToDoPage;