'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekSelectorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekSelector({ label, onPrev, onNext }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPrev}
        aria-label="Previous week"
        data-testid="week-nav-prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span
        className="text-sm font-medium min-w-[140px] text-center"
        data-testid="week-label"
      >
        {label}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        aria-label="Next week"
        data-testid="week-nav-next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
