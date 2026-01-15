'use client';

import { format } from 'date-fns';
import { DayColumn } from './DayColumn';
import type { WeekData, Task } from '@/types';

interface WeeklyGridProps {
  weekData: WeekData;
  tasksByDate: Record<string, Task[]>;
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export function WeeklyGrid({
  weekData,
  tasksByDate,
  onTaskComplete,
  onTaskClick,
}: WeeklyGridProps) {
  return (
    <div className="flex-1 overflow-x-auto" data-testid="weekly-grid">
      <div className="flex min-w-[840px] h-full">
        {weekData.days.map((day) => {
          const dateKey = format(day.date, 'yyyy-MM-dd');
          return (
            <DayColumn
              key={day.date.toISOString()}
              day={day}
              tasks={tasksByDate[dateKey] || []}
              onTaskComplete={onTaskComplete}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
}
