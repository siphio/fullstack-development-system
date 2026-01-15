# TaskFlow Weekly Dashboard - Product Requirements Document

## 1. Executive Summary

TaskFlow is a desktop-first responsive task management application for professionals who need a clear, visual overview of their weekly workload. The interface prioritizes drag-and-drop interaction with emotionally engaging micro-animations that make task completion genuinely satisfying.

The core experience centers on a 7-day weekly calendar grid where users drag-and-drop tasks between days and reorder priorities within each day. A companion insights sidebar provides productivity metrics including completion rates, streaks, and upcoming deadlines.

**MVP Goal:** Deliver a fully functional weekly task dashboard with authentication, drag-and-drop task management, completion celebrations, and productivity insights—optimized for desktop with responsive mobile support.

---

## 2. UI Design Reference

> **CRITICAL: All implementation must closely follow the UI design reference image.**
>
> **Reference File:** `ui-design-referance.png` (root directory)

The UI design reference image is the **authoritative source** for visual implementation. When in doubt about styling, spacing, colors, or layout decisions, always refer back to this image.

### Key Design Elements from Reference

| Element | Specification |
|---------|---------------|
| **Top Nav** | Purple logo → Week dropdown with arrows → "This Week" button → Search → Notifications (red dot) → Avatar |
| **Day Headers** | Uppercase day name (MON, TUE...) + large bold date number + purple underline on current day |
| **Task Cards** | White card, colored DOT indicator (not stripe), title, optional time text |
| **Category Dots** | Pink/lavender (meeting), Taupe (general), Purple (urgent) |
| **Completed Tasks** | Green circular checkmark replaces category dot |
| **Sidebar** | Donut chart (75% center) → Legend → Weekly Stats with trends → Streak with 🔥 → Upcoming Deadlines |
| **FAB** | "New Task" with plus icon, purple, bottom-right |

### Implementation Directive

When building each component:
1. Open `ui-design-referance.png` side-by-side with code
2. Match spacing, typography weight, and color values precisely
3. Replicate exact card structure (dot indicator, not stripe)
4. Follow sidebar layout hierarchy exactly as shown

---

## 3. Mission & Principles

**Mission:** Empower professionals to visualize, organize, and conquer their weekly workload through an interface that feels calm to use and satisfying to complete.

**Core Principles:**
1. **Calm Foundation, Rewarding Action** - Peaceful default state; completing tasks triggers satisfaction
2. **Visual Clarity** - Reduce cognitive load and anxiety about workload
3. **Tactile Interaction** - Drag-and-drop that feels physical with weight and momentum
4. **Progress Visibility** - Show how far users have come, not just what remains
5. **Delightful Details** - Micro-copy and animations that spark joy without distraction

### Emotional UX Loop

The core emotional design follows a Calm → Action → Reward → Calm cycle:

