'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}

const categoryColors: Record<string, string> = {
  meeting: 'bg-category-meeting',
  general: 'bg-category-general',
  urgent: 'bg-category-urgent',
};

export function TaskCard({ task, onComplete, onClick, isDragging = false }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      onComplete(task.id);
    }
  };

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className={cn(
        'group bg-card rounded-lg p-3 shadow-card cursor-pointer transition-all duration-200',
        isHovered && !task.isCompleted && !isDragging && 'shadow-card-hover -translate-y-0.5',
        task.isCompleted && 'opacity-60',
        isDragging && 'shadow-card-drag rotate-2 scale-105'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start gap-3">
        {/* Category Dot or Completion Checkmark */}
        <button
          data-testid={`task-complete-${task.id}`}
          onClick={handleComplete}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
            task.isCompleted ? 'bg-success text-white' : categoryColors[task.category]
          )}
          aria-label={task.isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {task.isCompleted && <Check className="w-3 h-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            data-testid={`task-title-${task.id}`}
            className={cn(
              'text-sm font-medium leading-snug',
              task.isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {task.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
