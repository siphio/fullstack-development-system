# Phase 3: Task CRUD & Display

Validate codebase patterns before implementing. Pay attention to naming of existing utils, types, and models.

## Feature Description

Task management: TaskCard (colored dot, title, checkmark), TaskModal (create/edit), API routes, Zustand store, optimistic updates. Transforms empty DayColumns into functional task containers.

## User Story

As a professional user, I want to create, view, edit, and complete tasks within my weekly calendar so that I can manage my workload.

## Feature Metadata

**Type**: New Capability | **Complexity**: High | **Systems**: Dashboard, API, State
**Dependencies**: zustand, shadcn dialog/select/textarea | **Playwright Tier**: 2

---

## CONTEXT REFERENCES

### Codebase Files - READ BEFORE IMPLEMENTING

- `PRD.md:418-445` - TaskCard visual states, category dots, completion design
- `PRD.md:313-330` - Task TypeScript interface and DB operations
- `PRD.md:267-310` - Database schema and RLS policies
- `CLAUDE.md:195-270` - Zustand store and Supabase client patterns
- `src/types/index.ts:1-69` - Task, TaskRow, toTask() transformer (already defined)
- `src/components/dashboard/DayColumn.tsx:45-48` - Task area placeholder to update
- `src/app/(dashboard)/DashboardClient.tsx:1-42` - Client wrapper to add task state
- `src/lib/supabase/client.ts:1-9` - Browser client pattern
- `src/lib/supabase/server.ts:1-23` - Server client pattern (for API routes)
- `src/components/ui/button.tsx:1-63` - Button variants pattern
- `tests/phase2-validation.spec.ts:1-239` - Playwright test patterns
- `supabase/migrations/00001_create_tables.sql` - Tasks table schema

### New Files to Create

```
src/
├── lib/store/
│   └── taskStore.ts              # Zustand task state
├── hooks/
│   └── useTasks.ts               # Task fetching/sync hook
├── components/dashboard/
│   ├── TaskCard.tsx              # Task card component
│   └── TaskModal.tsx             # Create/edit modal
├── app/api/tasks/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [id]/route.ts             # PATCH (update), DELETE
tests/
└── phase3-validation.spec.ts     # Playwright tests
```

### Documentation

