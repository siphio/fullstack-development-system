---
description: Run Playwright validation independently on a feature plan
argument-hint: [plan-file-path]
---

# Validate: Run Playwright Frontend Validation

Execute Playwright validation flows from a feature plan. Use this command to:
- Run validation after implementation without full re-execution
- Re-run validation after fixing issues
- Test validation flows before implementation (dry-run style)

## Prerequisites

Before running validation:

1. **Dev server must be running** at the URL specified in the plan
2. **Implementation must be complete** (or partially complete for specific flow testing)
3. **Playwright MCP must be available** (`@playwright/mcp`)

## Step 1: Load the Plan

Read the plan file specified in: `$ARGUMENTS`

Extract the **Playwright Validation Steps** section, which should contain:
- Validation Configuration (Device Tier, Base URL, Auth Required)
- Pre-conditions
- Required Test IDs
- Validation Flows (Happy Path, Error Handling, etc.)

**If the plan lacks Playwright Validation Steps**, inform the user:
```
❌ Plan missing Playwright Validation Steps section.
Run /plan-feature to generate a complete plan with validation steps.
```

## Step 2: Pre-flight Checks

### 2.1 Verify Dev Server

```bash
# Check if server is responding
curl -s [BASE_URL] > /dev/null && echo "✅ Server running" || echo "❌ Server not running"
```

If server is not running:
1. Attempt to start it using command from CLAUDE.md
2. Wait for it to be ready
3. If cannot start, abort validation with instructions

### 2.2 Verify Authentication (if required)

If `Auth Required: yes` in the plan:
1. Navigate to login page
2. Enter test user credentials:
   - Email: `test@example.com` (or as specified)
   - Password: `TestPassword123!` (or as specified)
3. Verify login successful
4. If login fails, abort with error

### 2.3 Verify Pre-conditions

Check each item in the Pre-conditions section:
- [ ] Starting route accessible
- [ ] Required seed data present
- [ ] User has correct role/permissions

## Step 3: Execute Validation Flows

### Determine Device Scope

Based on **Device Tier** in the plan:

| Tier | Viewports to Test |
|------|-------------------|
| 1 | Desktop (1280×720) only |
| 2 | Desktop (1280×720) + Mobile (375×667) |
| 3 | Desktop (1280×720) + Mobile (375×667) + Tablet (768×1024) |

### For Each Flow in the Plan:

#### 3.1 Desktop Validation (All Tiers)

1. **Set viewport**: `browser_resize` to 1280×720

2. **Get initial snapshot**: `browser_snapshot`

3. **Execute each step** from the flow table:

   For each row in the flow:
   
   **NAVIGATE**:
   ```
   browser_navigate(url="[BASE_URL][route]")
   browser_snapshot() → verify expected heading/element
   ```
   
   **CLICK**:
   ```
   browser_snapshot() → find element matching Target + Constraints
   browser_click(element="[description]", ref="[ref from snapshot]")
   browser_snapshot() → verify Expected Outcome
   ```
   
   **TYPE**:
   ```
   browser_snapshot() → find input matching Target
   browser_type(element="[description]", ref="[ref]", text="[value]")
   browser_snapshot() → verify text entered
   ```
   
   **FILL_FORM**:
   ```
   browser_fill_form(fields=[...])
   browser_snapshot() → verify all fields populated
   ```
   
   **VERIFY**:
   ```
   browser_snapshot() → check Expected Outcome present in snapshot
   ```
   
   **WAIT**:
   ```
   browser_wait_for(text="[text]") or browser_wait_for(textGone="[text]")
   ```
   
   **SCREENSHOT**:
   ```
   browser_take_screenshot(filename="[name].png")
   ```

4. **Record step result**: ✅ PASS or ❌ FAIL with details

5. **Capture screenshot** at designated checkpoints

6. **Check console**: `browser_console_messages(onlyErrors=true)`

#### 3.2 Mobile Validation (Tier 2 and 3)

1. **Set viewport**: `browser_resize` to 375×667

2. **Execute mobile-specific flow steps**:
   - Mobile flows may differ (hamburger menu, stacked layouts)
   - Use the Mobile steps table from the plan

3. **Note mobile-specific behaviors**:
   - Touch targets should be adequately sized
   - No horizontal scroll should occur
   - Modal/dialogs should be fullscreen or appropriately sized

