---
description: Execute a development plan with Playwright validation
argument-hint: [plan-file-path]
---

# Execute Development Plan with Playwright Validation

You are about to execute a comprehensive development plan with integrated task management and **Playwright frontend validation**. This workflow ensures systematic implementation and automated UI testing throughout the development process.

## Critical Requirements

**MANDATORY**: Throughout the ENTIRE execution of this plan, you MUST:
1. Maintain continuous task tracking (via Archon if available, or local tracking)
2. Execute all Playwright validation steps before marking the feature complete
3. NOT skip any validation phase, especially Playwright UI testing

## Step 1: Read and Parse the Plan

Read the plan file specified in: `$ARGUMENTS`

The plan file will contain:
- A list of tasks to implement
- References to existing codebase components and integration points
- Context about where to look in the codebase for implementation
- **Playwright Validation Steps section** with detailed test flows

**Verify the plan contains:**
- [ ] Implementation tasks
- [ ] Playwright Validation Steps section
- [ ] Required Test IDs list
- [ ] Pre-conditions for validation
- [ ] At least one Happy Path flow
- [ ] Device tier specification (1, 2, or 3)

If the Playwright Validation Steps section is missing or incomplete, **STOP** and notify the user that the plan needs to be updated before execution.

## Step 2: Project Setup

### If Archon is available:
1. Check if a project ID is specified in CLAUDE.md for this feature
   - Look for any Archon project references in CLAUDE.md
   - If found, use that project ID

2. If no project exists:
   - Create a new project in Archon using `mcp__archon__manage_project`
   - Use a descriptive title based on the plan's objectives
   - Store the project ID for use throughout execution

### If Archon is not available:
- Use local task tracking (TodoWrite or similar)
- Maintain a running checklist of completed tasks

## Step 3: Create All Tasks

For EACH task identified in the plan:
1. Create a corresponding task (in Archon or local tracking)
2. Set initial status as "todo"
3. Include detailed descriptions from the plan
4. Maintain the task order/priority from the plan

**IMPORTANT**: Create ALL tasks upfront before starting implementation. This ensures complete visibility of the work scope.

**Add Playwright Validation as Final Task**:
- Create a task: "Playwright Frontend Validation"
- Status: "todo"
- Description: "Execute all Playwright validation flows from plan"

## Step 4: Codebase Analysis

Before implementation begins:
1. Analyze ALL integration points mentioned in the plan
2. Use Grep and Glob tools to:
   - Understand existing code patterns
   - Identify where changes need to be made
   - Find similar implementations for reference
3. Read all referenced files and components
4. Build a comprehensive understanding of the codebase context
5. **Verify dev server start command** from CLAUDE.md or plan

## Step 5: Implementation Cycle

For EACH task in sequence:

### 5.1 Start Task
- Move the current task to "doing" status
- Use TodoWrite to track local subtasks if needed

### 5.2 Implement
- Execute the implementation based on:
  - The task requirements from the plan
  - Your codebase analysis findings
  - Best practices and existing patterns
- Make all necessary code changes
- Ensure code quality and consistency
- **Add data-testid attributes as specified in the plan's Required Test IDs table**

### 5.3 Validate Task
- Run the task's VALIDATE command if specified
- Check for linting/type errors
- Ensure the task compiles/builds

### 5.4 Complete Task
- Once implementation is complete, move task to "review" status
- DO NOT mark as "done" yet - this comes after full validation

### 5.5 Proceed to Next
- Move to the next task in the list
- Repeat steps 5.1-5.4

**CRITICAL**: Only ONE task should be in "doing" status at any time. Complete each task before starting the next.

## Step 6: Code Validation Phase

After ALL implementation tasks are in "review" status:

### 6.1 Syntax & Style Validation
Run all Level 1 validation commands from the plan:
```bash
# Example - use commands from plan
npm run type-check
npm run lint
npm run format:check
```

**Gate**: All commands must pass with exit code 0 before proceeding.

