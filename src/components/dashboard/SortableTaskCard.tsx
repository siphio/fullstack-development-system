'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

interface SortableTaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

export function SortableTaskCard({ task, onComplete, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Custom pointer down handler to exclude button clicks from starting drag
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Don't start drag if clicking on button or its children
    if (target.closest('button')) {
      return;
    }
    listeners?.onPointerDown?.(e);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onPointerDown={handlePointerDown}
      data-testid={`sortable-task-${task.id}`}
    >
      <TaskCard
        task={task}
        onComplete={onComplete}
        onClick={onClick}
        isDragging={isDragging}
      />
    </div>
  );
}
