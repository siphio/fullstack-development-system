---
description: "Create comprehensive feature plan with Playwright validation steps"
---

# Plan a New Feature

## Feature: $ARGUMENTS

## Mission

Transform a feature request into a **comprehensive implementation plan** through systematic codebase analysis, external research, and strategic planning—including **Playwright validation steps** for frontend verification.

**Core Principle**: We do NOT write code in this phase. Our goal is to create a context-rich implementation plan that enables one-pass implementation success for AI agents.

**Key Philosophy**: Context is King. The plan must contain ALL information needed for implementation AND validation—patterns, mandatory reading, documentation, validation commands, and Playwright test flows.

## Planning Process

### Phase 1: Feature Understanding

**Deep Feature Analysis:**

- Extract the core problem being solved
- Identify user value and business impact
- Determine feature type: New Capability/Enhancement/Refactor/Bug Fix
- Assess complexity: Low/Medium/High
- Map affected systems and components
- **Identify UI touchpoints** that will need Playwright validation

**Create User Story Format Or Refine If Story Was Provided By The User:**

```
As a <type of user>
I want to <action/goal>
So that <benefit/value>
```

### Phase 2: Codebase Intelligence Gathering

**Use specialized agents and parallel analysis:**

**1. Project Structure Analysis**

- Detect primary language(s), frameworks, and runtime versions
- Map directory structure and architectural patterns
- Identify service/component boundaries and integration points
- Locate configuration files (pyproject.toml, package.json, etc.)
- Find environment setup and build processes
- **Identify existing data-testid conventions**

**2. Pattern Recognition** (Use specialized subagents when beneficial)

- Search for similar implementations in codebase
- Identify coding conventions:
  - Naming patterns (CamelCase, snake_case, kebab-case)
  - File organization and module structure
  - Error handling approaches
  - Logging patterns and standards
- Extract common patterns for the feature's domain
- Document anti-patterns to avoid
- Check CLAUDE.md for project-specific rules and conventions
- **Check CLAUDE.md for Playwright validation workflow standards**

**3. Dependency Analysis**

- Catalog external libraries relevant to feature
- Understand how libraries are integrated (check imports, configs)
- Find relevant documentation in docs/, ai_docs/, .agents/reference or ai-wiki if available
- Note library versions and compatibility requirements

**If Planning a New Feature (not bug fix):**
- Read `.agents/reference/new-features.md` for platform-specific patterns
- Understand interface requirements (IPlatformAdapter, IAssistantClient)
- Review extension patterns for adapters, clients, commands, database operations

**4. Testing Patterns**

- Identify test framework and structure (pytest, jest, etc.)
- Find similar test examples for reference
- Understand test organization (unit vs integration)
- Note coverage requirements and testing standards
- **Identify existing Playwright tests if any**

**5. Integration Points**

- Identify existing files that need updates
- Determine new files that need creation and their locations
- Map router/API registration patterns
- Understand database/model patterns if applicable
- Identify authentication/authorization patterns if relevant

**6. Frontend UI Analysis** (For Playwright validation planning)

- Identify all user-facing components affected by this feature
- Map user flows (happy path and error paths)
- Note existing data-testid usage patterns
- Identify elements that will need data-testid attributes
- Document mobile-specific UI variations (responsive breakpoints)

**Clarify Ambiguities:**

- If requirements are unclear at this point, ask the user to clarify before you continue
- Get specific implementation preferences (libraries, approaches, patterns)
- Resolve architectural decisions before proceeding

### Phase 3: External Research & Documentation

**Use specialized subagents when beneficial for external research:**

**Documentation Gathering:**

- Research latest library versions and best practices
- Find official documentation with specific section anchors
- Locate implementation examples and tutorials
- Identify common gotchas and known issues
- Check for breaking changes and migration guides

**Technology Trends:**

- Research current best practices for the technology stack
- Find relevant blog posts, guides, or case studies
- Identify performance optimization patterns
- Document security considerations

