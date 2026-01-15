# Phase 2: Core Dashboard Layout

## Feature Description

Build the core dashboard layout matching `ui-design-referance.png`: TopNavBar with week navigation, 7-day WeeklyGrid with DayColumns, InsightsSidebar skeleton, and NewTaskButton (FAB). This phase establishes the visual foundation before task CRUD in Phase 3.

## User Story

As a professional user
I want to see a weekly calendar grid with navigation and insights sidebar
So that I can visualize my week at a glance and prepare for task management

## Problem Statement

Phase 1 delivered auth but dashboard is placeholder. Need visual weekly grid layout.

## Solution Statement

TopNavBar (logo, week nav, search, notifications, avatar) + WeeklyGrid (7 DayColumns) + InsightsSidebar skeleton + FAB.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Dashboard layout, navigation, responsive breakpoints
**Dependencies**: date-fns (new), shadcn dropdown-menu, shadcn avatar
**Has UI Components**: Yes
**Playwright Validation Tier**: 2 (Desktop + Mobile)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

- `PRD.md:365-417` - Weekly Grid and TopNavBar specifications
- `PRD.md:467-489` - InsightsSidebar layout reference
- `PRD.md:185-195` - Device breakpoints (1440px, 1024px, 768px, <768px)
- `PRD.md:557-585` - Design tokens (colors, shadows, radii)
- `src/app/(dashboard)/layout.tsx:1-32` - Current layout to UPDATE
- `src/app/(dashboard)/page.tsx:1-22` - Current page to UPDATE
- `src/app/globals.css:1-49` - Design tokens already configured
- `src/components/ui/button.tsx:1-63` - Button variants pattern
- `src/components/ui/card.tsx:1-93` - Card component pattern
- `src/types/index.ts:1-54` - Existing types (Task, WeekStats)
- `CLAUDE.md:51-100` - Directory structure requirements

### New Files to Create

```
src/
├── components/dashboard/
│   ├── TopNavBar.tsx          # Full navigation bar
│   ├── WeekSelector.tsx       # Week nav arrows + dropdown
│   ├── WeeklyGrid.tsx         # 7-column grid container
│   ├── DayColumn.tsx          # Single day column
│   ├── InsightsSidebar.tsx    # Sidebar skeleton
│   └── NewTaskButton.tsx      # FAB component
├── hooks/
│   └── useWeekNavigation.ts   # Week date logic
└── lib/
    └── date-utils.ts          # Date formatting helpers
```

### Relevant Documentation