```
┌─────────────────────────────────────────────────────────────────┐
│  CALM STATE (default)                                           │
│  • Warm cream background, soft shadows, gentle typography       │
│  • No visual noise or distractions                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ User clicks checkbox
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  REWARD STATE (0.8-1.2 seconds)                                 │
│  • Checkbox → Animated green tick (elastic bounce)              │
│  • Confetti burst from checkbox origin                          │
│  • Card content fades to muted styling                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ Animation completes
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  RETURN TO CALM                                                 │
│  • Task sits peacefully in "done" state                         │
│  • Sidebar stats update with gentle count-up animation          │
│  • Interface ready for next action                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Target Users

**Primary Persona: The Organized Professional**
- Knowledge workers, freelancers, project managers, students
- Comfortable with web applications
- Current tools: Google Calendar, Notion, Todoist, pen-and-paper planners
- Pain points: Tools too simple or too complex, no satisfying completion feedback, difficulty visualizing weekly workload

**Secondary Persona: The Visual Planner**
- Prefers spatial organization over lists
- Responds well to visual progress indicators
- Motivated by streaks and completion metrics

---

## 5. MVP Scope

### In Scope

**Core Functionality**
- ✅ Weekly calendar grid with 7 day columns (Mon-Sun)
- ✅ Task cards with title, category dot, and completion state
- ✅ Drag-and-drop between days (reschedule) and within days (reorder)
- ✅ Task creation via FAB and in-column click
- ✅ Task editing and deletion
- ✅ Task completion with confetti + animated checkmark
- ✅ Day-cleared celebration modal
- ✅ Week navigation (previous/next week, "This Week" button)

**Insights & Metrics**
- ✅ Completion rate donut chart with centered percentage
- ✅ Tasks completed/pending counts with trend indicators
- ✅ Streak counter with flame icon
- ✅ Upcoming deadlines list

**Emotional UX**
- ✅ Confetti burst animation on task completion
- ✅ Elastic checkmark animation
- ✅ Card hover/lift effects and drag visual feedback
- ✅ Contextual micro-copy and empty day prompts

**Technical**
- ✅ Email/password authentication via Supabase
- ✅ Local Supabase database (PostgreSQL)
- ✅ Row-level security for user data isolation
- ✅ Responsive design (desktop-first, mobile-friendly)

### Out of Scope (Future)
- ❌ Recurring tasks, subtasks, time-specific scheduling
- ❌ Multiple projects, tags, filtering, search
- ❌ Notifications, reminders, calendar integrations
- ❌ OAuth, team collaboration, native mobile apps, offline mode, dark mode

---

## 6. User Stories

### Primary User Stories

**US-1: Weekly Task Visualization**
> As a professional, I want to see all my tasks for the week in a single view, so that I can understand my workload at a glance.

*Example: Sarah opens TaskFlow Monday morning and immediately sees she has 3 tasks on Tuesday, 5 on Wednesday (her busiest day), and a light Friday. She can mentally prepare for her week.*

**US-2: Task Creation**
> As a user, I want to quickly add tasks to specific days, so that I can capture ideas and commitments as they arise.

*Example: During a meeting, John learns about a Friday deadline. He clicks the FAB, types "Submit quarterly report", selects Friday, chooses "urgent" category, and saves—all in under 10 seconds.*

**US-3: Task Rescheduling**
> As a user, I want to drag tasks between days, so that I can easily reschedule when priorities change.

*Example: Maria realizes Wednesday is overloaded. She drags two tasks to Thursday, watching them smoothly animate into their new positions.*

**US-4: Task Prioritization**
> As a user, I want to reorder tasks within a day by dragging, so that I can prioritize what I'll tackle first.

*Example: Tom starts his day by dragging his most important task to the top of Tuesday's column, establishing his focus for the morning.*

**US-5: Satisfying Completion**
> As a user, I want completing a task to feel rewarding, so that I'm motivated to keep progressing.

*Example: When Lisa checks off "Client presentation", she sees a burst of colorful confetti and an animated checkmark. The card fades to a muted "done" state. She smiles and moves to the next task.*

**US-6: Daily Achievement**
> As a user, I want to be celebrated when I complete all tasks for a day, so that I feel a sense of accomplishment.

*Example: After checking off his last Thursday task, Alex sees a modal appear: "Thursday? Handled. Nice work." He feels a moment of satisfaction before continuing.*

**US-7: Progress Tracking**
> As a user, I want to see my completion rate and streak, so that I can track my productivity over time.

*Example: Emma glances at the sidebar and sees "78% complete" in the donut chart, "12 tasks done" with an upward trend arrow, and a "5-day streak" with a flame icon.*

**US-8: Account Security**
> As a user, I want my tasks to be private and secure, so that I can trust the application with my work information.

*Example: After signing up with email/password, David's tasks are only visible to him. When he logs in from his laptop at home, all his tasks are there waiting.*

---

## 7. User Experience Requirements

### Device Support

| Device | Layout |
|--------|--------|
| Desktop (1440px+) | Full 7-day grid + sidebar (70%/30%) |
| Laptop (1024-1439px) | Full grid, collapsible sidebar |
| Tablet (768-1023px) | 5 days visible, horizontal scroll |
| Mobile (<768px) | Single-day view, swipe navigation, bottom sheet insights |

### Critical User Flows

1. **Onboarding:** Sign Up → Empty Dashboard → Create First Task → Complete Task → Experience Celebration
2. **Daily Management:** Login → View Week → Create/Reorder Tasks → Complete Tasks → View Progress
3. **Task Completion:** Click Checkbox → Ripple → Checkmark Draws → Confetti → Card Fades → Stats Update
4. **Day Cleared:** Complete Final Task → Modal: "{Day}? Conquered." → Auto-dismiss or click

### Error Handling

| Scenario | Response |
|----------|----------|
| Network failure | "Couldn't save. Retrying..." with auto-retry |
| Session expired | Redirect to login, preserve unsaved state |
| Task operation fails | Show error toast, allow retry |
| Drag fails | Animate task back to original position |

### Accessibility
- Full keyboard navigation with visible focus indicators
- ARIA labels on all interactive elements
- WCAG AA color contrast compliance
- Respect `prefers-reduced-motion` for animations

---

## 8. Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14+ (App Router) | SSR-ready, API routes for future AI integration |
| Styling | Tailwind CSS + shadcn/ui | Matches design system, rapid development |
| Drag & Drop | @dnd-kit | Modern, accessible, 60fps animations |
| Database | Supabase (local via CLI) | PostgreSQL, real-time, auth built-in |
| Auth | Supabase Auth | Email/password, session management |
| State | Zustand | Lightweight, persistent state |
| Charts | Recharts | Donut chart for completion metrics |
| Animations | Framer Motion | Confetti and celebration animations |

### Directory Structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx, signup/page.tsx
│   ├── (dashboard)/page.tsx
│   ├── api/tasks/route.ts
│   ├── layout.tsx, globals.css, providers.tsx
├── components/
│   ├── ui/                          # shadcn components
│   ├── dashboard/
│   │   ├── WeeklyGrid.tsx, DayColumn.tsx, TaskCard.tsx
│   │   ├── TaskCheckbox.tsx, ConfettiEffect.tsx, DayClearedModal.tsx
│   │   ├── InsightsSidebar.tsx, CompletionChart.tsx, StreakCounter.tsx
│   │   ├── TopNavBar.tsx, WeekSelector.tsx, NewTaskButton.tsx, TaskModal.tsx
│   └── auth/LoginForm.tsx, SignupForm.tsx
├── lib/
│   ├── supabase/client.ts, server.ts, middleware.ts
│   ├── store/taskStore.ts, uiStore.ts
│   ├── animations/confetti.ts, checkmark.ts
│   └── microcopy.ts, utils.ts
├── hooks/
│   ├── useTasks.ts, useWeekNavigation.ts, useDragAndDrop.ts
│   └── useCompletionCelebration.ts, useSound.ts
└── types/index.ts
```

