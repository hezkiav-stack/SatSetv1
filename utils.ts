

import { Category, Difficulty, Theme } from './types';

export const themes: Record<Theme, string> = {
  rose: 'bg-rose-400',
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
  violet: 'bg-violet-400',
  amber: 'bg-amber-400',
};

export const getTimeUntilDeadline = (deadline: string): { days: number; hours: number; minutes: number; totalHours: number; isPast: boolean } => {
  const now = new Date();
  const target = new Date(deadline);

  if (isNaN(target.getTime())) { // Invalid date string
    return { days: 0, hours: 0, minutes: 0, totalHours: 0, isPast: false };
  }
  
  let diffTime = target.getTime() - now.getTime();
  const isPast = diffTime < 0;
  
  diffTime = Math.abs(diffTime);

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  const totalHours = diffTime / (1000 * 60 * 60);

  return { days, hours, minutes, totalHours, isPast };
};


export const calculateCategoryAndWeight = (deadline: string, difficulty: Difficulty, urgentDays: number): { category: Category, weight: number } => {
  const { totalHours, isPast } = getTimeUntilDeadline(deadline);
  const isUrgent = isPast || totalHours < (urgentDays * 24);
  const isHard = difficulty === Difficulty.HARD;

  if (isHard && isUrgent) {
    return { category: Category.RED, weight: 4 };
  } else if (isHard && !isUrgent) {
    return { category: Category.ORANGE, weight: 3 };
  } else if (!isHard && isUrgent) {
    return { category: Category.YELLOW, weight: 2 };
  } else {
    // !isHard && !isUrgent
    return { category: Category.GREEN, weight: 1 };
  }
};

export const getCategoryStyles = (category: Category) => {
  switch (category) {
    case Category.RED:
      return {
        bg: 'bg-red-100',
        border: 'border-red-500',
        text: 'text-red-700',
        badge: 'bg-red-500 text-white',
        label: 'Sulit & Mendesak',
        icon: '🟥'
      };
    case Category.ORANGE:
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-500',
        text: 'text-orange-800',
        badge: 'bg-orange-500 text-white',
        label: 'Sulit & Tidak Mendesak',
        icon: '🟧'
      };
    case Category.YELLOW:
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-500',
        text: 'text-yellow-800',
        badge: 'bg-yellow-500 text-white',
        label: 'Mudah & Mendesak',
        icon: '🟨'
      };
    case Category.GREEN:
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-800',
        badge: 'bg-green-500 text-white',
        label: 'Ringan & Rutin',
        icon: '🟩'
      };
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatDurationReadable = (totalSeconds: number): string => {
  if (totalSeconds === 0) return "0 Menit";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} Jam ${minutes} Menit`;
  }
  return `${minutes} Menit`;
};

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    await Notification.requestPermission();
  }
};

export const sendNotification = (title: string, body: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};