### 6.2 Unit Test Validation
Run all Level 2 validation commands from the plan:
```bash
# Example - use commands from plan
npm run test
```

**Gate**: All tests must pass before proceeding.

### 6.3 Integration Test Validation
Run all Level 3 validation commands from the plan (if applicable):
```bash
# Example - use commands from plan
npm run test:integration
```

**Gate**: All tests must pass before proceeding.

## Step 7: Playwright Frontend Validation

**MANDATORY PHASE** - Do not skip this step.

This phase validates the implemented feature works correctly from the user's perspective. **Spawn a sub-agent** to execute Playwright validation, keeping the validation context isolated from the main execution.

### 7.1 Prepare Validation Context

Before spawning the sub-agent, gather the required information:

1. **Extract from the plan file**:
   - The entire `## Playwright Validation Steps` section
   - Validation Configuration (Device Tier, Base URL, Auth Required, Mobile Blocking)
   - Pre-conditions
   - Required Test IDs table
   - All Flow tables (Desktop and Mobile steps)
   - Console Validation Requirements
   - Success Criteria Definition

2. **Extract from CLAUDE.md**:
   - Dev server start command
   - Test user credentials
   - Any project-specific Playwright configuration

3. **Determine what was implemented**:
   - List of files created/modified
   - Features implemented
   - Components affected

### 7.2 Spawn Playwright Validation Sub-Agent

**Use the Task tool to spawn a sub-agent** with the following prompt:

```
You are a Playwright validation agent. Your task is to validate the frontend implementation using Microsoft's Playwright MCP (@playwright/mcp).

## What Was Implemented
[List features and files from Step 7.1]

## Validation Configuration
[Paste Validation Configuration from plan]

## Pre-conditions
[Paste Pre-conditions from plan]

## Required Test IDs
[Paste Required Test IDs table from plan]

## Validation Flows

[Paste all Flow tables from plan - Desktop and Mobile for each flow]

## Console Validation Requirements
[Paste Console Validation Requirements from plan]

## Success Criteria
[Paste Success Criteria Definition from plan]

## Your Instructions

1. **Pre-flight checks**:
   - Verify dev server is running at [Base URL]
   - If Auth Required, log in as test user: [credentials]
   - Verify all Required Test IDs exist in the DOM
   - Verify Pre-conditions are met

2. **Execute each flow**:
   - Set viewport for Desktop (1280×720)
   - Execute each step from the Desktop table using Playwright MCP tools:
     - NAVIGATE → browser_navigate
     - CLICK → browser_snapshot to find ref, then browser_click
     - TYPE → browser_snapshot to find ref, then browser_type
     - FILL_FORM → browser_fill_form
     - VERIFY → browser_snapshot and check content
     - WAIT → browser_wait_for
     - SCREENSHOT → browser_take_screenshot
   - Verify Expected Outcome after each step
   - Capture screenshot at checkpoint
   
   - If Device Tier 2+: Set viewport for Mobile (375×667)
   - Execute Mobile steps from the Mobile table
   - Capture mobile screenshot
   
   - Check console after each flow: browser_console_messages(onlyErrors=true)

3. **Verify Success Criteria**:
   - Check each item in Success Criteria against actual results

4. **Report results** in this format:

### Playwright Validation Report

**Device Tier**: [tier]
**Base URL**: [url]

#### Pre-flight Results
- Dev server: ✅/❌
- Auth: ✅/❌/N/A
- Test IDs present: ✅/❌ [list any missing]
- Pre-conditions: ✅/❌

#### Flow Results

**[Flow 1 Name]**
| Device | Steps | Result | Screenshot |
|--------|-------|--------|------------|
| Desktop | X/X passed | ✅/❌ | [filename] |
| Mobile | X/X passed | ✅/❌ | [filename] |
Console: [clean / errors found]

**[Flow 2 Name]**
[same format]

#### Success Criteria Verification
- [criterion 1]: ✅/❌
- [criterion 2]: ✅/❌
...

#### Overall Result
**STATUS**: ✅ PASS / ❌ FAIL

[If FAIL, list what failed and suggested fixes]
```

