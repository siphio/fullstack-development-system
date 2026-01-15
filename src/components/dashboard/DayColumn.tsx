'use client';

import { cn } from '@/lib/utils';
import type { DayData } from '@/types';

interface DayColumnProps {
  day: DayData;
}

export function DayColumn({ day }: DayColumnProps) {
  const testIdSuffix = day.dayName.toLowerCase();

  return (
    <div
      className="flex flex-col min-w-[120px] flex-1"
      data-testid={`day-column-${testIdSuffix}`}
    >
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

      {/* Task Area - will be populated in Phase 3 */}
      <div className="flex-1 p-2 space-y-2 min-h-[200px]">
        {/* Placeholder for tasks */}
      </div>
    </div>
  );
}