**If Archon RAG is available and relevant:**
- Use `mcp__archon__rag_get_available_sources()` to see available documentation
- Search for relevant patterns: `mcp__archon__rag_search_knowledge_base(query="...")`
- Find code examples: `mcp__archon__rag_search_code_examples(query="...")`
- Focus on implementation patterns, best practices, and similar features

**Compile Research References:**

```markdown
## Relevant Documentation

- [Library Official Docs](https://example.com/docs#section)
  - Specific feature implementation guide
  - Why: Needed for X functionality
- [Framework Guide](https://example.com/guide#integration)
  - Integration patterns section
  - Why: Shows how to connect components
```

### Phase 4: Deep Strategic Thinking

**Think Harder About:**

- How does this feature fit into the existing architecture?
- What are the critical dependencies and order of operations?
- What could go wrong? (Edge cases, race conditions, errors)
- How will this be tested comprehensively?
- What performance implications exist?
- Are there security considerations?
- How maintainable is this approach?
- **What user flows need Playwright validation?**
- **What error states should be tested?**

**Design Decisions:**

- Choose between alternative approaches with clear rationale
- Design for extensibility and future modifications
- Plan for backward compatibility if needed
- Consider scalability implications

**PRD Validation (if PRD exists):**
- Read `.agents/PRD.md` if it exists in the project
- Verify plan preserves architectural patterns defined in PRD
- Ensure interface abstractions (IPlatformAdapter, IAssistantClient, etc.) are included in types section
- Confirm implementation uses interface types, not concrete classes in core logic
- Validate against any architectural principles or design constraints in PRD

### Phase 5: Playwright Validation Planning

**MANDATORY for all features with UI components.**

**Determine Validation Scope:**

1. **Identify User Outcomes** - What can the user accomplish with this feature?
2. **Map User Flows** - What steps does the user take to achieve each outcome?
3. **Identify Error Paths** - What validation errors or edge cases should be tested?
4. **Note Device Variations** - Do flows differ between desktop and mobile?

**Validation Flow Requirements:**

| Flow Type | Required When |
|-----------|---------------|
| Happy Path | Always (for any UI feature) |
| Validation Errors | Feature includes forms or user input |
| Edge Cases | Feature handles user data or has boundaries |
| Auth Boundaries | Feature has permission restrictions |
| Destructive Actions | Feature includes delete/remove operations |

**Device Testing Tier:**

- **Tier 1** (Desktop only): Admin-only or explicitly desktop features
- **Tier 2** (Desktop + Mobile): Default for all features
- **Tier 3** (Desktop + Mobile + Tablet): Critical user journeys (auth, checkout, primary conversions)

**Plan Required Test IDs:**

List all interactive elements that need `data-testid` attributes:

```markdown
### Required Test IDs

| Element | Test ID | Purpose |
|---------|---------|---------|
| Submit button | `task-submit-btn` | Primary form submission |
| Title input | `task-title-input` | Form field identification |
| Task list | `task-list-container` | Verification target |
| Error message | `task-error-message` | Error state verification |
```

### Phase 6: Plan Structure Generation

**Create comprehensive plan with the following structure:**

What's below here is a template for you to fill for the implementation agent:

```markdown
# Feature: <feature-name>

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

<Detailed description of the feature, its purpose, and value to users>

## User Story

As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement

<Clearly define the specific problem or opportunity this feature addresses>

## Solution Statement

<Describe the proposed solution approach and how it solves the problem>

## Feature Metadata

**Feature Type**: [New Capability/Enhancement/Refactor/Bug Fix]
**Estimated Complexity**: [Low/Medium/High]
**Primary Systems Affected**: [List of main components/services]
**Dependencies**: [External libraries or services required]
**Has UI Components**: [Yes/No]
**Playwright Validation Tier**: [1/2/3]

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

<List files with line numbers and relevance>

- `path/to/file.py` (lines 15-45) - Why: Contains pattern for X that we'll mirror
- `path/to/model.py` (lines 100-120) - Why: Database model structure to follow
- `path/to/test.py` - Why: Test pattern example

### New Files to Create

- `path/to/new_service.py` - Service implementation for X functionality
- `path/to/new_model.py` - Data model for Y resource
- `tests/path/to/test_new_service.py` - Unit tests for new service

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Documentation Link 1](https://example.com/doc1#section)
  - Specific section: Authentication setup
  - Why: Required for implementing secure endpoints
- [Documentation Link 2](https://example.com/doc2#integration)
  - Specific section: Database integration
  - Why: Shows proper async database patterns

### Patterns to Follow

<Specific patterns extracted from codebase - include actual code examples from the project>

**Naming Conventions:** (for example)

**Error Handling:** (for example)

**Logging Pattern:** (for example)

**Other Relevant Patterns:** (for example)

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

<Describe foundational work needed before main implementation>

**Tasks:**

- Set up base structures (schemas, types, interfaces)
- Create necessary type definitions

### Phase 2: Core Implementation

<Describe the main implementation work>

**Tasks:**

- Implement core business logic
- Create service layer components
- Add API endpoints or interfaces
- Implement data models

### Phase 3: Integration

<Describe how feature integrates with existing functionality>

**Tasks:**

- Connect to existing routers/handlers
- Register new components
- Update configuration files
- Add middleware or interceptors if needed

### Phase 4: Testing & Validation

<Describe testing approach>

**Tasks:**

- Implement unit tests for each component
- Create integration tests for feature workflow
- Add edge case tests
- Validate against acceptance criteria

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task Format Guidelines

Use information-dense keywords for clarity:

- **CREATE**: New files or components
- **UPDATE**: Modify existing files
- **ADD**: Insert new functionality into existing code
- **REMOVE**: Delete deprecated code
- **REFACTOR**: Restructure without changing behavior
- **MIRROR**: Copy pattern from elsewhere in codebase

### {ACTION} {target_file}

- **IMPLEMENT**: {Specific implementation detail}
- **PATTERN**: {Reference to existing pattern - file:line}
- **IMPORTS**: {Required imports and dependencies}
- **GOTCHA**: {Known issues or constraints to avoid}
- **TEST_ID**: {data-testid attributes to add for Playwright}
- **VALIDATE**: `{executable validation command}`

<Continue with all tasks in dependency order...>

---

## TESTING STRATEGY

<Define testing approach based on project's test framework and patterns discovered during research>

### Unit Tests

<Scope and requirements based on project standards>

Design unit tests with fixtures and assertions following existing testing approaches

### Integration Tests

<Scope and requirements based on project standards>

### Edge Cases

<List specific edge cases that must be tested for this feature>

---

## VALIDATION COMMANDS

<Define validation commands based on project's tools discovered in Phase 2>

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript type checking
npm run type-check

# ESLint (must pass with 0 errors)
npm run lint

# Prettier formatting check
npm run format:check
```

**Expected**: All commands pass with exit code 0

### Level 2: Unit Tests

<Project-specific unit test commands>

### Level 3: Integration Tests

<Project-specific integration test commands>

### Level 4: Manual Validation

<Feature-specific manual testing steps - API calls, UI testing, etc.>

---

## PLAYWRIGHT VALIDATION STEPS

**MANDATORY SECTION** - Do not skip this section for any feature with UI components.

### Validation Configuration

**Device Tier**: [1/2/3] - [Desktop Only / Desktop + Mobile / Desktop + Mobile + Tablet]
**Mobile Blocking**: true (set to false only with documented justification)
**Base URL**: http://localhost:[PORT]
**Auth Required**: [yes/no]
**Test User**: test@example.com (if auth required)

### Pre-conditions

- [ ] Dev server running at [URL]
- [ ] Test user seeded in database
- [ ] User logged in as [role] (if applicable)
- [ ] Starting route: /[route]
- [ ] Required seed data: [list any data dependencies]

### Required Test IDs

Elements that MUST have data-testid attributes:

| Element | Test ID | Component File |
|---------|---------|----------------|
| [element description] | `feature-element-type` | `path/to/component.tsx` |

