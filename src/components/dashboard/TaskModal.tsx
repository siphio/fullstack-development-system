'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Task, TaskCategory } from '@/types';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultDate?: string;
  onSave: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    scheduledDate: string;
  }) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

export function TaskModal({
  open,
  onOpenChange,
  task,
  defaultDate,
  onSave,
  onDelete,
}: TaskModalProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setScheduledDate(task.scheduledDate);
    } else {
      setTitle('');
      setDescription('');
      setCategory('general');
      setScheduledDate(defaultDate || format(new Date(), 'yyyy-MM-dd'));
    }
    setError(null);
  }, [task, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        scheduledDate,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete(task.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="task-modal" className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              data-testid="task-error-message"
              className="text-sm text-destructive bg-destructive/10 p-2 rounded"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              data-testid="task-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              data-testid="task-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger data-testid="task-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                data-testid="task-date-input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                data-testid="task-delete-btn"
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} data-testid="task-submit-btn">
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
