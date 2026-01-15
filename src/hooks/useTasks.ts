'use client';

import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useTaskStore } from '@/lib/store/taskStore';
import type { Task, TaskCategory, WeekData } from '@/types';

export function useTasks(weekData: WeekData) {
  const {
    tasks,
    isLoading,
    error,
    setTasks,
    setLoading,
    setError,
    addTask,
    updateTask,
    removeTask,
  } = useTaskStore();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = format(weekData.startDate, 'yyyy-MM-dd');
    const end = format(weekData.endDate, 'yyyy-MM-dd');

    try {
      const res = await fetch(`/api/tasks?start=${start}&end=${end}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [weekData.startDate, weekData.endDate, setTasks, setLoading, setError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    scheduledDate: string;
  }): Promise<void> => {
    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      userId: '',
      title: data.title,
      description: data.description,
      scheduledDate: data.scheduledDate,
      position: 0,
      category: data.category,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTask(tempTask);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      const { task } = await res.json();
      removeTask(tempId);
      addTask(task);
    } catch (err) {
      removeTask(tempId);
      throw err;
    }
  };

  const editTask = async (
    taskId: string,
    data: Partial<{
      title: string;
      description: string;
      category: TaskCategory;
      scheduledDate: string;
      isCompleted: boolean;
    }>
  ): Promise<void> => {
    const prevTask = tasks.find((t) => t.id === taskId);
    if (!prevTask) return;
    updateTask(taskId, data);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const { task } = await res.json();
      updateTask(taskId, task);
    } catch (err) {
      updateTask(taskId, prevTask);
      throw err;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const prevTask = tasks.find((t) => t.id === taskId);
    if (!prevTask) return;
    removeTask(taskId);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      addTask(prevTask);
      throw err;
    }
  };

  const completeTask = async (taskId: string): Promise<void> => {
    await editTask(taskId, { isCompleted: true });
  };

  const reorderTasks = async (date: string, taskIds: string[]): Promise<void> => {
    const prevTasks = tasks.filter((t) => t.scheduledDate === date);

    // Optimistic update - reorder in store
    taskIds.forEach((id, index) => {
      updateTask(id, { position: index });
    });

    try {
      const res = await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, taskIds }),
      });
      if (!res.ok) throw new Error('Failed to reorder tasks');
    } catch (err) {
      // Rollback
      prevTasks.forEach((t) => updateTask(t.id, { position: t.position }));
      throw err;
    }
  };

  const moveTaskToDay = async (
    taskId: string,
    fromDate: string,
    toDate: string,
    newPosition: number
  ): Promise<void> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const prevState = { scheduledDate: task.scheduledDate, position: task.position };

    // Optimistic update
    updateTask(taskId, { scheduledDate: toDate, position: newPosition });

    // Reorder tasks in target date
    const targetTasks = tasks
      .filter((t) => t.scheduledDate === toDate && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    targetTasks.splice(newPosition, 0, { ...task, scheduledDate: toDate });
    targetTasks.forEach((t, idx) => {
      if (t.id !== taskId) updateTask(t.id, { position: idx });
    });

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledDate: toDate, position: newPosition }),
      });
      if (!res.ok) throw new Error('Failed to move task');

      // Batch update positions for affected tasks in target column
      const reorderRes = await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: toDate, taskIds: targetTasks.map((t) => t.id) }),
      });
      if (!reorderRes.ok) throw new Error('Failed to reorder after move');
    } catch (err) {
      // Rollback the moved task
      updateTask(taskId, prevState);
      throw err;
    }
  };

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const date = task.scheduledDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  Object.keys(tasksByDate).forEach((date) => {
    tasksByDate[date].sort((a, b) => a.position - b.position);
  });

  return {
    tasks,
    tasksByDate,
    isLoading,
    error,
    createTask,
    editTask,
    deleteTask,
    completeTask,
    reorderTasks,
    moveTaskToDay,
    refetch: fetchTasks,
  };
}
