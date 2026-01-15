# Playwright Validation Skill

## Purpose

Execute frontend validation flows using Microsoft's Playwright MCP (`@playwright/mcp`). This skill is used by the validation sub-agent to verify UI implementation against the validation steps defined in a feature plan.

## When This Skill Is Used

This skill is loaded when:
- The `execute.md` command spawns a validation sub-agent (Step 7)
- The `validate.md` command is run standalone
- Any task requires automated UI validation

## Prerequisites

Before executing validation:

1. **Playwright MCP must be available** - The sub-agent needs access to `@playwright/mcp` tools
2. **Dev server must be running** - At the Base URL specified in the plan
3. **Test user must exist** - If authentication is required (typically `test@example.com` / `TestPassword123!`)

## Input Format

You will receive validation instructions containing:

```markdown
## Validation Configuration
- Device Tier: [1/2/3]
- Base URL: [http://localhost:PORT]
- Auth Required: [yes/no]
- Test User: [credentials if auth required]
- Mobile Blocking: [true/false]

## Pre-conditions
- [List of conditions that must be true before testing]

## Required Test IDs
| Element | Test ID | Component File |
|---------|---------|----------------|
| ... | ... | ... |

## Flow 1: [Flow Name]
**User Outcome**: [What the user accomplishes]

### Desktop (1280×720)
| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| ... | ... | ... | ... | ... |

Screenshot: [filename.png]

### Mobile (375×667)
| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| ... | ... | ... | ... | ... |

Screenshot: [filename.png]

## Console Validation Requirements
- [Expected console state]

## Success Criteria Definition
- [What must be true for validation to pass]
```

## Execution Process

### Step 1: Pre-flight Checks

```
1. Verify dev server is running:
   - Call browser_navigate to Base URL
   - If fails, report: "Dev server not accessible at [URL]"

2. If Auth Required = yes:
   - Navigate to login page
   - Call browser_snapshot to find login form
   - Use browser_type to enter test user credentials
   - Use browser_click to submit login
   - Verify login succeeded via browser_snapshot

3. Verify Required Test IDs exist:
   - Navigate to the feature's primary route
   - Call browser_snapshot
   - Check that each test ID from the table exists in the accessibility tree
   - If any missing, report which ones and STOP
```

### Step 2: Execute Flows

For each flow in the plan:

#### 2a. Desktop Validation

```
1. Set viewport:
   browser_resize(width=1280, height=720)

2. For each step in the Desktop table:
   
   a. Get current page state:
      snapshot = browser_snapshot()
   
   b. Execute action based on Action column:
      [See Action Mapping below]
   
   c. Verify Expected Outcome:
      snapshot = browser_snapshot()
      Check if Expected Outcome is present in snapshot
      Record: PASS or FAIL with details

3. At screenshot checkpoint:
   browser_take_screenshot(filename="[name]-desktop.png")

4. Check console:
   logs = browser_console_messages(onlyErrors=true)
   Compare against Console Validation Requirements
```

#### 2b. Mobile Validation (Tier 2+)

```
1. Set viewport:
   browser_resize(width=375, height=667)

2. For each step in the Mobile table:
   [Same process as desktop]
   Note: Mobile steps may differ (hamburger menu, etc.)

3. At screenshot checkpoint:
   browser_take_screenshot(filename="[name]-mobile.png")

4. Check console
```

#### 2c. Tablet Validation (Tier 3 only)

```
1. Set viewport:
   browser_resize(width=768, height=1024)

2. Execute flow steps (typically same as desktop)

3. Capture screenshot if specified
```

### Step 3: Verify Success Criteria

Check each item in the Success Criteria Definition:
- All steps completed within timeout
- No unexpected console errors
- Screenshots captured
- Data persistence verified (if applicable)

## Action Mapping

How to translate plan Actions to Playwright MCP tools:

### NAVIGATE
```
Action: NAVIGATE
Target: /dashboard
Expected: Page loads, heading "Dashboard" visible

Execute:
1. browser_navigate(url="[Base URL]/dashboard")
2. browser_snapshot()
3. Verify "Dashboard" heading exists in snapshot
```