- [Zustand Quick Start](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [shadcn Dialog](https://ui.shadcn.com/docs/components/dialog)
- [shadcn Select](https://ui.shadcn.com/docs/components/select)
- [shadcn Textarea](https://ui.shadcn.com/docs/components/textarea)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Patterns to Follow

**Naming**: PascalCase components, camelCase hooks/utils, kebab-case test IDs
**Transforms**: Use `toTask()` from `@/types` for database row → frontend conversion
**Supabase**: `createClient()` browser, `createServerClient()` server/API
**Test IDs**: `{feature}-{element}-{type}` (e.g., `task-card-{id}`, `task-modal-submit`)

---

## STEP-BY-STEP TASKS

### Task 1: ADD Dependencies

```bash
pnpm add zustand && pnpm dlx shadcn@latest add dialog select textarea checkbox -y
```

**VALIDATE**: `pnpm list zustand && ls src/components/ui/dialog.tsx`

---

### Task 2: CREATE `src/lib/store/taskStore.ts`

**PATTERN**: MIRROR `CLAUDE.md:195-235`

```typescript
import { create } from 'zustand';
import type { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t),
  })),
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId),
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 3: CREATE `src/app/api/tasks/route.ts`

**IMPLEMENT**: GET (list by date range) + POST (create)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { toTask } from '@/types';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('scheduled_date', start)
    .lte('scheduled_date', end)
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data.map(toTask) });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, scheduledDate, category } = body;

  if (!title || !scheduledDate) {
    return NextResponse.json({ error: 'Title and scheduledDate required' }, { status: 400 });
  }

  // Get max position for the date
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('scheduled_date', scheduledDate)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingTasks?.[0]?.position !== undefined
    ? existingTasks[0].position + 1
    : 0;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      scheduled_date: scheduledDate,
      category: category || 'general',
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: toTask(data) }, { status: 201 });
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 4: CREATE `src/app/api/tasks/[id]/route.ts`

**IMPLEMENT**: PATCH (update) + DELETE

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { toTask } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.scheduledDate !== undefined) updates.scheduled_date = body.scheduledDate;
  if (body.category !== undefined) updates.category = body.category;
  if (body.position !== undefined) updates.position = body.position;
  if (body.isCompleted !== undefined) {
    updates.is_completed = body.isCompleted;
    updates.completed_at = body.isCompleted ? new Date().toISOString() : null;
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: toTask(data) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 5: CREATE `src/components/dashboard/TaskCard.tsx`

**TEST_IDs**: `task-card-{id}`, `task-complete-{id}`, `task-title-{id}`
**REFERENCE**: `ui-design-referance.png` - colored DOT on LEFT (not stripe)

```typescript
'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  meeting: 'bg-category-meeting',
  general: 'bg-category-general',
  urgent: 'bg-category-urgent',
};

export function TaskCard({ task, onComplete, onClick }: TaskCardProps) {
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
        isHovered && !task.isCompleted && 'shadow-card-hover -translate-y-0.5',
        task.isCompleted && 'opacity-60'
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
            task.isCompleted
              ? 'bg-success text-white'
              : categoryColors[task.category]
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
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 6: CREATE `src/components/dashboard/TaskModal.tsx`

**TEST_IDs**: `task-modal`, `task-title-input`, `task-desc-input`, `task-category-select`, `task-date-input`, `task-submit-btn`, `task-delete-btn`, `task-error-message`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
  open, onOpenChange, task, defaultDate, onSave, onDelete,
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
            <div data-testid="task-error-message" className="text-sm text-destructive bg-destructive/10 p-2 rounded">
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
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting} data-testid="task-delete-btn">
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
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 7: CREATE `src/hooks/useTasks.ts`

**IMPLEMENT**: Hook wrapping taskStore with API operations and optimistic updates

```typescript
'use client';

import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useTaskStore } from '@/lib/store/taskStore';
import type { Task, TaskCategory, WeekData } from '@/types';

export function useTasks(weekData: WeekData) {
  const { tasks, isLoading, error, setTasks, setLoading, setError, addTask, updateTask, removeTask } = useTaskStore();

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

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (data: { title: string; description?: string; category: TaskCategory; scheduledDate: string }): Promise<void> => {
    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = { id: tempId, userId: '', title: data.title, description: data.description, scheduledDate: data.scheduledDate, position: 0, category: data.category, isCompleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    addTask(tempTask);

    try {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to create task');
      const { task } = await res.json();
      removeTask(tempId);
      addTask(task);
    } catch (err) {
      removeTask(tempId);
      throw err;
    }
  };

  const editTask = async (taskId: string, data: Partial<{ title: string; description: string; category: TaskCategory; scheduledDate: string; isCompleted: boolean }>): Promise<void> => {
    const prevTask = tasks.find((t) => t.id === taskId);
    if (!prevTask) return;
    updateTask(taskId, data);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
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

  const completeTask = async (taskId: string): Promise<void> => { await editTask(taskId, { isCompleted: true }); };

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const date = task.scheduledDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  Object.keys(tasksByDate).forEach((date) => { tasksByDate[date].sort((a, b) => a.position - b.position); });

  return { tasks, tasksByDate, isLoading, error, createTask, editTask, deleteTask, completeTask, refetch: fetchTasks };
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 8: UPDATE `src/components/dashboard/DayColumn.tsx`

**IMPLEMENT**: Accept `tasks: Task[]`, `onTaskComplete`, `onTaskClick` props

```typescript
'use client';

import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import type { DayData, Task } from '@/types';

interface DayColumnProps {
  day: DayData;
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export function DayColumn({ day, tasks, onTaskComplete, onTaskClick }: DayColumnProps) {
  const testIdSuffix = day.dayName.toLowerCase();

  return (
    <div className="flex flex-col min-w-[120px] flex-1" data-testid={`day-column-${testIdSuffix}`}>
      <div
        className={cn('sticky top-0 bg-background p-3 text-center border-b-2 z-10', day.isToday ? 'border-primary' : 'border-transparent')}
        data-testid={`day-header-${testIdSuffix}`}
      >
        <div className={cn('text-xs font-medium uppercase tracking-wide', day.isToday ? 'text-primary' : 'text-muted-foreground')}>
          {day.dayName}
        </div>
        <div className={cn('text-2xl font-bold mt-1', day.isToday ? 'text-primary' : 'text-foreground', day.isPast && !day.isToday && 'text-muted-foreground')}>
          {day.dateNumber}
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onTaskComplete} onClick={onTaskClick} />
        ))}
        {tasks.length === 0 && !day.isPast && (
          <div className="text-center text-xs text-muted-foreground py-8 opacity-50">
            {day.isToday ? 'Start your day?' : 'Plan something?'}
          </div>
        )}
      </div>
    </div>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 9: UPDATE `src/components/dashboard/WeeklyGrid.tsx`

**IMPLEMENT**: Accept `tasksByDate`, `onTaskComplete`, `onTaskClick`

```typescript
'use client';

import { format } from 'date-fns';
import { DayColumn } from './DayColumn';
import type { WeekData, Task } from '@/types';

interface WeeklyGridProps {
  weekData: WeekData;
  tasksByDate: Record<string, Task[]>;
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export function WeeklyGrid({ weekData, tasksByDate, onTaskComplete, onTaskClick }: WeeklyGridProps) {
  return (
    <div className="flex-1 overflow-x-auto" data-testid="weekly-grid">
      <div className="flex min-w-[840px] h-full">
        {weekData.days.map((day) => {
          const dateKey = format(day.date, 'yyyy-MM-dd');
          return (
            <DayColumn key={day.date.toISOString()} day={day} tasks={tasksByDate[dateKey] || []} onTaskComplete={onTaskComplete} onTaskClick={onTaskClick} />
          );
        })}
      </div>
    </div>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 10: UPDATE `src/components/dashboard/index.ts`

Add exports: `TaskCard`, `TaskModal`

```typescript
export { TopNavBar } from './TopNavBar';
export { WeekSelector } from './WeekSelector';
export { WeeklyGrid } from './WeeklyGrid';
export { DayColumn } from './DayColumn';
export { InsightsSidebar } from './InsightsSidebar';
export { NewTaskButton } from './NewTaskButton';
export { TaskCard } from './TaskCard';
export { TaskModal } from './TaskModal';
```

---

### Task 11: UPDATE `src/app/(dashboard)/DashboardClient.tsx`

**IMPLEMENT**: Full integration with useTasks hook and modal state

```typescript
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { TopNavBar, WeeklyGrid, InsightsSidebar, NewTaskButton, TaskModal } from '@/components/dashboard';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types';

interface DashboardClientProps { userEmail: string; }

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const { weekData, goToNextWeek, goToPrevWeek, goToThisWeek, isCurrentWeek } = useWeekNavigation();
  const { tasksByDate, isLoading, createTask, editTask, deleteTask, completeTask } = useTasks(weekData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));

  const handleNewTask = () => { setSelectedTask(null); setDefaultDate(format(new Date(), 'yyyy-MM-dd')); setIsModalOpen(true); };
  const handleTaskClick = (task: Task) => { setSelectedTask(task); setIsModalOpen(true); };
  const handleSave = async (data: Parameters<typeof createTask>[0]) => {
    if (selectedTask) await editTask(selectedTask.id, data);
    else await createTask(data);
  };
  const handleDelete = async (taskId: string) => { await deleteTask(taskId); };

  return (
    <>
      <TopNavBar weekLabel={weekData.label} onPrevWeek={goToPrevWeek} onNextWeek={goToNextWeek} onThisWeek={goToThisWeek} isCurrentWeek={isCurrentWeek} userEmail={userEmail} />
      <div className="flex flex-1 overflow-hidden" data-testid="dashboard-page">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center"><div className="text-muted-foreground">Loading tasks...</div></div>
        ) : (
          <WeeklyGrid weekData={weekData} tasksByDate={tasksByDate} onTaskComplete={completeTask} onTaskClick={handleTaskClick} />
        )}
        <InsightsSidebar />
      </div>
      <NewTaskButton onClick={handleNewTask} />
      <TaskModal open={isModalOpen} onOpenChange={setIsModalOpen} task={selectedTask} defaultDate={defaultDate} onSave={handleSave} onDelete={selectedTask ? handleDelete : undefined} />
    </>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`

---

### Task 12: UPDATE `supabase/seed.sql`

Add `seed_test_tasks(user_id)` function that deletes existing tasks and inserts ~10 sample tasks distributed across current week (Mon-Sun) with varied categories (meeting, general, urgent) and one completed.

---

### Task 13: VERIFY Tailwind Category Colors

Ensure `bg-category-meeting` (#F0D9E8), `bg-category-general` (#DCD5C9), `bg-category-urgent` (#7C3AED), `bg-success` (#10B981) are defined in globals.css or tailwind config.

---

## VALIDATION COMMANDS

```bash
pnpm exec tsc --noEmit  # TypeScript - must pass
pnpm lint               # ESLint - must pass
pnpm build              # Build - must succeed
```

---

## PLAYWRIGHT VALIDATION STEPS

### Configuration

**Tier**: 2 (Desktop + Mobile) | **URL**: http://localhost:3000 | **Auth**: test@taskflow.dev / TestPassword123!

### Pre-conditions

- [ ] Dev server running (`pnpm dev`)
- [ ] Supabase running (`supabase start`)
- [ ] Test user exists with sample tasks (run `seed_test_tasks()`)

### Test IDs Required

| Element | Test ID | File |
|---------|---------|------|
| Modal | `task-modal` | TaskModal.tsx |
| Title input | `task-title-input` | TaskModal.tsx |
| Description | `task-desc-input` | TaskModal.tsx |
| Category select | `task-category-select` | TaskModal.tsx |
| Date input | `task-date-input` | TaskModal.tsx |
| Submit button | `task-submit-btn` | TaskModal.tsx |
| Delete button | `task-delete-btn` | TaskModal.tsx |
| Error message | `task-error-message` | TaskModal.tsx |
| Task card | `task-card-{id}` | TaskCard.tsx |
| Complete button | `task-complete-{id}` | TaskCard.tsx |
| Task title | `task-title-{id}` | TaskCard.tsx |
| FAB | `fab-new-task` | (existing) |

### Flow 1: Create Task - Happy Path

**Outcome**: User creates task via FAB, task appears in grid

#### Desktop (1280×720)

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | LOGIN | test@taskflow.dev | Dashboard loads |
| 2 | CLICK | fab-new-task | Modal opens |
| 3 | VERIFY | task-modal | Form visible, empty |
| 4 | TYPE | task-title-input | "Playwright Test Task" |
| 5 | TYPE | task-desc-input | "Created via automation" |
| 6 | CLICK | task-category-select | Dropdown opens |
| 7 | SELECT | "Meeting" | Category selected |
| 8 | CLICK | task-submit-btn | Modal closes |
| 9 | VERIFY | weekly-grid | New task card visible |

**Screenshot**: `create-task-desktop.png`

#### Mobile (375×667)

Same flow - verify modal works on mobile viewport.

**Screenshot**: `create-task-mobile.png`

### Flow 2: Complete Task

**Outcome**: User completes task, sees green checkmark

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | (logged in) | / | Tasks visible |
| 2 | VERIFY | first incomplete task | Has category dot |
| 3 | CLICK | task-complete-{id} | Task marked done |
| 4 | VERIFY | same task | Green checkmark visible |
| 5 | VERIFY | task title | Has strikethrough |

**Screenshot**: `complete-task.png`

### Flow 3: Edit Task

**Outcome**: User edits task details

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | CLICK | task card body | Modal opens |
| 2 | VERIFY | task-title-input | Has existing title |
| 3 | CLEAR + TYPE | task-title-input | "Updated Title" |
| 4 | CLICK | task-submit-btn | Modal closes |
| 5 | VERIFY | task card | Shows "Updated Title" |

**Screenshot**: `edit-task.png`

### Flow 4: Delete Task

**Outcome**: User deletes task

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | COUNT | tasks in column | Note count |
| 2 | CLICK | task card | Modal opens |
| 3 | CLICK | task-delete-btn | Task removed |
| 4 | VERIFY | modal | Closed |
| 5 | COUNT | tasks in column | Count decreased |

**Screenshot**: `delete-task.png`

### Flow 5: Validation Error

**Outcome**: Empty title shows error, modal stays open

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | CLICK | fab-new-task | Modal opens |
| 2 | CLICK | task-submit-btn | Validation runs |
| 3 | VERIFY | task-error-message | "Title is required" |
| 4 | VERIFY | task-modal | Still open |

**Screenshot**: `validation-error.png`

### Console Validation

- No errors during CRUD operations
- No errors on modal open/close
- Optimistic updates should not cause errors

---

## ACCEPTANCE CRITERIA

**Functional:** TaskCard matches reference (dot not stripe), category colors correct, completed shows checkmark+strikethrough, modal works for create/edit, validation prevents empty titles, optimistic updates with rollback, tasks persist

**Quality:** tsc passes, lint passes, build succeeds

**Playwright:** All 5 flows pass Desktop+Mobile, no console errors, all test IDs present

---

## NOTES

**Decisions:** Zustand (simpler), optimistic updates, REST API, ISO dates
**Phase 4 prep:** TaskCard needs drag handle, position for ordering, DayColumn droppable
**Gotchas:** RLS + API auth, position=max+1, modal state resets, completeTask calls editTask
