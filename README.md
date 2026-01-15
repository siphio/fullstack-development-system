# Fullstack Development System

A systematised development workflow for fullstack projects with integrated Playwright validation.

## Overview

This system implements a **Plan → Execute → Validate → Commit** workflow optimized for fullstack applications with frontend UI components.

```
┌─────────────────┐
│     /prime      │  ← Understand codebase
└────────┬────────┘
         │
┌────────▼────────┐
│  /plan-feature  │  ← Create implementation plan with Playwright validation steps
└────────┬────────┘
         │
┌────────▼────────┐
│    /execute     │  ← Implement + Code validation + Playwright validation
└────────┬────────┘
         │
┌────────▼────────┐
│    /validate    │  ← Re-run Playwright validation (optional, standalone)
└────────┬────────┘
         │
┌────────▼────────┐
│    /commit      │  ← Push to GitHub
└─────────────────┘
```

## Commands

| Command | Purpose |
|---------|---------|
| `/prime` | Build codebase understanding |
| `/create_global_rules_prompt` | Generate CLAUDE.md with Playwright workflow |
| `/create-prd` | Create Product Requirements Document |
| `/plan-feature [feature-name]` | Create implementation plan with validation steps |
| `/execute [plan-file]` | Implement plan with full validation |
| `/validate [plan-file]` | Run Playwright validation independently |
| `/create_reference [topic]` | Create on-demand reference guide |
| `/commit` | Commit and push changes |

## Key Features

### Playwright Validation Integration

Every feature plan includes detailed Playwright validation steps:

- **Happy Path flows** - Primary user journey works
- **Error Handling flows** - Validation errors displayed correctly
- **Desktop + Mobile testing** - Default Tier 2 coverage
- **Console error checking** - No unexpected errors
- **Screenshot checkpoints** - Visual documentation

### Test User Standard

All fullstack projects include a seeded test user:

| Field | Value |
|-------|-------|
| Email | `test@example.com` |
| Password | `TestPassword123!` |
| Role | `admin` |

### Device Testing Tiers

| Tier | Viewports | When to Use |
|------|-----------|-------------|
| 1 | Desktop (1280×720) | Admin-only features |
| 2 | Desktop + Mobile (375×667) | **Default for all features** |
| 3 | Desktop + Mobile + Tablet (768×1024) | Critical user journeys |

### Test ID Conventions

Interactive elements use `data-testid` attributes:

```tsx
<button data-testid="task-submit-btn">Save</button>
<input data-testid="task-title-input" />
```

Pattern: `{feature}-{element}-{type}`

## Setup

### 1. Copy to Your Project

```bash
mkdir -p .claude/commands
cp -r fullstack-system/* .claude/commands/
```

### 2. Configure Playwright MCP

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 3. Generate CLAUDE.md

Run `/create_global_rules_prompt` to generate project-specific rules including:
- Playwright validation workflow
- Test user standard
- Device testing configuration
- Test ID conventions

### 4. Seed Test User

Add test user to your database seed script:

```typescript
// Example: seed-test-user.ts
await db.users.create({
  email: 'test@example.com',
  password: hashPassword('TestPassword123!'),
  role: 'admin',
  id: 'test-user-001'
});
```

## Workflow Example

### 1. Plan a Feature

```bash
/plan-feature add-task-creation
```

This generates `.agents/plans/add-task-creation.md` with:
- Implementation tasks
- Playwright validation steps
- Required test IDs
- Desktop + Mobile flows

### 2. Execute the Plan

```bash
/execute .agents/plans/add-task-creation.md
```

This:
1. Implements all tasks
2. Runs code validation (lint, type-check, tests)
3. Runs Playwright validation (desktop + mobile)
4. Reports results

### 3. Fix Issues and Re-validate

If Playwright validation fails:

```bash
# Fix the implementation issue, then:
/validate .agents/plans/add-task-creation.md
```

### 4. Commit

```bash
/commit
```

## Validation Flow Format

Plans include validation steps in this format:

```markdown
### Flow 1: Create Task - Happy Path

**User Outcome**: User successfully creates a new task

#### Desktop (1280×720)
| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /tasks | - | Page loads, heading "Tasks" visible |
| 2 | CLICK | button "New Task" | in header | Modal opens |
| 3 | TYPE | input "Title" | inside modal | Text entered |
| 4 | CLICK | button "Save" | type=submit | Task created, modal closes |
| 5 | VERIFY | task list | - | Contains "Test Task" |

Screenshot: `create-task-desktop.png`

#### Mobile (375×667)
| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /tasks | - | Page loads (mobile layout) |
| 2 | CLICK | FAB button | bottom-right | Modal opens (fullscreen) |
| ... | ... | ... | ... | ... |

Screenshot: `create-task-mobile.png`
```

## Playwright MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_snapshot` | Get accessibility tree (for finding elements) |
| `browser_click` | Click element by ref |
| `browser_type` | Type text into element |
| `browser_fill_form` | Fill multiple form fields |
| `browser_wait_for` | Wait for text/element/time |
| `browser_take_screenshot` | Capture screenshot |
| `browser_console_messages` | Get console logs/errors |
| `browser_resize` | Change viewport size |

## Requirements

- Node.js 18+
- Microsoft Playwright MCP (`@playwright/mcp`)
- Claude Code with MCP support

## File Structure

```
.claude/commands/
├── commit.md                    # Push changes
├── create_global_rules_prompt.md # Generate CLAUDE.md
├── create_reference.md          # Create reference guides
├── create-prd.md               # Create PRD
├── execute.md                  # Implement + validate
├── plan-feature.md             # Create plans with Playwright steps
├── prime.md                    # Build codebase understanding
└── validate.md                 # Standalone Playwright validation
```

## Version

Fullstack Development System v1.0
- Playwright MCP integration
- Desktop + Mobile validation (Tier 2 default)
- Test user standard
- Data-testid conventions