### 7.3 Handle Sub-Agent Results

When the sub-agent returns:

**If STATUS: PASS**
- Proceed to Step 8 (Finalize Tasks)
- Include the validation report in the final summary

**If STATUS: FAIL**
- Review the failures reported by sub-agent
- Determine if failures are:
  - **Implementation bugs**: Fix the code, re-run from Step 6
  - **Missing test IDs**: Add the data-testid attributes, re-run Step 7
  - **Timing issues**: Note for sub-agent to add waits, re-run Step 7
  - **Plan inaccuracies**: If user outcome achieved despite step failure, document and proceed
  
- For mobile failures with `mobile_blocking: false`:
  - Document the failures as warnings
  - Proceed to Step 8

**If sub-agent encounters errors**:
- Check if Playwright MCP is available
- Check if dev server is running
- Resolve blockers and re-spawn sub-agent

## Step 8: Finalize Tasks

After successful validation (Code + Playwright):

1. For each implementation task:
   - Move from "review" to "done" status

2. For the Playwright Validation task:
   - Move to "done" with summary of results

3. For any tasks that failed validation:
   - Leave in "review" status
   - Document the failure reason

## Step 9: Final Report

Provide a comprehensive summary:

### Implementation Summary
- Total tasks created and completed
- Any tasks remaining in review and why
- Key features implemented
- Any issues encountered and how they were resolved

### Code Validation Summary
- Linting: PASS/FAIL
- Type checking: PASS/FAIL  
- Unit tests: X/Y passing
- Integration tests: X/Y passing

### Playwright Validation Summary
- **Device Tier**: [1/2/3]
- **Total Flows**: [X]
- **Desktop Results**: [X/Y PASS]
- **Mobile Results**: [X/Y PASS] (or N/A if Tier 1)
- **Console Errors**: None / [count]
- **Screenshots**: [list captured files]

| Flow | Desktop | Mobile | Status |
|------|---------|--------|--------|
| Happy Path | ✅ | ✅ | PASS |
| Error Handling | ✅ | ✅ | PASS |
| ... | ... | ... | ... |

### Overall Status
- [ ] All implementation complete
- [ ] All code validation passed
- [ ] All Playwright validation passed
- [ ] **Ready for commit**: YES / NO

### Next Steps
- If ready: Run `/commit` command
- If not ready: [List what needs to be fixed]

## Workflow Rules

1. **NEVER** skip Playwright validation for UI features
2. **ALWAYS** create all tasks before starting implementation
3. **MAINTAIN** one task in "doing" status at a time
4. **VALIDATE** all work before marking tasks as "done"
5. **TRACK** progress continuously through status updates
6. **ANALYZE** the codebase thoroughly before implementation
7. **TEST** everything before final completion
8. **CAPTURE** screenshots at all designated checkpoints
9. **CHECK** console for errors after each flow

## Error Handling

### If task management (Archon) fails:
1. Retry the operation
2. If persistent, continue with local tracking
3. Document the issue

### If dev server won't start:
1. Check for port conflicts
2. Review server logs
3. Ensure dependencies installed
4. Cannot proceed with Playwright validation until resolved

### If Playwright MCP is unavailable:
1. Document that automated validation was not performed
2. Provide manual testing steps as alternative
3. Mark Playwright validation task as "blocked"
4. **Do NOT mark feature as complete without validation**

### If test user doesn't exist:
1. Run the seed command from CLAUDE.md
2. If no seed command exists, create test user manually
3. Document the user creation for future reference

## Notes

- If you encounter issues not addressed in the plan, document them
- If you need to deviate from the plan, explain why
- If tests fail, fix implementation until they pass
- Don't skip validation steps
- **Playwright validation is not optional for UI features**

### Ready for Commit
- Confirm all implementation complete
- Confirm all code validations pass
- Confirm all Playwright validations pass
- Ready for `/commit` command
