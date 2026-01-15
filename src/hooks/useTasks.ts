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
    refetch: fetchTasks,
  };
}
