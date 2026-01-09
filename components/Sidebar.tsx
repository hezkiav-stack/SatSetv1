
import React from 'react';
import { Page, Theme } from '../types';
import { themes } from '../utils';
import { LayoutDashboard, Timer, Settings, GraduationCap } from 'lucide-react';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  currentTheme: Theme;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, currentTheme, isOpen, toggleSidebar }) => {
  const themeClass = themes[currentTheme];

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const NavButton: React.FC<{ page: Page; label: string; icon: React.ReactNode }> = ({ page, label, icon }) => {
    const isActive = activePage === page;
    const activeClasses = `${themeClass.replace('bg-', 'bg-opacity-10 text-')} text-${currentTheme}-600`.replace('text-white', `text-${currentTheme}-600`) + ' bg-opacity-10';
    const inactiveClasses = 'text-slate-600 hover:bg-slate-100';

    return (
       <button
        onClick={() => handleNavigate(page)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive ? activeClasses : inactiveClasses}`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className={`p-6 ${themeClass} text-white`}>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <GraduationCap size={28} />
            Smart Study
          </h1>
          <p className="text-white/80 text-xs mt-1 font-medium">Student Productivity Tool</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavButton page="todo" label="To-Do List" icon={<LayoutDashboard size={20} />} />
          <NavButton page="pomodoro" label="Pomodoro Timer" icon={<Timer size={20} />} />
        </nav>
        
        {/* Settings Navigation */}
        <div className="p-4 border-t border-slate-100">
          <NavButton page="settings" label="Settings" icon={<Settings size={20} />} />
        </div>
        
        <div className="p-4 text-xs text-center text-slate-400">
          v1.3.0 • Settings Page
        </div>
      </aside>
    </>
  );
};

export default Sidebar;