### Flow 1: [Primary Flow Name] - Happy Path

**User Outcome**: [What the user accomplishes - e.g., "User successfully creates a new task"]

#### Desktop (1280×720)

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /[route] | - | Page loads, heading "[X]" visible |
| 2 | CLICK | button "[Label]" | [location/qualifier] | [Expected result] |
| 3 | TYPE | input "[Field Name]" | [location/qualifier] | Text entered, no validation errors |
| 4 | CLICK | button "[Submit Label]" | type=submit | [Success state] |
| 5 | VERIFY | [element] | - | [Contains/shows expected data] |

**Screenshot**: `flow1-happy-path-desktop.png` (after step 5)

#### Mobile (375×667)

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /[route] | - | Page loads (mobile layout) |
| 2 | CLICK | [mobile navigation element] | - | [Mobile-specific interaction] |
| ... | ... | ... | ... | ... |

**Screenshot**: `flow1-happy-path-mobile.png`

**Shared Outcome Verification** (execute phase verifies for both viewports):
- [Verification that confirms user outcome achieved]
- [Data persistence verification if applicable]

### Flow 2: [Error Handling Flow Name]

**User Outcome**: [Error states handled gracefully - e.g., "User sees validation errors when submitting incomplete form"]

| Step | Action | Target | Constraints | Expected Outcome |
|------|--------|--------|-------------|------------------|
| 1 | NAVIGATE | /[route] | - | Form displayed |
| 2 | CLICK | submit button | without filling required fields | Validation errors appear |
| 3 | VERIFY | error message | - | "[Expected error text]" visible |
| 4 | VERIFY | input "[Field]" | - | Has error state (aria-invalid or error class) |

**Screenshot**: `flow2-validation-errors.png` (after step 3)

### Flow 3: [Additional Flow if applicable]

<Add more flows as needed based on feature complexity>

### Console Validation Requirements

**Expected console state during validation:**
- No errors during happy path execution
- No errors during error handling flow
- Expected warnings (if any): [list specific expected warnings]

### Success Criteria Definition

**What the execute phase must verify:**
- All desktop flow steps complete within 30s timeout
- All mobile flow steps complete within 30s timeout
- No unexpected console errors in any flow
- All screenshots captured at designated checkpoints
- Data persists correctly after form submissions (if applicable)
- Error states display appropriate user feedback
- Mobile layout renders correctly without horizontal scroll

---

## ACCEPTANCE CRITERIA

<Define what success looks like - the execute phase will verify these>

**Functional Criteria:**
- Feature implements all specified functionality
- Code follows project conventions and patterns
- No regressions in existing functionality

**Code Quality Criteria:**
- All validation commands pass (lint, type-check, format)
- Unit test coverage meets requirements (80%+)
- Integration tests verify end-to-end workflows
- Build succeeds without errors

**Playwright Validation Criteria:**
- All defined flows pass on Desktop (1280×720)
- All defined flows pass on Mobile (375×667) - unless mobile_blocking: false
- All required data-testid attributes are implemented
- No unexpected console errors during validation

**Optional Criteria** (if applicable):
- Documentation updated
- Performance requirements met
- Security considerations addressed

---

## NOTES

