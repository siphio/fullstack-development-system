'use client';

import { format } from 'date-fns';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';
import { DayColumn } from './DayColumn';
import { TaskCard } from './TaskCard';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { WeekData, Task } from '@/types';

interface WeeklyGridProps {
  weekData: WeekData;
  tasksByDate: Record<string, Task[]>;
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  onReorderWithinDay: (date: string, taskIds: string[]) => Promise<void>;
  onMoveToDay: (taskId: string, fromDate: string, toDate: string, newPosition: number) => Promise<void>;
}

// Custom collision detection that prioritizes droppable containers (day columns)
// over sortable items (tasks) to fix cross-column drag issues
const customCollisionDetection: CollisionDetection = (args) => {
  // First check if pointer is within any droppable (day column)
  const pointerCollisions = pointerWithin(args);

  // Find collisions that are date containers (yyyy-MM-dd format)
  const containerCollisions = pointerCollisions.filter(
    (collision) => /^\d{4}-\d{2}-\d{2}$/.test(String(collision.id))
  );

  // If we're over a day column container, prioritize it
  if (containerCollisions.length > 0) {
    // But also check for task collisions within that container for reordering
    const taskCollisions = pointerCollisions.filter(
      (collision) => !/^\d{4}-\d{2}-\d{2}$/.test(String(collision.id))
    );
    // Return task collisions first (for reordering), then container
    return taskCollisions.length > 0 ? taskCollisions : containerCollisions;
  }

  // Fallback to rect intersection for edge cases
  return rectIntersection(args);
};

export function WeeklyGrid({
  weekData,
  tasksByDate,
  onTaskComplete,
  onTaskClick,
  onReorderWithinDay,
  onMoveToDay,
}: WeeklyGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );

  const {
    activeId,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop({
    tasksByDate,
    onReorderWithinDay,
    onMoveToDay,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex-1 overflow-x-auto" data-testid="weekly-grid">
        <div className="flex min-w-[840px] h-full">
          {weekData.days.map((day) => {
            const dateKey = format(day.date, 'yyyy-MM-dd');
            return (
              <DayColumn
                key={day.date.toISOString()}
                day={day}
                dateKey={dateKey}
                tasks={tasksByDate[dateKey] || []}
                onTaskComplete={onTaskComplete}
                onTaskClick={onTaskClick}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activeId && activeTask ? (
          <div
            className="shadow-card-drag rotate-2 scale-105 opacity-90"
            data-testid="drag-overlay"
          >
            <TaskCard
              task={activeTask}
              onComplete={() => {}}
              onClick={() => {}}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
