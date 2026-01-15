export type TaskCategory = 'meeting' | 'general' | 'urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  position: number;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  position: number;
  category: 'meeting' | 'general' | 'urgent';
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    scheduledDate: row.scheduled_date,
    position: row.position,
    category: row.category,
    isCompleted: row.is_completed,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface WeekStats {
  completed: number;
  pending: number;
  completionRate: number;
  streak: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface DayData {
  date: Date;
  dayName: string;      // "MON", "TUE", etc.
  dateNumber: number;   // 1-31
  isToday: boolean;
  isPast: boolean;
}

export interface WeekData {
  startDate: Date;      // Monday
  endDate: Date;        // Sunday
  days: DayData[];
  label: string;        // "Jan 20 - 26, 2025"
}
