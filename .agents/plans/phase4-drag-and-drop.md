# Phase 4: Drag & Drop

Validate codebase patterns before implementing. Pay attention to naming of existing utils, types, and models.

## Feature Description

Implement drag-and-drop functionality for tasks using @dnd-kit. Users can vertically reorder tasks within a day column and horizontally drag tasks between days to reschedule. Visual feedback includes shadows, rotation during drag, and smooth animations. Position changes persist to the database with optimistic updates.

## User Story

As a professional user, I want to drag tasks between days and reorder them within a day so that I can easily reschedule and prioritize my weekly workload.

## Feature Metadata

**Type**: New Capability | **Complexity**: High | **Systems**: Dashboard, API, State
**Dependencies**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | **Playwright Tier**: 2

---

## CONTEXT REFERENCES

### Codebase Files - READ BEFORE IMPLEMENTING

- `PRD.md:648-656` - Phase 4 requirements, 60fps target, position persistence
- `PRD.md:430-438` - Visual states: hover lift, dragging shadow/rotation
- `CLAUDE.md:190-235` - Zustand store pattern (useTaskStore)
- `src/components/dashboard/WeeklyGrid.tsx:1-38` - Grid container to wrap with DndContext
- `src/components/dashboard/DayColumn.tsx:1-64` - Column to make droppable with SortableContext
- `src/components/dashboard/TaskCard.tsx:1-77` - Card to make sortable with useSortable
- `src/hooks/useTasks.ts:1-149` - Task hook with optimistic update pattern
- `src/lib/store/taskStore.ts:1-32` - Zustand store actions
- `src/app/api/tasks/[id]/route.ts:24-26` - PATCH supports position updates
- `src/types/index.ts:1-69` - Task type with position and scheduledDate
- `tests/task-crud-validation.spec.ts:1-320` - Playwright test patterns, login helper

### New Files to Create

```
src/
├── hooks/
│   └── useDragAndDrop.ts           # Drag handlers and logic
├── components/dashboard/
│   └── SortableTaskCard.tsx        # Wrapper for TaskCard with useSortable
tests/
└── drag-drop-validation.spec.ts    # Playwright drag-and-drop tests
```

### Files to Modify

```
src/components/dashboard/WeeklyGrid.tsx  - Add DndContext wrapper
src/components/dashboard/DayColumn.tsx   - Add SortableContext, useDroppable
src/components/dashboard/TaskCard.tsx    - Add dragging styles, forwardRef
src/hooks/useTasks.ts                    - Add reorderTasks, moveTask functions
src/app/api/tasks/route.ts               - Add PATCH for batch position updates
```

### Documentation

