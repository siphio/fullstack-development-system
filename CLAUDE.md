# TaskFlow - Global Development Rules

## 1. Core Principles

- **UI Reference First:** Always open `ui-design-referance.png` side-by-side when implementing UI components
- **Type Safety:** All code must be fully typed with TypeScript - no `any` types except when interfacing with untyped libraries
- **Optimistic Updates:** UI updates immediately, syncs with database in background, rollback on failure
- **Component Composition:** Small, focused components composed into larger features
- **60fps Animations:** All animations must be GPU-accelerated using transforms and opacity
- **Accessibility:** ARIA labels on interactive elements, keyboard navigation, WCAG AA contrast
- **No Console Logs in Production:** Use structured logging; remove debug logs before committing

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React framework with App Router |
| React | 18+ | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first styling |
| shadcn/ui | latest | Component library |
| @dnd-kit | 6+ | Drag and drop |
| Zustand | 4+ | State management |
| Recharts | 2+ | Charts |
| Framer Motion | 10+ | Animations |
| date-fns | 2+ | Date utilities |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase CLI | latest | Local PostgreSQL database |
| Supabase Auth | - | Email/password authentication |
| @supabase/ssr | 0+ | Server-side rendering support |

### Development
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| pnpm | Package manager (preferred) |

## 3. Architecture

### Directory Structure
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Protected dashboard route group
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   └── tasks/route.ts
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── providers.tsx             # Context providers
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── WeeklyGrid.tsx
│   │   ├── DayColumn.tsx
│   │   ├── TaskCard.tsx
│   │   └── ...
│   └── auth/                     # Auth components
├── lib/
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── store/                    # Zustand stores
│   │   ├── taskStore.ts
│   │   └── uiStore.ts
│   ├── animations/               # Animation utilities
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
│   ├── useTasks.ts
│   ├── useWeekNavigation.ts
│   └── useDragAndDrop.ts
└── types/                        # TypeScript types
    └── index.ts
```

### Key Patterns
- **Route Groups:** Use `(groupName)` for layout sharing without affecting URL
- **Server Components:** Default to server components; use `'use client'` only when needed
- **API Routes:** Use Next.js Route Handlers for task CRUD operations
- **Middleware:** Protect routes via `middleware.ts` at project root

## 4. Code Style

### Naming Conventions

**Files & Components:**
```typescript
// ✅ Good - PascalCase for components
WeeklyGrid.tsx
TaskCard.tsx
DayClearedModal.tsx

// ✅ Good - camelCase for utilities and hooks
useTasks.ts
formatDate.ts
taskStore.ts
```

**Functions & Variables:**
```typescript
// ✅ Good
const taskStore = useTaskStore();
const handleTaskComplete = (taskId: string) => { ... };
const isCompleted = task.isCompleted;

// ❌ Bad
const TaskStore = useTaskStore();
const handle_task_complete = (task_id: string) => { ... };
```

**Types & Interfaces:**
```typescript
// ✅ Good - PascalCase, descriptive names
interface Task { ... }
type TaskCategory = 'meeting' | 'general' | 'urgent';
interface WeekStats { ... }

// ❌ Bad
interface ITask { ... }  // No "I" prefix
type task_category = string;  // Use union types, not string
```

### Component Structure
```tsx
// components/dashboard/TaskCard.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onComplete, onEdit }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className={cn(
        'bg-card rounded-card p-3 shadow-card',
        isHovered && 'shadow-card-hover -translate-y-0.5'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component content */}
    </div>
  );
}
```

## 5. Logging

### Frontend Logging Pattern
```typescript
// Use console methods in development only
if (process.env.NODE_ENV === 'development') {
  console.log('[TaskStore] Task created:', { taskId, title });
}

// For errors that should always be logged
console.error('[API] Failed to create task:', {
  error: error.message,
  taskId,
  timestamp: new Date().toISOString(),
});
```

### What to Log
- Task CRUD operations (in development)
- Authentication events
- API errors with context
- Drag-and-drop position changes (in development)

## 6. Testing

### Test Structure
```
__tests__/
├── components/
│   └── TaskCard.test.tsx
├── hooks/
│   └── useTasks.test.ts
└── e2e/
    └── playwright/
        └── task-flow.spec.ts
```

### Running Tests
```bash
# Unit tests (when configured)
pnpm test

# Playwright E2E tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test task-flow.spec.ts
```

## 7. API Contracts

### Task Schema (Database ↔ Frontend)
```typescript
// Database (snake_case)
interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  position: number;
  category: 'meeting' | 'general' | 'urgent';
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Frontend (camelCase)
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  position: number;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Transformer function
function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    scheduledDate: row.scheduled_date,
    position: row.position,
    category: row.category,
    isCompleted: row.is_completed,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

### Error Handling
```typescript
// API route error response
interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Example error response
return NextResponse.json(
  { error: 'Task not found', code: 'TASK_NOT_FOUND' },
  { status: 404 }
);
```

## 8. Common Patterns

### Zustand Store Pattern
```typescript
// lib/store/taskStore.ts
import { create } from 'zustand';
import type { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    ),
  })),

  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId),
  })),

  completeTask: (taskId) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? { ...t, isCompleted: true, completedAt: new Date().toISOString() }
        : t
    ),
  })),
}));
```

### Supabase Client Pattern
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Usage in component
'use client';
import { createClient } from '@/lib/supabase/client';

export function TaskList() {
  const supabase = createClient();

  const fetchTasks = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('position');

    if (error) throw error;
    return data.map(toTask);
  };
}
```

### Animation Pattern (Framer Motion)
```tsx
// Confetti celebration on task complete
import { motion, AnimatePresence } from 'framer-motion';