4. **Record results and capture screenshots**

#### 3.3 Tablet Validation (Tier 3 only)

1. **Set viewport**: `browser_resize` to 768×1024

2. **Execute flow steps** (typically same as desktop)

3. **Record results**

### 3.4 Console Error Check

After completing all flows:

```
browser_console_messages(onlyErrors=true)
```

- No errors expected for happy path flows
- Document any errors found
- Compare against "Expected warnings" in plan if specified

## Step 4: Generate Validation Report

### Summary Table

```markdown
## Playwright Validation Report

**Plan**: [plan filename]
**Executed**: [timestamp]
**Device Tier**: [1/2/3]

### Results by Flow

| Flow | Desktop | Mobile | Tablet | Status |
|------|---------|--------|--------|--------|
| Happy Path | ✅ 5/5 | ✅ 5/5 | N/A | PASS |
| Error Handling | ✅ 4/4 | ✅ 4/4 | N/A | PASS |

### Console Errors
- Desktop: None
- Mobile: None

### Screenshots Captured
- flow1-happy-path-desktop.png
- flow1-happy-path-mobile.png
- flow2-error-handling-desktop.png
- flow2-error-handling-mobile.png
```

### Detailed Results (if failures)

For any failed steps:

```markdown
### ❌ Failed: [Flow Name] - [Device] - Step [N]

**Action**: [What was attempted]
**Target**: [Element description]
**Expected**: [What should have happened]
**Actual**: [What actually happened]

**Screenshot**: [failure-screenshot.png]

**Console Errors** (if any):
- [error message]

**Suggested Fix**:
- [Diagnosis and recommendation]
```

## Step 5: Final Status

### All Flows Passed

```markdown
## ✅ Playwright Validation PASSED

All [X] flows passed across [Desktop/Desktop+Mobile/All devices].
No console errors detected.
[Y] screenshots captured.

**Ready for**: /commit
```

### Some Flows Failed

```markdown
## ❌ Playwright Validation FAILED

**Passed**: [X] flows
**Failed**: [Y] flows

### Failures Requiring Attention:

1. [Flow name] - [Device] - [Brief description]
   - Likely cause: [diagnosis]
   - Suggested fix: [recommendation]

**Next Steps**:
1. Fix the identified issues
2. Re-run: /validate [plan-file]
```

### Mobile Failed with Override

If `mobile_blocking: false` in the plan:

```markdown
## ⚠️ Playwright Validation PASSED WITH WARNINGS

**Desktop**: ✅ All flows passed
**Mobile**: ⚠️ [X] flows failed (non-blocking per plan)

### Mobile Warnings:
- [Flow] - [Issue description]

**Note**: Mobile failures documented but not blocking per plan configuration.

**Ready for**: /commit (with mobile issues documented)
```

## Quick Reference: Playwright MCP Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `browser_navigate` | Go to URL | `url` |
| `browser_snapshot` | Get accessibility tree | (none) |
| `browser_click` | Click element | `element`, `ref` |
| `browser_type` | Type text | `element`, `ref`, `text` |
| `browser_fill_form` | Fill multiple fields | `fields` |
| `browser_wait_for` | Wait for condition | `text`, `textGone`, `time` |
| `browser_take_screenshot` | Capture image | `filename` |
| `browser_console_messages` | Get console logs | `onlyErrors` |
| `browser_resize` | Change viewport | `width`, `height` |
| `browser_close` | Close browser | (none) |

## Troubleshooting

### "Element not found"
1. Call `browser_snapshot` to see current page state
2. Verify the target element exists in snapshot
3. Check if page fully loaded (may need `browser_wait_for`)
4. Verify data-testid was added during implementation

### "Timeout waiting for element"
1. Increase wait time or add explicit `browser_wait_for`
2. Check if element is conditionally rendered
3. Verify no JavaScript errors blocking render

### "Console errors detected"
1. Review the specific errors
2. Check if they're expected (listed in plan)
3. If unexpected, may indicate implementation bug

### "Mobile layout broken"
1. Check for missing responsive styles
2. Verify no fixed-width elements
3. Check for horizontal overflow
4. May need CSS fixes before re-running

## Notes

- This command can be run multiple times until all flows pass
- Screenshots are overwritten on each run
- Use `/execute` for full implementation + validation
- Use `/validate` for validation-only runs