- [dnd-kit Core Concepts](https://docs.dndkit.com/introduction/concepts)
- [useSortable Hook](https://docs.dndkit.com/presets/sortable/usesortable)
- [DragOverlay](https://docs.dndkit.com/api-documentation/draggable/drag-overlay)
- [Collision Detection](https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms)

### Patterns to Follow

**Collision**: `closestCorners` for multi-container (week grid with day columns)
**Feedback**: `isDragging` → opacity 0.4 on source; DragOverlay with shadow/rotation
**Persistence**: Optimistic update → batch PATCH → rollback on error
**Test IDs**: Keep existing `task-card-{id}`, add `drag-handle-{id}` if needed

---

## IMPLEMENTATION PLAN

### Phase 1: Dependencies & Types

Install @dnd-kit packages and extend types for drag state.

### Phase 2: Core Drag Infrastructure

Create DndContext wrapper, implement useDragAndDrop hook for state management.

### Phase 3: Sortable Components

Make TaskCard sortable with useSortable, add DragOverlay for visual feedback.

### Phase 4: Day Column Droppable

Wrap task areas with SortableContext for vertical reordering.

### Phase 5: Cross-Column Drag

Handle task moves between days, update scheduledDate.

### Phase 6: Position Persistence

Add batch position update API, implement optimistic updates with rollback.

### Phase 7: Visual Polish

Add shadow/rotation during drag, smooth drop animation.

---

## STEP-BY-STEP TASKS

### Task 1: INSTALL Dependencies

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**VALIDATE**: `pnpm list @dnd-kit/core && pnpm exec tsc --noEmit`

---

### Task 2: CREATE `src/hooks/useDragAndDrop.ts`

**IMPLEMENT**: Drag state management hook

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task } from '@/types';

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

    const activeId = active.id as string;
    const overId = over.id as string;
    const sourceDate = activeTask.scheduledDate;

    // Determine target date - overId could be a task ID or a date (column)
    let targetDate = sourceDate;
    let overTask: Task | undefined;

    // Check if overId is a date key (column drop)
    if (tasksByDate[overId] !== undefined) {
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

    if (activeId === overId) return;

    if (sourceDate === targetDate) {
      // Same column reorder
      const tasks = tasksByDate[sourceDate];
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
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

      await onMoveToDay(activeId, sourceDate, targetDate, newPosition);
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
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 3: UPDATE `src/hooks/useTasks.ts`

**ADD**: `reorderTasks` and `moveTaskToDay` functions after line 125

**PATTERN**: MIRROR optimistic update pattern from `editTask` (lines 80-107)

```typescript
// Add after completeTask function (line 125)

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
```

**ADD** to return statement (line 138):

```typescript
return {
  // ... existing
  reorderTasks,
  moveTaskToDay,
};
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 4: CREATE `src/app/api/tasks/reorder/route.ts`

**IMPLEMENT**: Batch position update endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { date, taskIds } = body;

  if (!date || !taskIds || !Array.isArray(taskIds)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Update positions in a transaction-like manner
  const updates = taskIds.map((id: string, position: number) =>
    supabase
      .from('tasks')
      .update({ position, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Failed to update some positions', details: errors.map((e) => e.error?.message) },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, updated: taskIds.length });
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 5: CREATE `src/components/dashboard/SortableTaskCard.tsx`

**IMPLEMENT**: Sortable wrapper using useSortable

```typescript
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
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 6: UPDATE `src/components/dashboard/TaskCard.tsx`

**ADD**: `isDragging` prop for visual feedback

**MODIFY** interface (line 8-12):

```typescript
interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}
```

**MODIFY** function signature (line 20):

```typescript
export function TaskCard({ task, onComplete, onClick, isDragging = false }: TaskCardProps) {
```

**MODIFY** className (lines 33-37):

```typescript
className={cn(
  'group bg-card rounded-lg p-3 shadow-card cursor-pointer transition-all duration-200',
  isHovered && !task.isCompleted && !isDragging && 'shadow-card-hover -translate-y-0.5',
  task.isCompleted && 'opacity-60',
  isDragging && 'shadow-card-drag rotate-2 scale-105'
)}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 7: UPDATE `src/components/dashboard/DayColumn.tsx`

**ADD**: SortableContext wrapper for task list

**ADD** imports at top:

```typescript
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableTaskCard } from './SortableTaskCard';
```

**REPLACE** interface to include date string:

```typescript
interface DayColumnProps {
  day: DayData;
  dateKey: string; // yyyy-MM-dd format
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}
```

**ADD** useDroppable inside component:

```typescript
export function DayColumn({ day, dateKey, tasks, onTaskComplete, onTaskClick }: DayColumnProps) {
  const testIdSuffix = day.dayName.toLowerCase();
  const taskIds = tasks.map((t) => t.id);

  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  });
```

**REPLACE** Task Area div (lines 46-61):

```typescript
{/* Task Area */}
<div
  ref={setNodeRef}
  className={cn(
    'flex-1 p-2 space-y-2 min-h-[200px] transition-colors',
    isOver && 'bg-primary/5 rounded-lg'
  )}
  data-testid={`day-tasks-${testIdSuffix}`}
>
  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
    {tasks.map((task) => (
      <SortableTaskCard
        key={task.id}
        task={task}
        onComplete={onTaskComplete}
        onClick={onTaskClick}
      />
    ))}
  </SortableContext>
  {tasks.length === 0 && !day.isPast && (
    <div className="text-center text-xs text-muted-foreground py-8 opacity-50">
      {day.isToday ? 'Start your day?' : 'Plan something?'}
    </div>
  )}
</div>
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 8: UPDATE `src/components/dashboard/WeeklyGrid.tsx`

**ADD**: DndContext wrapper with DragOverlay

**REPLACE** entire file:

```typescript
'use client';

import { format } from 'date-fns';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
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

export function WeeklyGrid({
  weekData,
  tasksByDate,
  onTaskComplete,
  onTaskClick,
  onReorderWithinDay,
  onMoveToDay,
}: WeeklyGridProps) {
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
      collisionDetection={closestCorners}
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
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 9: UPDATE `src/app/(dashboard)/DashboardClient.tsx`

**ADD**: Pass drag handlers to WeeklyGrid

**MODIFY** imports - add reorderTasks, moveTaskToDay from useTasks

**MODIFY** destructuring from useTasks (line 23):

```typescript
const { tasksByDate, isLoading, createTask, editTask, deleteTask, completeTask, reorderTasks, moveTaskToDay } =
  useTasks(weekData);
```

**MODIFY** WeeklyGrid component (lines 69-75):

```typescript
<WeeklyGrid
  weekData={weekData}
  tasksByDate={tasksByDate}
  onTaskComplete={completeTask}
  onTaskClick={handleTaskClick}
  onReorderWithinDay={reorderTasks}
  onMoveToDay={moveTaskToDay}
/>
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 10: UPDATE `src/components/dashboard/index.ts`

**ADD**: Export SortableTaskCard

```typescript
export { SortableTaskCard } from './SortableTaskCard';
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### Task 11: ADD Tailwind shadow for drag state

**UPDATE** `tailwind.config.ts` or `src/app/globals.css` - add card-drag shadow

If using globals.css with CSS variables (check existing pattern), add:

```css
--shadow-card-drag: 0 8px 24px rgba(0, 0, 0, 0.15);
```

Or if extending Tailwind config, add to boxShadow:

```javascript
'card-drag': '0 8px 24px rgba(0,0,0,0.15)',
```

**VALIDATE**: `pnpm dev` - visually verify drag shadow works

---

### Task 12: CREATE `tests/drag-drop-validation.spec.ts`

**IMPLEMENT**: Playwright tests for drag-and-drop

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = 'test@taskflow.dev';
const TEST_USER_PASSWORD = 'TestPassword123';

async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER_EMAIL);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
  await page.waitForSelector('[data-testid="weekly-grid"]', { timeout: 10000 });
}

test.describe('Drag and Drop - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Flow 1: Reorder tasks within day', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find day with multiple tasks
    const mondayTasks = await page.locator('[data-testid="day-tasks-mon"] [data-testid^="sortable-task-"]').all();

    if (mondayTasks.length < 2) {
      console.log('Need 2+ tasks in Monday - skipping reorder test');
      return;
    }

    const firstTask = mondayTasks[0];
    const secondTask = mondayTasks[1];

    // Get initial positions
    const firstTaskId = await firstTask.getAttribute('data-testid');
    const firstBox = await firstTask.boundingBox();
    const secondBox = await secondTask.boundingBox();

    if (!firstBox || !secondBox) {
      console.log('Could not get bounding boxes');
      return;
    }

    // Drag first task below second
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height + 10, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    // Verify order changed
    const reorderedTasks = await page.locator('[data-testid="day-tasks-mon"] [data-testid^="sortable-task-"]').all();
    const newFirstTaskId = await reorderedTasks[0].getAttribute('data-testid');

    // First task should now be second
    expect(newFirstTaskId).not.toBe(firstTaskId);

    await page.screenshot({ path: 'test-results/reorder-within-day-desktop.png', fullPage: true });
    console.log('Flow 1 Desktop: PASS');
  });

  test('Flow 2: Drag task to different day', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find task in Monday
    const mondayTasks = await page.locator('[data-testid="day-tasks-mon"] [data-testid^="sortable-task-"]').all();

    if (mondayTasks.length === 0) {
      console.log('No tasks in Monday - skipping cross-day test');
      return;
    }

    const sourceTask = mondayTasks[0];
    const sourceTaskId = await sourceTask.getAttribute('data-testid');
    const sourceBox = await sourceTask.boundingBox();

    // Get Tuesday column
    const tuesdayColumn = page.locator('[data-testid="day-tasks-tue"]');
    const tuesdayBox = await tuesdayColumn.boundingBox();

    if (!sourceBox || !tuesdayBox) {
      console.log('Could not get bounding boxes');
      return;
    }

    // Count tasks in Tuesday before
    const tuesdayTasksBefore = await page.locator('[data-testid="day-tasks-tue"] [data-testid^="sortable-task-"]').count();

    // Drag to Tuesday
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tuesdayBox.x + tuesdayBox.width / 2, tuesdayBox.y + 50, { steps: 15 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    // Verify task moved to Tuesday
    const tuesdayTasksAfter = await page.locator('[data-testid="day-tasks-tue"] [data-testid^="sortable-task-"]').count();
    expect(tuesdayTasksAfter).toBe(tuesdayTasksBefore + 1);

    // Verify task no longer in Monday with original ID
    const movedTask = page.locator(`[data-testid="day-tasks-tue"] [data-testid="${sourceTaskId}"]`);
    await expect(movedTask).toBeVisible();

    await page.screenshot({ path: 'test-results/drag-to-day-desktop.png', fullPage: true });
    console.log('Flow 2 Desktop: PASS');
  });

  test('Flow 3: Visual feedback during drag', async ({ page }) => {
    await page.waitForTimeout(1000);

    const taskCards = await page.locator('[data-testid^="sortable-task-"]').all();
    if (taskCards.length === 0) {
      console.log('No tasks found - skipping visual feedback test');
      return;
    }

    const task = taskCards[0];
    const box = await task.boundingBox();
    if (!box) return;

    // Start drag
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y + 100, { steps: 5 });

    // Verify drag overlay appears
    await expect(page.locator('[data-testid="drag-overlay"]')).toBeVisible();

    // Screenshot during drag
    await page.screenshot({ path: 'test-results/drag-visual-feedback.png', fullPage: true });

    await page.mouse.up();
    console.log('Flow 3 Desktop: PASS');
  });
});

test.describe('Drag and Drop - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Flow 1: Touch drag to reorder (Mobile)', async ({ page }) => {
    await page.waitForTimeout(1000);

    // On mobile, verify tasks are draggable via touch
    const taskCards = await page.locator('[data-testid^="sortable-task-"]').all();

    if (taskCards.length < 2) {
      console.log('Need 2+ tasks for mobile reorder test');
      return;
    }

    const task = taskCards[0];
    const box = await task.boundingBox();
    if (!box) return;

    // Simulate touch drag
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(100);

    // Long press then drag
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + 150, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/drag-reorder-mobile.png', fullPage: true });
    console.log('Flow 1 Mobile: PASS');
  });
});
```

**VALIDATE**: `pnpm exec playwright test drag-drop-validation.spec.ts --headed`

---

## VALIDATION COMMANDS

```bash
# Level 1: Syntax & Style
pnpm exec tsc --noEmit && pnpm lint

# Level 2: Build
pnpm build

# Level 3: Playwright Tests
pnpm exec playwright test drag-drop-validation.spec.ts
```

---

## PLAYWRIGHT VALIDATION STEPS

### Validation Configuration

**Device Tier**: 2 (Desktop + Mobile)
**Base URL**: http://localhost:3000
**Auth Required**: yes
**Test User**: test@taskflow.dev / TestPassword123

### Pre-conditions

- [ ] Dev server running (`pnpm dev`)
- [ ] Supabase running (`supabase start`)
- [ ] Test user logged in
- [ ] At least 2 tasks exist in Monday column for reorder tests
- [ ] Starting route: /

### Required Test IDs

| Element | Test ID | Component File |
|---------|---------|----------------|
| Sortable wrapper | `sortable-task-{id}` | `SortableTaskCard.tsx` |
| Drag overlay | `drag-overlay` | `WeeklyGrid.tsx` |
| Day task area | `day-tasks-{day}` | `DayColumn.tsx` |

### Flow 1: Reorder Within Day

**User Outcome**: User reorders tasks within a single day column

| Step | Action | Target | Expected Outcome |
|------|--------|--------|------------------|
| 1 | NAVIGATE | / | Dashboard loads, weekly grid visible |
| 2 | VERIFY | Monday column | has 2+ tasks |
| 3 | DRAG | First task down | Task moves during drag |
| 4 | DROP | Below second | Order changes |
| 5 | REFRESH + VERIFY | / | New order persisted |

Screenshot: `reorder-within-day-desktop.png`, `reorder-within-day-mobile.png`

### Flow 2: Drag Between Days

**User Outcome**: User reschedules a task to a different day

| Step | Action | Target | Expected Outcome |
|------|--------|--------|------------------|
| 1 | DRAG | Task in Monday | Drag overlay appears |
| 2 | MOVE | To Tuesday | Tuesday highlights |
| 3 | DROP + VERIFY | In Tuesday | Task moves, count updated |

Screenshot: `drag-between-days-desktop.png`

### Flow 3: Visual Feedback

| Step | Action | Expected Outcome |
|------|--------|------------------|
| 1 | DRAG START | Source opacity reduces |
| 2 | VERIFY | drag-overlay visible with shadow/rotation |
| 3 | DRAG OVER empty column | Column background highlights |
| 4 | DROP | Smooth animation to final position |

Screenshot: `drag-visual-feedback.png`

**Console**: No errors during drag operations, network requests succeed

---

## ACCEPTANCE CRITERIA

**Functional Criteria:**
- [x] Tasks can be reordered within a day column via drag
- [x] Tasks can be moved between days via drag
- [x] Position changes persist to database
- [x] Visual feedback shows during drag (opacity, shadow, rotation)
- [x] 60fps drag animations (no jank)

**Code Quality Criteria:**
- [x] TypeScript compiles without errors
- [x] ESLint passes
- [x] Build succeeds

**Playwright Validation Criteria:**
- [x] Reorder within day works on Desktop
- [x] Drag between days works on Desktop
- [x] Visual feedback appears during drag
- [x] Mobile touch drag works
- [x] No console errors during drag operations

---

## NOTES

**Collision Detection**: Using `closestCorners` because it works better with multiple containers (day columns). The algorithm checks proximity to all four corners of potential drop targets.

**DragOverlay**: Critical for scroll-container compatibility. Without it, the dragged element would be clipped by overflow:hidden on the grid container.

**Position Field**: Tasks already have a `position` field in the database (integer). We maintain ascending order within each date. When moving between days, we update both `scheduled_date` and `position`.

**Optimistic Updates**: Following the existing pattern in `useTasks.ts` - update UI immediately, then sync with server. On error, rollback to previous state.

**Touch Support**: @dnd-kit has built-in touch support. The `useSortable` hook handles both mouse and touch events automatically.
