# Phase 4: Drag and Drop - Errors and Fixes

This document catalogs all errors encountered during the Phase 4 drag-and-drop implementation and their respective solutions.

---

## Error 1: CSS Not Rendering (Unstyled HTML)

### Symptom
After implementing drag-and-drop, the frontend displayed raw unstyled HTML - no Tailwind CSS styles were being applied.

### Root Cause
Missing PostCSS configuration file for Tailwind CSS v4. The project uses Tailwind v4 which requires the `@tailwindcss/postcss` plugin instead of the legacy `tailwindcss` plugin.

### Fix
Created `postcss.config.mjs` in the project root:

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Files Changed
- `postcss.config.mjs` (new file)

---

## Error 2: Runtime ChunkLoadError

### Symptom
```
Runtime ChunkLoadError
Failed to load chunk /_next/static/chunks/node_modules_.pnpm_69989f4a.._js from module...
```

### Root Cause
Corrupted Next.js build cache in the `.next` directory after hot module replacement during development.

### Fix
Clear the `.next` cache and restart the dev server:

```bash
rm -rf .next && pnpm dev
```

### Files Changed
- None (runtime fix)

---

## Error 3: Cross-Day Drag Not Saving

### Symptom
Tasks could be reordered within the same day, but dragging a task to a different day column would not persist the change. No `PATCH /api/tasks/{id}` calls appeared in the server logs.

### Root Cause
In `useDragAndDrop.ts`, the logic to detect if `over.id` was a date column used:

```javascript
if (tasksByDate[overId] !== undefined) {
  targetDate = overId;
}
```

This failed for empty columns because `tasksByDate` only contains entries for dates that have tasks.

### Fix
Changed detection to use regex pattern matching for date format:

```javascript
// Helper to check if a string is a date in yyyy-MM-dd format
function isDateString(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

// In handleDragEnd:
if (isDateString(overId)) {
  targetDate = overId;
}
```

### Files Changed
- `src/hooks/useDragAndDrop.ts`

---

## Error 4: Complete Button Not Clickable

### Symptom
Clicking the colored category dot (complete button) on a task card would not mark the task as complete. The click was being intercepted.

### Root Cause
In `SortableTaskCard.tsx`, the drag listeners were spread onto the entire wrapper div:

```jsx
<div
  ref={setNodeRef}
  style={style}
  {...attributes}
  {...listeners}  // This captures ALL pointer events
>
```

This caused all pointer events (including clicks on the complete button) to be captured for drag detection.

### Fix
Created a custom pointer down handler that excludes button elements:

```typescript
const handlePointerDown = (e: React.PointerEvent) => {
  const target = e.target as HTMLElement;
  // Don't start drag if clicking on button or its children
  if (target.closest('button')) {
    return;
  }
  listeners?.onPointerDown?.(e);
};

return (
  <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    onPointerDown={handlePointerDown}  // Custom handler instead of ...listeners
  >
```

### Files Changed
- `src/components/dashboard/SortableTaskCard.tsx`

---

## Error 5: Adjacent Column Drop Detection Failure

### Symptom
Drag and drop only worked when dropping into columns that had no tasks in adjacent columns. For example:
- Dragging from Wed (15th) to Thu (16th) failed if Fri (17th) had tasks
- Dragging from Sat (17th) to Sun (18th) failed if adjacent columns had tasks
- Clearing adjacent columns would make the drop work

### Root Cause
The `closestCorners` collision detection algorithm was calculating distance to ALL droppable/sortable elements. When dragging over an empty column, the closest element was often a task in an adjacent column rather than the target column's droppable area.

### Fix
Created a custom collision detection algorithm that prioritizes day column containers:

```typescript
import {
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';

const customCollisionDetection: CollisionDetection = (args) => {
  // First check if pointer is within any droppable (day column)
  const pointerCollisions = pointerWithin(args);

  // Find collisions that are date containers (yyyy-MM-dd format)
  const containerCollisions = pointerCollisions.filter(
    (collision) => /^\d{4}-\d{2}-\d{2}$/.test(String(collision.id))
  );

  // If we're over a day column container, prioritize it
  if (containerCollisions.length > 0) {
    // But also check for task collisions within that container for reordering
    const taskCollisions = pointerCollisions.filter(
      (collision) => !/^\d{4}-\d{2}-\d{2}$/.test(String(collision.id))
    );
    // Return task collisions first (for reordering), then container
    return taskCollisions.length > 0 ? taskCollisions : containerCollisions;
  }

  // Fallback to rect intersection for edge cases
  return rectIntersection(args);
};
```

### Files Changed
- `src/components/dashboard/WeeklyGrid.tsx`

---

## Error 6: Test Password Mismatch (Playwright)

### Symptom
Playwright tests failed authentication with "Invalid login credentials".

### Root Cause
Test file used `TestPassword123!` but the seeded test user password was `TestPassword123` (without exclamation mark).

### Fix
Updated test file to use the correct password:

```typescript
const TEST_USER_PASSWORD = 'TestPassword123';  // Match seed.sql
```

### Files Changed
- `tests/drag-drop-validation.spec.ts`

---

## Error 7: Mobile Touch Tests Failing

### Symptom
```
touchscreen.tap: hasTouch must be enabled
```

### Root Cause
Playwright mobile tests attempted to use touchscreen API without enabling touch support.

### Fix
Added `hasTouch: true` to the mobile test configuration:

```typescript
test.describe('Drag and Drop - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true  // Enable touch support
  });
```

### Files Changed
- `tests/drag-drop-validation.spec.ts`

---

## Summary

| Error | Category | Severity | Resolution Time |
|-------|----------|----------|-----------------|
| CSS Not Rendering | Config | High | ~5 min |
| ChunkLoadError | Cache | Medium | ~2 min |
| Cross-Day Drag Not Saving | Logic | High | ~10 min |
| Complete Button Not Clickable | Event Handling | Medium | ~10 min |
| Adjacent Column Detection | Algorithm | High | ~15 min |
| Test Password Mismatch | Test Config | Low | ~2 min |
| Mobile Touch Tests | Test Config | Low | ~2 min |

**Total debugging time:** ~45 minutes

---

## Prevention Recommendations

1. **PostCSS Config**: When using Tailwind v4+, always ensure `postcss.config.mjs` exists with `@tailwindcss/postcss` plugin
2. **Cache Issues**: Add `rm -rf .next` to troubleshooting steps for any unexplained build/runtime errors
3. **Date Detection**: Use explicit format validation (regex) rather than checking object key existence
4. **Drag Events**: Always provide escape hatches for interactive elements within draggable containers
5. **Collision Detection**: Test drag-and-drop with various data configurations (empty columns, adjacent items)
6. **Test Credentials**: Document and centralize test user credentials to prevent mismatches