export function ConfettiEffect({ isActive, origin }: Props) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
              initial={{
                x: origin.x,
                y: origin.y,
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: origin.x + particle.dx,
                y: origin.y + particle.dy + 100, // gravity
                scale: 1,
                opacity: 0,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut'
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}
```

## 9. Development Commands

### Installation
```bash
# Install dependencies
pnpm install

# Initialize shadcn/ui
pnpm dlx shadcn@latest init

# Add shadcn components
pnpm dlx shadcn@latest add button card dialog input label dropdown-menu avatar
```

### Development
```bash
# Start Next.js dev server
pnpm dev

# Start Supabase local database
supabase start

# Stop Supabase
supabase stop

# Reset database (apply migrations fresh)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/database.ts
```

### Building & Linting
```bash
# Build for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format
```

## 10. Test User Standard

All development and Playwright validation uses a seeded test user:

| Field | Value |
|-------|-------|
| Email | `test@taskflow.dev` |
| Password | `TestPassword123!` |
| Role | Full access (admin-equivalent) |

### Requirements
- Test user is seeded automatically via `supabase/seed.sql`
- Test user credentials are NEVER used in production
- Test user has sample tasks across the current week for testing
- Password meets Supabase Auth validation requirements

### Seeding
```bash
# Location: supabase/seed.sql
# Seed command (runs automatically with db reset)
supabase db reset
```

## 11. Playwright Validation Workflow

This project uses Playwright MCP for automated frontend validation.

### Device Testing Configuration

**Default Tier:** Tier 2 (Desktop + Mobile)

| Device | Viewport | Usage |
|--------|----------|-------|
| Desktop | 1280×720 | All validation flows |
| Mobile | 375×667 (iPhone SE) | All validation flows |

### Dev Server Configuration

- **URL:** `http://localhost:3000`
- **Start Command:** `pnpm dev`
- **Health Check:** `http://localhost:3000/api/health` or wait for page load

### Test ID Convention

Use `data-testid` attributes for critical interactive elements:

```tsx
// ✅ Good - clear, semantic test IDs
<button data-testid="task-submit-btn">Save Task</button>
<input data-testid="task-title-input" />
<div data-testid="day-column-mon">...</div>
<div data-testid="task-card-{taskId}">...</div>
<button data-testid="week-nav-prev">←</button>
<button data-testid="week-nav-next">→</button>
<button data-testid="fab-new-task">+ New Task</button>

// ❌ Bad - generic or missing test IDs
<button>Save Task</button>
<button data-testid="btn1">Save Task</button>
```

**Naming Pattern:** `{feature}-{element}-{type}` or `{feature}-{element}-{id}`

### Validation Step Format

Every feature plan MUST include a `## Validation Steps` section:

```markdown
## Validation Steps

### Environment
- Base URL: http://localhost:3000
- Auth Required: yes
- Test User: test@taskflow.dev / TestPassword123!

### Pre-conditions
- [ ] Dev server running (`pnpm dev`)
- [ ] Supabase running (`supabase start`)
- [ ] User logged in
- [ ] Starting route: /

### Flow 1: Create Task - Happy Path

**User Outcome:** User creates a new task for Wednesday

#### Desktop (1280×720)
| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | / | - | Dashboard loads, weekly grid visible |
| 2 | CLICK | button "New Task" | data-testid="fab-new-task" | Task modal opens |
| 3 | TYPE | input "Title" | data-testid="task-title-input" | Text entered |
| 4 | CLICK | button "Wednesday" | in date picker | Wednesday selected |
| 5 | CLICK | button "Save" | type=submit | Modal closes |
| 6 | VERIFY | task card | in Wednesday column | New task appears |

Screenshot: `create-task-desktop.png`

#### Mobile (375×667)
| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | / | - | Single day view loads |
| 2 | CLICK | FAB | bottom-right | Task modal opens |
| ... | ... | ... | ... | ... |

Screenshot: `create-task-mobile.png`

### Console Validation
- [ ] No errors in console during happy path
- [ ] No unexpected warnings
```

### Action Types Reference

| Action | Usage | Example |
|--------|-------|---------|
| NAVIGATE | Go to route | `NAVIGATE: /` |
| CLICK | Click element | `CLICK: button "Save"` |
| TYPE | Enter text | `TYPE: input "Title"` |
| DRAG | Drag element | `DRAG: task-card from Monday to Tuesday` |
| VERIFY | Assert state | `VERIFY: task card in column` |
| WAIT | Wait for state | `WAIT: loading spinner hidden` |
| SCREENSHOT | Capture visual | `SCREENSHOT: flow-complete.png` |

## 12. AI Coding Assistant Instructions

When working with this codebase:

1. **Always consult `ui-design-referance.png`** when implementing any visual component - match it exactly
2. **Follow the directory structure** in Section 3 - place files in correct locations
3. **Use TypeScript strictly** - no `any` types, define interfaces for all data structures
4. **Transform database rows** - convert snake_case to camelCase using transformer functions
5. **Add `data-testid` attributes** to all interactive elements following the naming pattern
6. **Use Zustand for state** - follow the store pattern in Section 8
7. **Implement optimistic updates** - update UI immediately, sync in background
8. **Run linter before commits** - `pnpm lint` must pass
9. **Include Validation Steps** in every feature plan using the format in Section 11
10. **Use the test user** (`test@taskflow.dev`) for all development and testing scenarios
