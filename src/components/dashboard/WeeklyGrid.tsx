'use client';

import { DayColumn } from './DayColumn';
import type { WeekData } from '@/types';

interface WeeklyGridProps {
  weekData: WeekData;
}

export function WeeklyGrid({ weekData }: WeeklyGridProps) {
  return (
    <div
      className="flex-1 overflow-x-auto"
      data-testid="weekly-grid"
    >
      <div className="flex min-w-[840px] h-full">
        {weekData.days.map((day) => (
          <DayColumn key={day.date.toISOString()} day={day} />
        ))}
      </div>
    </div>
  );
}
