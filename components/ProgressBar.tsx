import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  themeColor: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, themeColor }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Progress Hari Ini</h2>
          <div className="text-3xl font-bold text-slate-800">
            {percentage}% <span className="text-base font-medium text-slate-400">({completed}/{total} Tugas)</span>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${themeColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;