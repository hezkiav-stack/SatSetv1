

export enum Difficulty {
  HARD = 'HARD',
  EASY = 'EASY'
}

export enum Category {
  RED = 'RED',       // Sulit & Mendesak (4)
  ORANGE = 'ORANGE', // Sulit & Tidak Mendesak (3)
  YELLOW = 'YELLOW', // Mudah & Mendesak (2)
  GREEN = 'GREEN'    // Mudah & Rutin (1)
}

export type TaskStatus = 'backlog' | 'today' | 'completed';

export interface Task {
  id: string;
  subject: string;
  deadline: string; // ISO Date string
  difficulty: Difficulty;
  category: Category;
  weight: number;
  status: TaskStatus;
  createdAt: number;
  timeEstimate: number; // in minutes
  timeLogged: number;   // in seconds
}

export type Theme = 'rose' | 'sky' | 'emerald' | 'violet' | 'amber';

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
}

export interface PomodoroSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  autoStart: boolean;
}

export interface AppSettings {
  urgentDays: number;
  pomodoro: PomodoroSettings;
}

export type Page = 'todo' | 'pomodoro' | 'settings';
export type Phase = 'work' | 'shortBreak' | 'longBreak';