### CLICK
```
Action: CLICK
Target: button "New Task"
Constraints: in header
Expected: Modal opens

Execute:
1. browser_snapshot() → find button with text "New Task" in header region
2. browser_click(element="New Task button in header", ref="[ref from snapshot]")
3. browser_snapshot() → verify modal is present
```

### TYPE
```
Action: TYPE
Target: input "Title"
Constraints: inside modal
Expected: Text entered

Execute:
1. browser_snapshot() → find input labeled "Title" inside modal
2. browser_type(element="Title input", ref="[ref]", text="[value from test]")
3. browser_snapshot() → verify text is in input
```

### FILL_FORM
```
Action: FILL_FORM
Target: [multiple fields]
Expected: All fields populated

Execute:
1. browser_fill_form(fields=[
     {element: "field1", ref: "[ref]", value: "value1"},
     {element: "field2", ref: "[ref]", value: "value2"}
   ])
2. browser_snapshot() → verify all fields populated
```

### VERIFY
```
Action: VERIFY
Target: task list
Constraints: -
Expected: Contains "Test Task"

Execute:
1. browser_snapshot()
2. Search snapshot for "Test Task" in task list region
3. Record PASS if found, FAIL if not
```

### WAIT
```
Action: WAIT
Target: loading spinner
Expected: hidden

Execute:
1. browser_wait_for(textGone="Loading") 
   OR browser_wait_for(time=2) for fixed waits
```

### SCREENSHOT
```
Action: SCREENSHOT
Target: checkout-complete.png

Execute:
1. browser_take_screenshot(filename="checkout-complete.png")
```

## Finding Elements in Snapshots

The `browser_snapshot()` tool returns an accessibility tree. To find elements:

1. **By text content**: Look for the text in the snapshot
   ```
   - button "Save Task" [ref=btn-1]
   ```

2. **By role + name**: Match role and accessible name
   ```
   - textbox "Email" [ref=input-1]
   ```

3. **By data-testid**: Look for the test ID in element attributes
   ```
   - button "Submit" [data-testid=task-submit-btn] [ref=btn-2]
   ```

4. **By constraints**: Narrow by location
   - "in header" → look in banner/header region
   - "in modal" → look in dialog region
   - "inside [container]" → look within that element's children

## Handling Authentication

If Auth Required = yes:

```
1. Navigate to login page (usually /login or /auth/login)

2. Get snapshot:
   browser_snapshot()

3. Find and fill credentials:
   browser_type(element="Email input", ref="[ref]", text="test@example.com")
   browser_type(element="Password input", ref="[ref]", text="TestPassword123!")

4. Submit:
   browser_click(element="Sign in button", ref="[ref]")

5. Wait for redirect:
   browser_wait_for(text="Dashboard") or appropriate landing page indicator

6. Verify logged in:
   browser_snapshot() → confirm user is authenticated
```

## Error Handling

### Element Not Found
```
If target element not found in snapshot:
1. Report which element was expected
2. Include snapshot excerpt showing what IS present
3. Suggest: "Element may not have rendered - check implementation"
4. Mark step as FAIL
```

### Timeout
```
If browser_wait_for times out:
1. Report what was being waited for
2. Take screenshot of current state
3. Check console for errors
4. Suggest: "May need longer timeout or element never appears"
5. Mark step as FAIL
```

### Console Errors
```
If unexpected console errors found:
1. List each error message
2. Note which step they appeared after
3. Check if errors are in the "expected warnings" list from plan
4. If unexpected, mark in report but don't necessarily fail the flow
```

### Auth Failure
```
If login fails:
1. Take screenshot of login page state
2. Check for error messages
3. Verify test user credentials are correct
4. Report: "Authentication failed - cannot proceed with validation"
5. STOP validation
```

## Output Format

Return results in this format:

```markdown
# Playwright Validation Report

**Plan**: [plan filename]
**Executed**: [timestamp]
**Device Tier**: [1/2/3]
**Base URL**: [url]

## Pre-flight Results

| Check | Status | Details |
|-------|--------|---------|
| Dev server | ✅ | Accessible at [url] |
| Authentication | ✅ | Logged in as test@example.com |
| Test IDs | ✅ | All [X] required test IDs present |

## Flow Results

### Flow 1: [Flow Name]

**User Outcome**: [from plan]

#### Desktop (1280×720)

| Step | Action | Target | Result | Details |
|------|--------|--------|--------|---------|
| 1 | NAVIGATE | /tasks | ✅ PASS | Page loaded, heading visible |
| 2 | CLICK | button "New Task" | ✅ PASS | Modal opened |
| 3 | TYPE | input "Title" | ✅ PASS | Text entered |
| 4 | CLICK | button "Save" | ✅ PASS | Task created |
| 5 | VERIFY | task list | ✅ PASS | "Test Task" found |

**Screenshot**: flow1-happy-path-desktop.png
**Console**: Clean (no errors)
**Desktop Result**: ✅ PASS (5/5 steps)

#### Mobile (375×667)

| Step | Action | Target | Result | Details |
|------|--------|--------|--------|---------|
| 1 | NAVIGATE | /tasks | ✅ PASS | Mobile layout rendered |
| 2 | CLICK | FAB button | ✅ PASS | Modal opened fullscreen |
| ... | ... | ... | ... | ... |

**Screenshot**: flow1-happy-path-mobile.png
**Console**: Clean (no errors)
**Mobile Result**: ✅ PASS (5/5 steps)

**Flow 1 Overall**: ✅ PASS

---

### Flow 2: [Flow Name]

[Same format...]

---

## Success Criteria Verification

| Criterion | Status |
|-----------|--------|
| All desktop steps complete within 30s | ✅ |
| All mobile steps complete within 30s | ✅ |
| No unexpected console errors | ✅ |
| All screenshots captured | ✅ |
| Data persists correctly | ✅ |

## Summary

| Metric | Value |
|--------|-------|
| Total Flows | 2 |
| Desktop Pass Rate | 2/2 (100%) |
| Mobile Pass Rate | 2/2 (100%) |
| Console Errors | 0 |
| Screenshots Captured | 4 |

## Overall Status

**✅ VALIDATION PASSED**

All flows passed on all required devices. Ready for commit.

---

[If failures occurred, include:]

## Failures Requiring Attention

### ❌ Flow 1, Desktop, Step 3

**Action**: TYPE into input "Title"
**Expected**: Text entered
**Actual**: Input not found in snapshot

**Screenshot**: failure-flow1-step3.png

**Snapshot excerpt**:
```
- dialog "Create Task":
  - textbox "Task Name" [ref=input-1]  ← Note: labeled "Task Name" not "Title"
  - button "Cancel" [ref=btn-1]
  - button "Save" [ref=btn-2]
```

**Suggested Fix**: 
The input is labeled "Task Name" in implementation but "Title" in the plan. Either:
1. Update implementation to use label "Title"
2. Update plan to use label "Task Name"
```

## Best Practices

1. **Always snapshot before acting** - Get fresh page state before each interaction

2. **Use descriptive element names** - When calling browser_click, use the element parameter to describe what you're clicking for the audit trail

3. **Don't assume refs persist** - Refs from browser_snapshot are only valid until the page changes; always get fresh snapshot

4. **Handle dynamic content** - Use browser_wait_for before verifying elements that load asynchronously

5. **Screenshot on failure** - Always capture current state when a step fails

6. **Check console after each flow** - Not after each step (too noisy), but after completing a flow

7. **Report, don't guess** - If something fails, report exactly what happened; don't try to interpret or fix

## Viewport Reference

| Device | Width | Height | Use |
|--------|-------|--------|-----|
| Desktop | 1280 | 720 | Default, all tiers |
| Mobile | 375 | 667 | iPhone SE, Tier 2+ |
| Tablet | 768 | 1024 | iPad, Tier 3 only |
