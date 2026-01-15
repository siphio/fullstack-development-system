'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  TopNavBar,
  WeeklyGrid,
  InsightsSidebar,
  NewTaskButton,
  TaskModal,
} from '@/components/dashboard';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types';

interface DashboardClientProps {
  userEmail: string;
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const { weekData, goToNextWeek, goToPrevWeek, goToThisWeek, isCurrentWeek } =
    useWeekNavigation();
  const { tasksByDate, isLoading, createTask, editTask, deleteTask, completeTask } =
    useTasks(weekData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));

  const handleNewTask = () => {
    setSelectedTask(null);
    setDefaultDate(format(new Date(), 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Parameters<typeof createTask>[0]) => {
    if (selectedTask) {
      await editTask(selectedTask.id, data);
    } else {
      await createTask(data);
    }
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <>
      <TopNavBar
        weekLabel={weekData.label}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        onThisWeek={goToThisWeek}
        isCurrentWeek={isCurrentWeek}
        userEmail={userEmail}
      />
      <div className="flex flex-1 overflow-hidden" data-testid="dashboard-page">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : (
          <WeeklyGrid
            weekData={weekData}
            tasksByDate={tasksByDate}
            onTaskComplete={completeTask}
            onTaskClick={handleTaskClick}
          />
        )}
        <InsightsSidebar />
      </div>
      <NewTaskButton onClick={handleNewTask} />
      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={selectedTask}
        defaultDate={defaultDate}
        onSave={handleSave}
        onDelete={selectedTask ? handleDelete : undefined}
      />
    </>
  );
}
