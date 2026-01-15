'use client';

import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import type { DayData, Task } from '@/types';

interface DayColumnProps {
  day: DayData;
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export function DayColumn({ day, tasks, onTaskComplete, onTaskClick }: DayColumnProps) {
  const testIdSuffix = day.dayName.toLowerCase();

  return (
    <div className="flex flex-col min-w-[120px] flex-1" data-testid={`day-column-${testIdSuffix}`}>
      {/* Header */}
      <div
        className={cn(
          'sticky top-0 bg-background p-3 text-center border-b-2 z-10',
          day.isToday ? 'border-primary' : 'border-transparent'
        )}
        data-testid={`day-header-${testIdSuffix}`}
      >
        <div
          className={cn(
            'text-xs font-medium uppercase tracking-wide',
            day.isToday ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {day.dayName}
        </div>
        <div
          className={cn(
            'text-2xl font-bold mt-1',
            day.isToday ? 'text-primary' : 'text-foreground',
            day.isPast && !day.isToday && 'text-muted-foreground'
          )}
        >
          {day.dateNumber}
        </div>
      </div>

      {/* Task Area */}
      <div className="flex-1 p-2 space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onTaskComplete}
            onClick={onTaskClick}
          />
        ))}
        {tasks.length === 0 && !day.isPast && (
          <div className="text-center text-xs text-muted-foreground py-8 opacity-50">
            {day.isToday ? 'Start your day?' : 'Plan something?'}
          </div>
        )}
      </div>
    </div>
  );
}
