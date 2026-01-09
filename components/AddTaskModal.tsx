


import React, { useState } from 'react';
import { X, Calendar, BookOpen, AlertCircle, Timer } from 'lucide-react';
import { Difficulty, Task } from '../types';
import { calculateCategoryAndWeight } from '../utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  themeColor: string;
  urgentDays: number;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, themeColor, urgentDays }) => {
  const [subject, setSubject] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [timeEstimate, setTimeEstimate] = useState(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !deadlineDate || !deadlineTime) return;

    const fullDeadline = `${deadlineDate}T${deadlineTime}`;
    const { category, weight } = calculateCategoryAndWeight(fullDeadline, difficulty, urgentDays);

    onSave({
      subject,
      deadline: fullDeadline,
      difficulty,
      category,
      weight,
      status: 'backlog',
      timeEstimate,
      timeLogged: 0,
    });

    // Reset and close
    setSubject('');
    setDeadlineDate('');
    setDeadlineTime('23:59');
    setDifficulty(Difficulty.EASY);
    setTimeEstimate(25);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        <div className={`p-4 flex justify-between items-center ${themeColor} text-white`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} />
            Tugas Baru
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mata Pelajaran / Judul Tugas</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Contoh: Matematika - Aljabar"
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Calendar size={16} />
              Deadline
            </label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
              <input 
                type="time" 
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-auto px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <AlertCircle size={16} />
              Tingkat Kesulitan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDifficulty(Difficulty.HARD)}
                className={`p-3 rounded-xl border-2 transition text-center ${
                  difficulty === Difficulty.HARD 
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold' 
                    : 'border-slate-200 text-slate-600 hover:border-red-200'
                }`}
              >
                SULIT
                <span className="block text-xs font-normal mt-1 opacity-75">Butuh banyak waktu</span>
              </button>
              <button
                type="button"
                onClick={() => setDifficulty(Difficulty.EASY)}
                className={`p-3 rounded-xl border-2 transition text-center ${
                  difficulty === Difficulty.EASY 
                    ? 'border-green-500 bg-green-50 text-green-700 font-bold' 
                    : 'border-slate-200 text-slate-600 hover:border-green-200'
                }`}
              >
                MUDAH
                <span className="block text-xs font-normal mt-1 opacity-75">Ringan / Rutin</span>
              </button>
            </div>
             <p className="text-xs text-slate-500 mt-2">
              *Prioritas (Warna) ditentukan oleh kesulitan & jarak deadline.
            </p>
          </div>

          {/* Time Estimate */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Timer size={16}/>
                Estimasi Waktu (menit)
            </label>
            <input 
                type="number"
                min="1"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
            />
            <p className="text-xs text-slate-500 mt-2">
              Berapa menit waktu yang dibutuhkan untuk menyelesaikan tugas ini?
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition ${themeColor.replace('bg-', 'hover:bg-opacity-90 bg-')}`}
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;