- [date-fns](https://date-fns.org/docs/Getting-Started) - Date manipulation
- [shadcn dropdown-menu](https://ui.shadcn.com/docs/components/dropdown-menu) - Avatar menu
- [shadcn avatar](https://ui.shadcn.com/docs/components/avatar) - User avatar

### Patterns to Follow

**PATTERN**: `src/components/ui/button.tsx` - 'use client', cn(), props interface, data-testid
**Naming**: PascalCase files, camelCase functions, kebab-case test IDs
**Dates**: date-fns `format()`, keep as `Date` objects internally

---

## STEP-BY-STEP TASKS

### 1. ADD Dependencies

```bash
pnpm add date-fns
pnpm dlx shadcn@latest add dropdown-menu avatar -y
```

**VALIDATE**: `pnpm list date-fns && ls src/components/ui/dropdown-menu.tsx`

---

### 2. UPDATE `src/types/index.ts` - Add Date Types

- **IMPLEMENT**: Add DayData, WeekData interfaces after WeekStats
- **PATTERN**: Follow existing interface style in file

```typescript
// Add after WeekStats interface (line 53):

export interface DayData {
  date: Date;
  dayName: string;      // "MON", "TUE", etc.
  dateNumber: number;   // 1-31
  isToday: boolean;
  isPast: boolean;
}

export interface WeekData {
  startDate: Date;      // Monday
  endDate: Date;        // Sunday
  days: DayData[];
  label: string;        // "Jan 20 - 26, 2025"
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 3. CREATE `src/lib/date-utils.ts`

- **IMPLEMENT**: Week calculation and formatting utilities

```typescript
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import type { DayData, WeekData } from '@/types';

export function getWeekData(date: Date): WeekData {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const today = startOfDay(new Date());

  const days: DayData[] = eachDayOfInterval({ start, end }).map((d) => ({
    date: d,
    dayName: format(d, 'EEE').toUpperCase(),
    dateNumber: d.getDate(),
    isToday: isToday(d),
    isPast: isBefore(d, today),
  }));

  const label = `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;

  return { startDate: start, endDate: end, days, label };
}

export function getNextWeek(date: Date): Date {
  return addWeeks(date, 1);
}

export function getPrevWeek(date: Date): Date {
  return subWeeks(date, 1);
}

export function formatWeekLabel(start: Date, end: Date): string {
  return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 4. CREATE `src/hooks/useWeekNavigation.ts`

- **IMPLEMENT**: Hook for week navigation state

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import { getWeekData, getNextWeek, getPrevWeek } from '@/lib/date-utils';
import { isThisWeek } from 'date-fns';
import type { WeekData } from '@/types';

export function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const weekData: WeekData = useMemo(
    () => getWeekData(currentDate),
    [currentDate]
  );

  const goToNextWeek = useCallback(() => {
    setCurrentDate((d) => getNextWeek(d));
  }, []);

  const goToPrevWeek = useCallback(() => {
    setCurrentDate((d) => getPrevWeek(d));
  }, []);

  const goToThisWeek = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const isCurrentWeek = useMemo(
    () => isThisWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

  return {
    weekData,
    currentDate,
    goToNextWeek,
    goToPrevWeek,
    goToThisWeek,
    isCurrentWeek,
  };
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 5. CREATE `src/components/dashboard/WeekSelector.tsx`

- **IMPLEMENT**: Week navigation arrows and dropdown
- **TEST_ID**: `week-nav-prev`, `week-nav-next`, `week-label`

```typescript
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeekSelectorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekSelector({ label, onPrev, onNext }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPrev}
        aria-label="Previous week"
        data-testid="week-nav-prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span
        className="text-sm font-medium min-w-[140px] text-center"
        data-testid="week-label"
      >
        {label}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        aria-label="Next week"
        data-testid="week-nav-next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 6. CREATE `src/components/dashboard/TopNavBar.tsx`

- **IMPLEMENT**: Full navigation bar matching reference
- **TEST_ID**: `top-nav`, `this-week-btn`, `search-input`, `notifications-btn`, `user-avatar`
- **PATTERN**: MIRROR dashboard/layout.tsx:12-27 for header structure

```typescript
'use client';

import { Calendar, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WeekSelector } from './WeekSelector';
import { cn } from '@/lib/utils';

interface TopNavBarProps {
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  isCurrentWeek: boolean;
  userEmail: string;
}

export function TopNavBar({
  weekLabel,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  isCurrentWeek,
  userEmail,
}: TopNavBarProps) {
  const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <header
      className="h-16 border-b bg-card flex items-center px-4 md:px-6 gap-4"
      data-testid="top-nav"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <span className="font-semibold hidden sm:inline">TaskFlow</span>
      </div>

      {/* Week Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <WeekSelector label={weekLabel} onPrev={onPrevWeek} onNext={onNextWeek} />
      </div>

      {/* This Week Button */}
      <Button
        variant={isCurrentWeek ? 'secondary' : 'outline'}
        size="sm"
        onClick={onThisWeek}
        className="hidden sm:flex gap-2"
        data-testid="this-week-btn"
      >
        <Calendar className="h-4 w-4" />
        <span>This Week</span>
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden lg:block w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-9"
          data-testid="search-input"
        />
      </div>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        data-testid="notifications-btn"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </Button>

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full"
            data-testid="user-avatar"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt={userEmail} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userEmail.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action="/api/auth/signout" method="post">
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full text-left" data-testid="signout-btn">
                Sign out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 7. CREATE `src/components/dashboard/DayColumn.tsx`

- **IMPLEMENT**: Single day column with header
- **TEST_ID**: `day-column-{mon|tue|...}`, `day-header-{mon|tue|...}`
- **GOTCHA**: Purple underline only on `isToday`, use border-b-2 with border-primary

```typescript
'use client';

import { cn } from '@/lib/utils';
import type { DayData } from '@/types';

interface DayColumnProps {
  day: DayData;
}

export function DayColumn({ day }: DayColumnProps) {
  const testIdSuffix = day.dayName.toLowerCase();

  return (
    <div
      className="flex flex-col min-w-[120px] flex-1"
      data-testid={`day-column-${testIdSuffix}`}
    >
      {/* Header */}
      <div
        className={cn(
          'sticky top-0 bg-background p-3 text-center border-b-2 z-10',
          day.isToday ? 'border-primary' : 'border-transparent'
        )}
        data-testid={`day-header-${testIdSuffix}`}
      >
        <div
          className={cn(
            'text-xs font-medium uppercase tracking-wide',
            day.isToday ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {day.dayName}
        </div>
        <div
          className={cn(
            'text-2xl font-bold mt-1',
            day.isToday ? 'text-primary' : 'text-foreground',
            day.isPast && !day.isToday && 'text-muted-foreground'
          )}
        >
          {day.dateNumber}
        </div>
      </div>

      {/* Task Area - will be populated in Phase 3 */}
      <div className="flex-1 p-2 space-y-2 min-h-[200px]">
        {/* Placeholder for tasks */}
      </div>
    </div>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 8. CREATE `src/components/dashboard/WeeklyGrid.tsx`

- **IMPLEMENT**: 7-column grid container with responsive layout
- **TEST_ID**: `weekly-grid`

```typescript
'use client';

import { DayColumn } from './DayColumn';
import type { WeekData } from '@/types';

interface WeeklyGridProps {
  weekData: WeekData;
}

export function WeeklyGrid({ weekData }: WeeklyGridProps) {
  return (
    <div
      className="flex-1 overflow-x-auto"
      data-testid="weekly-grid"
    >
      <div className="flex min-w-[840px] h-full">
        {weekData.days.map((day) => (
          <DayColumn key={day.date.toISOString()} day={day} />
        ))}
      </div>
    </div>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 9. CREATE `src/components/dashboard/InsightsSidebar.tsx`

- **IMPLEMENT**: Sidebar skeleton matching reference layout
- **TEST_ID**: `insights-sidebar`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function InsightsSidebar() {
  return (
    <aside
      className="w-80 shrink-0 hidden xl:block border-l bg-card p-4 space-y-4 overflow-y-auto"
      data-testid="insights-sidebar"
    >
      {/* Completion Chart Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="relative w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">--%</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Completed</span>
              <span className="ml-auto font-medium">--</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Pending</span>
              <span className="ml-auto font-medium">--</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasks Completed</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasks Pending</span>
            <span className="font-medium">--</span>
          </div>
        </CardContent>
      </Card>

      {/* Streak Placeholder */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-semibold">-- Day Streak</div>
              <div className="text-sm text-muted-foreground">Keep it up!</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No upcoming deadlines
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 10. CREATE `src/components/dashboard/NewTaskButton.tsx`

- **IMPLEMENT**: Floating action button for task creation
- **TEST_ID**: `fab-new-task`

```typescript
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
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 11. CREATE `src/components/dashboard/index.ts` - Barrel Export

```typescript
export { TopNavBar } from './TopNavBar';
export { WeekSelector } from './WeekSelector';
export { WeeklyGrid } from './WeeklyGrid';
export { DayColumn } from './DayColumn';
export { InsightsSidebar } from './InsightsSidebar';
export { NewTaskButton } from './NewTaskButton';
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 12. UPDATE `src/app/(dashboard)/layout.tsx`

- **IMPLEMENT**: Integrate TopNavBar, remove old header
- **PATTERN**: Keep auth check from current file

```typescript
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="dashboard-layout">
      {children}
    </div>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 13. UPDATE `src/app/(dashboard)/page.tsx`

- **IMPLEMENT**: Full dashboard with all components
- **GOTCHA**: TopNavBar is client component, page fetches user server-side

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <DashboardClient userEmail={user?.email || ''} />;
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 14. CREATE `src/app/(dashboard)/DashboardClient.tsx`

- **IMPLEMENT**: Client wrapper with week navigation state
- **TEST_ID**: `dashboard-page`

```typescript
'use client';

import {
  TopNavBar,
  WeeklyGrid,
  InsightsSidebar,
  NewTaskButton,
} from '@/components/dashboard';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';

interface DashboardClientProps {
  userEmail: string;
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const {
    weekData,
    goToNextWeek,
    goToPrevWeek,
    goToThisWeek,
    isCurrentWeek,
  } = useWeekNavigation();

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
        <WeeklyGrid weekData={weekData} />
        <InsightsSidebar />
      </div>
      <NewTaskButton />
    </>
  );
}
```

**VALIDATE**: `pnpm exec tsc --noEmit`

---

### 15. ADD Mobile Week Selector to TopNavBar

- **IMPLEMENT**: Show WeekSelector on mobile in a different position
- **UPDATE**: `src/components/dashboard/TopNavBar.tsx`

Add after Logo section, replace the hidden md:flex with responsive display:

```typescript
// Replace the Week Navigation section (around line 50):
{/* Week Navigation - Desktop */}
<div className="hidden md:flex items-center gap-2">
  <WeekSelector label={weekLabel} onPrev={onPrevWeek} onNext={onNextWeek} />
</div>

{/* Week Navigation - Mobile (compact) */}
<div className="flex md:hidden items-center">
  <WeekSelector label={weekLabel} onPrev={onPrevWeek} onNext={onNextWeek} />
</div>
```

**VALIDATE**: `pnpm exec tsc --noEmit && pnpm build`

---

## VALIDATION COMMANDS

```bash
pnpm exec tsc --noEmit    # Type check - must pass
pnpm lint                  # ESLint - must pass
pnpm build                 # Build - must succeed
```

---

## PLAYWRIGHT VALIDATION STEPS

### Validation Configuration

**Device Tier**: 2 (Desktop + Mobile)
**Mobile Blocking**: true
**Base URL**: http://localhost:3000
**Auth Required**: yes
**Test User**: test@taskflow.dev / TestPassword123!

### Pre-conditions

- [ ] Dev server running at http://localhost:3000
- [ ] Supabase running (`supabase status`)
- [ ] Test user exists in database

### Required Test IDs

| Element | Test ID | Component File |
|---------|---------|----------------|
| Dashboard layout | `dashboard-layout` | `layout.tsx` |
| Dashboard page | `dashboard-page` | `DashboardClient.tsx` |
| Top navigation | `top-nav` | `TopNavBar.tsx` |
| Week prev button | `week-nav-prev` | `WeekSelector.tsx` |
| Week next button | `week-nav-next` | `WeekSelector.tsx` |
| Week label | `week-label` | `WeekSelector.tsx` |
| This week button | `this-week-btn` | `TopNavBar.tsx` |
| Search input | `search-input` | `TopNavBar.tsx` |
| Notifications | `notifications-btn` | `TopNavBar.tsx` |
| User avatar | `user-avatar` | `TopNavBar.tsx` |
| Weekly grid | `weekly-grid` | `WeeklyGrid.tsx` |
| Day columns | `day-column-{mon\|tue\|...}` | `DayColumn.tsx` |
| Insights sidebar | `insights-sidebar` | `InsightsSidebar.tsx` |
| FAB | `fab-new-task` | `NewTaskButton.tsx` |
| Sign out | `signout-btn` | `TopNavBar.tsx` |

### Flow 1: Dashboard Layout - Happy Path

**User Outcome**: User sees complete dashboard layout with weekly grid

#### Desktop (1280×720)

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /login | - | Login page loads |
| 2 | TYPE | auth-email-input | - | test@taskflow.dev |
| 3 | TYPE | auth-password-input | - | TestPassword123! |
| 4 | CLICK | auth-submit-btn | - | Redirects to dashboard |
| 5 | VERIFY | top-nav | - | Navigation bar visible |
| 6 | VERIFY | weekly-grid | - | 7 day columns visible |
| 7 | VERIFY | insights-sidebar | - | Sidebar visible on desktop |
| 8 | VERIFY | fab-new-task | - | FAB visible bottom-right |
| 9 | VERIFY | day-column-mon | - | Monday column exists |
| 10 | VERIFY | day-column-sun | - | Sunday column exists |

**Screenshot**: `dashboard-layout-desktop.png`

#### Mobile (375×667)

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /login | - | Login page loads |
| 2 | TYPE | auth-email-input | - | test@taskflow.dev |
| 3 | TYPE | auth-password-input | - | TestPassword123! |
| 4 | CLICK | auth-submit-btn | - | Redirects to dashboard |
| 5 | VERIFY | top-nav | - | Compact nav visible |
| 6 | VERIFY | weekly-grid | - | Grid scrollable horizontally |
| 7 | VERIFY | insights-sidebar | NOT visible | Sidebar hidden on mobile |
| 8 | VERIFY | fab-new-task | - | FAB visible |

**Screenshot**: `dashboard-layout-mobile.png`

### Flow 2: Week Navigation

**User Outcome**: User can navigate between weeks

#### Desktop (1280×720)

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | (logged in) | / | - | Dashboard visible |
| 2 | SNAPSHOT | week-label | - | Note current week label |
| 3 | CLICK | week-nav-next | - | Week advances |
| 4 | VERIFY | week-label | - | Label shows next week |
| 5 | CLICK | week-nav-prev | - | Week goes back |
| 6 | CLICK | week-nav-prev | - | Week goes back again |
| 7 | VERIFY | week-label | - | Label shows previous week |
| 8 | CLICK | this-week-btn | - | Returns to current week |
| 9 | VERIFY | week-label | - | Label matches original |

**Screenshot**: `week-navigation.png`

### Flow 3: User Menu & Sign Out

**User Outcome**: User can access menu and sign out

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | (logged in) | / | - | Dashboard visible |
| 2 | CLICK | user-avatar | - | Dropdown menu opens |
| 3 | VERIFY | dropdown | - | Shows user email, Profile, Settings, Sign out |
| 4 | CLICK | signout-btn | in dropdown | Signs out |
| 5 | VERIFY | URL | - | Redirected to /login |

**Screenshot**: `user-menu.png`

### Console Validation Requirements

- No errors during dashboard load
- No errors during week navigation
- No errors during sign out

### Success Criteria Definition

- All 7 day columns render with correct day names
- Today's column has purple underline
- Week navigation updates all date displays
- Sidebar visible on desktop (>=1280px), hidden on mobile
- FAB positioned bottom-right
- Avatar dropdown functional with sign out

---

## ACCEPTANCE CRITERIA

**Functional Criteria:**
- [ ] TopNavBar matches reference layout
- [ ] 7-day WeeklyGrid displays correctly
- [ ] Today's column has purple underline indicator
- [ ] Week navigation (prev/next/this week) works
- [ ] Avatar dropdown with sign out functional
- [ ] InsightsSidebar visible on xl screens, hidden below
- [ ] FAB visible on all screen sizes

**Code Quality Criteria:**
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

**Playwright Validation Criteria:**
- [ ] Flow 1 passes on Desktop (1280×720)
- [ ] Flow 1 passes on Mobile (375×667)
- [ ] Flow 2 (week navigation) passes
- [ ] Flow 3 (user menu) passes
- [ ] All required data-testid attributes present
- [ ] No console errors

---

## NOTES

**Key Decisions:** Server page + client interactivity | date-fns | Week starts Monday | Sidebar hidden <xl
**Phase 3 Integration:** DayColumn gets tasks prop | FAB opens TaskModal | InsightsSidebar gets real data Phase 6
**Gotchas:** Avatar `modal={false}` for Dialog combo | FAB z-50 | min-w enables mobile scroll
