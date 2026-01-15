import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import type { DayData, WeekData } from '@/types';

export function getWeekData(date: Date): WeekData {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const today = startOfDay(new Date());

  const days: DayData[] = eachDayOfInterval({ start, end }).map((d) => ({
    date: d,
    dayName: format(d, 'EEE').toUpperCase(),
    dateNumber: d.getDate(),
    isToday: isToday(d),
    isPast: isBefore(d, today),
  }));

  const label = `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;

  return { startDate: start, endDate: end, days, label };
}

export function getNextWeek(date: Date): Date {
  return addWeeks(date, 1);
}

export function getPrevWeek(date: Date): Date {
  return subWeeks(date, 1);
}

export function formatWeekLabel(start: Date, end: Date): string {
  return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
}