---

## 9. Database Schema

```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  scheduled_date DATE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('meeting', 'general', 'urgent')),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_date ON tasks(user_id, scheduled_date);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completion_date DATE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### API Operations

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List tasks | GET | `/api/tasks?start={date}&end={date}` |
| Create task | POST | `/api/tasks` |
| Update task | PATCH | `/api/tasks/{id}` |
| Delete task | DELETE | `/api/tasks/{id}` |
| Reorder tasks | PATCH | `/api/tasks/reorder` |

### TypeScript Interfaces

```typescript
// types/index.ts

export type TaskCategory = 'meeting' | 'general' | 'urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledDate: string;  // ISO date string (YYYY-MM-DD)
  position: number;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayData {
  date: Date;
  dayName: string;        // "MON", "TUE", etc.
  dateNumber: number;     // 1-31
  isToday: boolean;
  tasks: Task[];
}

export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayData[];
}

export interface WeekStats {
  completed: number;
  pending: number;
  completionRate: number; // 0-100
  streak: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface UserPreferences {
  userId: string;
  streakCount: number;
  longestStreak: number;
  lastCompletionDate?: string;
  soundEnabled: boolean;
}
```

---

## 10. Component Specifications

### 10.1 Weekly Grid System

**Purpose:** Primary interface for visualizing and managing weekly tasks

**Layout (as shown in reference):**
```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  MON        TUE        WED        THU        FRI        SAT        SUN               │
│   20         21         22         23         24         25         26               │
│   ──                    ══                                                           │
│                        (today)                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ Task 1 │ │ Task 1 │ │ Task 1 │ │ Task 1 │ │ Task 1 │ │ Task 1 │ │ Task 1 │        │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                              │
│ │ Task 2 │ │ Task 2 │ │ Task 2 │ │ Task 2 │ │ Task 2 │                              │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘                              │
│     ...        ...        ...        ...        ...                                  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- 7 equal-width columns spanning Mon-Sun
- Sticky headers with day abbreviation (uppercase) and date number (large, bold)
- Purple underline accent on current day
- Columns extend full viewport height (accommodate 8-12 cards without scrolling)
- Overflow scrolling within individual columns when needed
- Warm cream (#EDE9E3) background

### 10.2 Top Navigation Bar

**Layout (matching reference - left to right):**
```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  🟣  │  ◀  Week ▼  ▶  │  📅 This Week  │           🔍 Search...        🔔•  👤      │
│ logo │   week nav      │  quick return  │               search      notif  avatar   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Elements:**
| Element | Position | Details |
|---------|----------|---------|
| App Logo | Far left | Purple circular icon |
| Week Nav Arrows | Left of dropdown | Left/right chevron buttons |
| "Week" Dropdown | After arrows | Shows current view mode |
| "This Week" Button | Center-left | Calendar icon + text, quick return to current week |
| Search Bar | Center-right | Magnifying glass icon + placeholder text |
| Notifications | Right | Bell icon with red dot indicator |
| User Avatar | Far right | Circular avatar image with dropdown menu |

### 10.3 Task Card (Reference: `ui-design-referance.png`)

```
┌─────────────────────────────┐
│ ● Task Title                │  ← Colored dot + title
│   8:00 am                   │  ← Optional time (muted)
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✓ Completed Task            │  ← Green checkmark replaces dot
└─────────────────────────────┘
```

**Visual States:**
| State | Appearance |
|-------|------------|
| Default | White card, subtle shadow, left-aligned colored dot |
| Hover | Slight lift (translateY -2px), enhanced shadow |
| Dragging | Elevated shadow, slight rotation (2deg) |
| Completed | Green circular checkmark, muted text, confetti burst |

**Category Dots:**
| Category | Color | Examples |
|----------|-------|----------|
| Meeting | `#F0D9E8` | Team Sync, Client Pitch Deck, One-on-One |
| General | `#DCD5C9` | Organize Files, Research New Tools, Draft Blog Post |
| Urgent | `#7C3AED` | Urgent Bug Fix |

### 10.2 Completion Celebration

**Animation Sequence:**
```
0-100ms:   Circle ripple expands from click point
100-250ms: Checkmark stroke draws in
250-400ms: Elastic overshoot and settle (bounce)
400-600ms: Confetti particles burst (12-18 particles)
600-800ms: Particles fade with gravity
```

**Confetti Specs:** 12-18 particles, colors (purple, pink, mint, gold), burst velocity → gravity + drift, ~600ms total

### 10.3 Day Cleared Modal

Triggers when all tasks in a day are completed:
- Fade-in with scale (0.95 → 1.0)
- Floating particle background
- Random message: "That's a wrap on {Day}." / "{Day}? Conquered." / "Nothing left. Breathe."
- Auto-dismiss after 3 seconds or on click

### 10.4 Insights Sidebar (Reference: `ui-design-referance.png`)

```
┌─────────────────────────────────┐
│         ╭───────────╮           │
│        │    75%     │           │  ← Donut chart
│        │ Completed  │           │
│         ╰───────────╯           │
│  ● High Completed     75%       │  ← Legend
│  ● Tasks Pending      14%       │
├─────────────────────────────────┤
│  Weekly Stats                   │
│  ☑ Tasks Completed    42  ↑     │
│  ☐ Tasks Pending      14  ↑     │
├─────────────────────────────────┤
│  🔥 12 Day Streak!              │
│     Keep it up!                 │
├─────────────────────────────────┤
│  Upcoming Deadlines             │
│  ● Finalize Q4 Report  Due 20 ⏱ │
│  ● Client Pitch Deck   Due 24 ⏱ │
└─────────────────────────────────┘
```

### 10.5 Micro-Copy System

**Purpose:** Add personality and delight through contextual, encouraging text

**Time-Based Greetings:**
| Time | Message |
|------|---------|
| 5am-12pm | "Ready to tackle the day?" |
| 12pm-5pm | "Afternoon productivity mode." |
| 5pm-9pm | "Wrapping up nicely." |
| 9pm-5am | "Burning the midnight oil?" |

**Streak Milestones:**
| Days | Message |
|------|---------|
| 3 days | "Building momentum!" |
| 7 days | "One week strong 🔥" |
| 14 days | "Two weeks! Unstoppable." |
| 30 days | "Monthly master 🏆" |

**Day Cleared Messages (random selection):**
- "That's a wrap on {Day}."
- "{Day}? Conquered."
- "Nothing left. Breathe."
- "{Day} is handled. Nice work."
- "Clean slate for {Day}."

**Empty State Prompts:**
| Context | Display |
|---------|---------|
| Future empty day | "Plan something?" with soft dotted placeholder |
| Past empty day | Clean empty space (no prompt) |
| Today empty | "Start your day?" with gentle prompt |

### 10.6 Sound Design (Optional Toggle)

| Action | Sound |
|--------|-------|
| Task complete | Soft pop + sparkle |
| Day cleared | Gentle chime cascade |
| Drag pickup/drop | Subtle whoosh/thunk |

---

## 11. Security & Configuration

### Authentication
- Email/password via Supabase Auth
- JWT tokens with automatic refresh
- Middleware-based route protection

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Test User
| Field | Value |
|-------|-------|
| Email | `test@taskflow.dev` |
| Password | `TestUser123!` |

---

## 12. Design Tokens

```typescript
// tailwind.config.ts
{
  colors: {
    background: '#EDE9E3',      // Warm cream
    card: '#FFFFFF',
    foreground: '#1E2433',      // Deep navy
    primary: '#7C3AED',         // Purple accent
    'category-meeting': '#F0D9E8',
    'category-general': '#DCD5C9',
    'category-urgent': '#7C3AED',
    success: '#10B981',         // Mint green
  },
  fontFamily: {
    sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  },
  borderRadius: {
    container: '1.25rem',
    card: '0.75rem',
  },
  boxShadow: {
    card: '0 1px 3px rgba(0,0,0,0.08)',
    'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
    'card-drag': '0 8px 24px rgba(0,0,0,0.15)',
  },
}
```

---

## 13. Success Criteria

### MVP Success Definition
User can: sign up/login → view weekly grid → create/edit/delete tasks → drag to reschedule/reorder → complete tasks with celebration → see day-cleared modal → view accurate sidebar metrics → access on desktop and mobile

### Functional Requirements
- ✅ Email/password authentication working
- ✅ 7-day weekly calendar grid displays correctly
- ✅ Week navigation (prev/next/"This Week") functional
- ✅ Task CRUD operations persist to database
- ✅ Drag-and-drop works horizontally and vertically
- ✅ Task completion shows confetti animation
- ✅ Day completion shows celebration modal
- ✅ Sidebar shows accurate completion %, stats, streak
- ✅ Responsive on mobile devices

### Quality Metrics
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Drag animation | 60fps |

---

## 14. Implementation Phases

> **IMPORTANT:** Keep `ui-design-referance.png` open as primary visual reference throughout all phases.

### Phase 1: Foundation & Auth (Days 1-3)
- ✅ Next.js project with TypeScript
- ✅ Tailwind CSS with design tokens
- ✅ Supabase CLI setup and database schema
- ✅ Auth pages (login/signup) functional
- ✅ Protected route middleware
- ✅ Test user seeded

**Validation:** User can sign up, log in, access protected dashboard route

### Phase 2: Core Dashboard Layout (Days 4-6)
- ✅ TopNavBar matching reference (logo, week nav, search, notifications, avatar)
- ✅ WeeklyGrid with 7 DayColumns
- ✅ Day headers: uppercase name + bold date + purple underline on today
- ✅ InsightsSidebar skeleton matching reference layout
- ✅ NewTaskButton (FAB) with "New Task" label
- ✅ Responsive breakpoints

**Validation:** Dashboard visually matches `ui-design-referance.png` at 1440px

### Phase 3: Task CRUD & Display (Days 7-9)
- ✅ TaskCard matching reference (dot indicator, title, optional time)
- ✅ Category color dots: pink (meeting), taupe (general), purple (urgent)
- ✅ Completed state: green circular checkmark
- ✅ TaskModal for create/edit
- ✅ API routes and Zustand store
- ✅ Optimistic updates

**Validation:** Task cards match reference; data persists

### Phase 4: Drag & Drop (Days 10-12)
- ✅ @dnd-kit providers configured
- ✅ Vertical reordering within days
- ✅ Horizontal rescheduling between days
- ✅ Visual feedback (shadows, placeholders, rotation)
- ✅ Position changes persisted

**Validation:** 60fps drag animations, positions persist correctly

### Phase 5: Celebrations (Days 13-15)
- ✅ TaskCheckbox with animated checkmark
- ✅ Confetti particle system
- ✅ DayClearedModal with random messages
- ✅ Sound effects (optional toggle)

**Validation:** Completing task triggers full celebration; clearing day shows modal

### Phase 6: Insights & Metrics (Days 16-18)
- ✅ CompletionChart: donut with centered percentage
- ✅ Legend and Weekly Stats with trend arrows
- ✅ StreakCounter with flame and encouragement text
- ✅ Upcoming Deadlines with clock icons
- ✅ Time-based greeting micro-copy

**Validation:** Sidebar matches reference; metrics update accurately

### Phase 7: Polish & Launch (Days 19-21)
- ✅ Loading skeletons and error handling
- ✅ Keyboard navigation and screen reader testing
- ✅ Mobile refinements
- ✅ Performance optimization
- ✅ Cross-browser testing

**Validation:** Stable, accessible, performant across all target devices

---

## 15. Future Considerations

**Phase 2:** Recurring tasks, subtasks, time scheduling, dark mode, keyboard shortcuts
**Phase 3:** Multiple projects, tags, filtering, search, data export
**Phase 4:** Calendar integrations, notifications, OAuth, native mobile apps

**Integration Opportunities:** AI task creation, calendar sync, Zapier/Make, Slack

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Animation performance on mobile | Use GPU-accelerated transforms, limit particles on mobile, respect `prefers-reduced-motion` |
| Drag-and-drop edge cases | Prototype early, use @dnd-kit collision detection, test nested scrolling |
| State sync issues | Implement rollback on errors, test network failure scenarios |
| Streak logic complexity | Store dates in UTC, unit test timezone edge cases |
| Scope creep | Strict adherence to MVP scope, time-box celebration polish to 3 days |

---

## 17. Dependencies

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr zustand

# UI
npx shadcn@latest init
npx shadcn@latest add button card dialog input label dropdown-menu avatar

# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Charts & Animation
npm install recharts framer-motion

# Utilities
npm install date-fns clsx tailwind-merge
```

### Key Documentation
- [Next.js](https://nextjs.org/docs) | [Supabase](https://supabase.com/docs) | [@dnd-kit](https://docs.dndkit.com)
- [Tailwind](https://tailwindcss.com/docs) | [shadcn/ui](https://ui.shadcn.com) | [Framer Motion](https://www.framer.com/motion)

---

*Document Version: 1.0 | Last Updated: January 2025 | Status: Ready for Implementation*