<Additional context, design decisions, trade-offs>
```

## Output Format

**Filename**: `.agents/plans/{kebab-case-descriptive-name}.md`

- Replace `{kebab-case-descriptive-name}` with short, descriptive feature name
- Examples: `add-user-authentication.md`, `implement-search-api.md`, `refactor-database-layer.md`

**Directory**: Create `.agents/plans/` if it doesn't exist

### Plan Length Requirements

**HARD LIMITS**: 700-1000 lines | **NEVER exceed 1000 lines**

The 1000-line cap is a strict requirement to prevent context bloat. Plans must be information-dense and concise while remaining comprehensive enough for one-pass implementation.

**Why This Matters:**
- Long plans consume excessive context in execution agents
- Dense, focused plans have higher implementation success rates
- Brevity forces prioritization of truly essential information

**Information Density Principles:**

- **Focused Context**: Include ONLY information directly relevant to implementation—ruthlessly cut filler
- **Dense Information**: Every line must add value; prefer bullet points and code snippets over prose
- **Pattern References Over Repetition**: Use `MIRROR: path/to/file.py:15-30` instead of copying patterns
- **Actionable Tasks**: Specific enough to execute, not over-documented with obvious details
- **Essential Validation**: Include only flows that verify distinct user outcomes

**If your plan approaches or exceeds 1000 lines (MANDATORY cuts):**
1. **Consolidate tasks**: Group related tasks into single task blocks
2. **Use pattern references**: Replace inline code examples with `PATTERN: file:line-range`
3. **Trim boilerplate**: Remove generic guidance covered by CLAUDE.md
4. **Merge Playwright flows**: Combine flows testing similar outcomes
5. **Shorten documentation links**: One line per link, cut "Why" explanations if obvious
6. **Remove redundant validation**: Keep only essential commands per task
7. **Cut prose explanations**: Convert paragraphs to single-line bullets

**If your plan is under 700 lines:**
- Ensure all mandatory context references are included with specific line numbers
- Verify edge cases and error handling are documented
- Add testing strategy details specific to the feature
- Include integration points that might be overlooked
- Ensure Playwright validation section is complete with all flows
- Add gotchas and anti-patterns discovered during research

## Quality Criteria

### Line Count Validation ✓ (CHECK FIRST)

- [ ] **Plan is between 700-1000 lines** (use `wc -l` to verify)
- [ ] If over 1000: Apply mandatory cuts before saving
- [ ] If under 700: Verify all sections are adequately detailed

### Context Completeness ✓

- [ ] All necessary patterns identified and documented
- [ ] External library usage documented with links
- [ ] Integration points clearly mapped
- [ ] Gotchas and anti-patterns captured
- [ ] Every task has executable validation command

### Implementation Ready ✓

- [ ] Another developer could execute without additional context
- [ ] Tasks ordered by dependency (can execute top-to-bottom)
- [ ] Each task is atomic and independently testable
- [ ] Pattern references include specific file:line numbers

### Pattern Consistency ✓

- [ ] Tasks follow existing codebase conventions
- [ ] New patterns justified with clear rationale
- [ ] No reinvention of existing patterns or utils
- [ ] Testing approach matches project standards

### Information Density ✓

- [ ] No generic references (all specific and actionable)
- [ ] URLs include section anchors when applicable
- [ ] Task descriptions use codebase keywords
- [ ] Validation commands are non-interactive executable

### Playwright Validation Complete ✓

- [ ] All user-facing flows have validation steps
- [ ] Happy path AND error handling flows defined
- [ ] Both Desktop and Mobile steps specified (Tier 2+)
- [ ] Required data-testid attributes listed with component files
- [ ] Screenshot checkpoints defined
- [ ] Console validation requirements specified
- [ ] Pre-conditions clearly documented

## Success Metrics

**Line Count Compliant**: Plan is 700-1000 lines (HARD REQUIREMENT - verify with `wc -l`)

**One-Pass Implementation**: Execution agent can complete feature without additional research or clarification

**Validation Complete**: Every task has at least one working validation command

**Context Rich**: The Plan passes "No Prior Knowledge Test" - someone unfamiliar with codebase can implement using only Plan content

**Playwright Ready**: The validation agent can execute all Playwright flows without needing to ask questions

**Confidence Score**: #/10 that execution will succeed on first attempt

## Report

**BEFORE SAVING**: Run `wc -l` on the plan file. If >1000 lines, apply mandatory cuts until compliant.

After creating the Plan, provide:

- **Line count**: X lines (must be 700-1000)
- Summary of feature and approach
- Full path to created Plan file
- Complexity assessment
- Key implementation risks or considerations
- **Playwright validation coverage summary**:
  - Number of flows defined
  - Device tiers covered
  - Test IDs required
- Estimated confidence score for one-pass success
