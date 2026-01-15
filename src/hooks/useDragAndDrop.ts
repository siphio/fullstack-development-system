'use client';

import { useState, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task } from '@/types';

// Helper to check if a string is a date in yyyy-MM-dd format
function isDateString(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

interface UseDragAndDropProps {
  tasksByDate: Record<string, Task[]>;
  onReorderWithinDay: (date: string, taskIds: string[]) => Promise<void>;
  onMoveToDay: (taskId: string, fromDate: string, toDate: string, newPosition: number) => Promise<void>;
}

export function useDragAndDrop({
  tasksByDate,
  onReorderWithinDay,
  onMoveToDay,
}: UseDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    setActiveId(taskId);

    // Find the task across all dates
    for (const tasks of Object.values(tasksByDate)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  }, [tasksByDate]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over || !activeTask) return;

    const draggedId = active.id as string;
    const overId = over.id as string;
    const sourceDate = activeTask.scheduledDate;

    // Determine target date - overId could be a task ID or a date (column)
    let targetDate = sourceDate;
    let overTask: Task | undefined;

    // Check if overId is a date key (column drop) - use regex to detect date format
    if (isDateString(overId)) {
      targetDate = overId;
    } else {
      // overId is a task - find which date it belongs to
      for (const [date, tasks] of Object.entries(tasksByDate)) {
        overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          targetDate = date;
          break;
        }
      }
    }

    if (draggedId === overId) return;

    if (sourceDate === targetDate) {
      // Same column reorder
      const tasks = tasksByDate[sourceDate];
      const oldIndex = tasks.findIndex((t) => t.id === draggedId);
      const newIndex = overTask
        ? tasks.findIndex((t) => t.id === overId)
        : tasks.length;

      if (oldIndex !== newIndex && oldIndex !== -1) {
        const newOrder = arrayMove(tasks, oldIndex, newIndex);
        await onReorderWithinDay(sourceDate, newOrder.map((t) => t.id));
      }
    } else {
      // Cross-column move
      const targetTasks = tasksByDate[targetDate] || [];
      const newPosition = overTask
        ? targetTasks.findIndex((t) => t.id === overId)
        : targetTasks.length;

      await onMoveToDay(draggedId, sourceDate, targetDate, newPosition);
    }
  }, [activeTask, tasksByDate, onReorderWithinDay, onMoveToDay]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveTask(null);
  }, []);

  return {
    activeId,
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
