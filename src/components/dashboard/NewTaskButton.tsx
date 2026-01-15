'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewTaskButtonProps {
  onClick?: () => void;
}

export function NewTaskButton({ onClick }: NewTaskButtonProps) {
  return (
    <Button
      className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg gap-2 z-50"
      onClick={onClick}
      data-testid="fab-new-task"
    >
      <Plus className="h-5 w-5" />
      <span className="font-medium">New Task</span>
    </Button>
  );
}
