---
description: Create global rules (CLAUDE.md) for fullstack projects with Playwright validation
---

# Create Global Rules: Fullstack Development System

When the user runs this command, analyze the project and create comprehensive global rules optimized for fullstack development with integrated Playwright validation.

---

**PROMPT BEGINS HERE:**

---

Help me create the global rules for my fullstack project. Analyze the project first to see if it is a brand new project or if it is an existing one, because if it's a brand new project, then we need to do research online to establish the tech stack and architecture and everything that goes into the global rules. If it's an existing code base, then we need to analyze the existing code base.

## Instructions for Creating Global Rules

Create a `CLAUDE.md` file following this structure:

### Required Sections:

1. **Core Principles**
   - Non-negotiable development principles (naming conventions, logging requirements, type safety, documentation standards)
   - Keep these clear and actionable

2. **Tech Stack**
   - Backend technologies (framework, language, package manager, testing tools, linting/formatting)
   - Frontend technologies (framework, language, runtime, UI libraries, linting/formatting)
   - Include version numbers where relevant

3. **Architecture**
   - Backend structure (folder organization, layer patterns like service layer, testing structure)
   - Frontend structure (component organization, state management, routing if applicable)
   - Key architectural patterns used throughout

4. **Code Style**
   - Backend naming conventions (functions, classes, variables, model fields)
   - Frontend naming conventions (components, functions, types)
   - Include code examples showing the expected style
   - Docstring/comment formats required

5. **Logging**
   - Logging format and structure (structured logging preferred)
   - What to log (operations, errors, key events)
   - How to log (code examples for both backend and frontend)
   - Include examples with contextual fields

6. **Testing**
   - Testing framework and tools
   - Test file structure and naming conventions
   - Test patterns and examples
   - How to run tests

7. **API Contracts**
   - How backend models and frontend types must match
   - Error handling patterns across the boundary
   - Include examples showing the contract

8. **Common Patterns**
   - 2-3 code examples of common patterns used throughout the codebase
   - Backend service pattern example
   - Frontend component/API pattern example
   - These should be general templates, not task-specific

9. **Development Commands**
   - Backend: install, dev server, test, lint/format commands
   - Frontend: install, dev server, build, lint/format commands
   - Any other essential workflow commands

10. **Test User Standard**
    - Standard test user for Playwright validation and development testing
    - Credentials and seeding requirements
    - Use the following format:

    ```markdown
    ## Test User Standard

    All fullstack projects MUST have a seeded test user for Playwright validation:

    | Field | Value |
    |-------|-------|
    | Email | `test@example.com` |
    | Password | `TestPassword123!` |
    | Role | `admin` (highest permission level) |
    | User ID | `test-user-001` |

    ### Requirements:
    - Test user is seeded automatically in development/test environments
    - Test user credentials are NEVER used in production
    - Test user has access to all features (for comprehensive testing)
    - Password meets all validation requirements of the system

    ### Seeding:
    - Location: `[path to seed script]`
    - Command: `[command to seed test user]`
    ```

11. **Playwright Validation Workflow**
    - Device testing configuration
    - Validation step format specification
    - Test ID attribute conventions
    - Use the following template:

    ```markdown
    ## Playwright Validation Workflow

    This project uses Microsoft's Playwright MCP (`@playwright/mcp`) for automated frontend validation.

    ### Device Testing Configuration

    **Default Tier**: Tier 2 (Desktop + Mobile)

    | Device | Viewport | Usage |
    |--------|----------|-------|
    | Desktop | 1280×720 | All validation flows |
    | Mobile | 375×667 (iPhone SE) | All validation flows |
    | Tablet | 768×1024 | Tier 3 critical flows only |

    **Mobile Failures**: Blocking by default (override with `mobile_blocking: false` in plan)

    ### Dev Server Configuration

    - **URL**: `http://localhost:[PORT]`
    - **Start Command**: `[command to start dev server]`
    - **Health Check**: `[endpoint to verify server is running]`

    ### Test ID Convention

    Use `data-testid` attributes for critical interactive elements:

    ```tsx
    // ✅ Good - clear, semantic test IDs
    <button data-testid="task-submit-btn">Save Task</button>
    <input data-testid="task-title-input" />
    <div data-testid="task-list-container">...</div>

    // ❌ Bad - generic or missing test IDs
    <button>Save Task</button>
    <button data-testid="btn1">Save Task</button>
    ```

    **Naming Pattern**: `{feature}-{element}-{type}`
    - Examples: `task-submit-btn`, `user-email-input`, `nav-menu-toggle`

    ### Validation Step Format

    Every feature plan MUST include a `## Validation Steps` section using this format:

    ```markdown
    ## Validation Steps

    ### Environment
    - Base URL: http://localhost:[PORT]
    - Auth Required: yes/no
    - Test User: test@example.com (if auth required)

    ### Pre-conditions
    - [ ] Dev server running
    - [ ] User logged in as [role] (if applicable)
    - [ ] Starting route: /[route]
    - [ ] Required data: [any seeded data needed]

    ### Flow 1: [Flow Name] - Happy Path

    **User Outcome**: [What the user accomplishes]

    #### Desktop (1280×720)
    | Step | Action | Target | Constraints | Expected Outcome |
    |------|--------|--------|-------------|------------------|
    | 1 | NAVIGATE | /route | - | Page loads, heading "X" visible |
    | 2 | CLICK | button "Label" | in header | Modal/element appears |
    | 3 | TYPE | input "Field Name" | inside modal | Text entered |
    | 4 | CLICK | button "Submit" | type=submit | Success state |
    | 5 | VERIFY | element/list | - | Contains expected data |

    Screenshot: `flow1-desktop-complete.png`

    #### Mobile (375×667)
    | Step | Action | Target | Constraints | Expected Outcome |
    |------|--------|--------|-------------|------------------|
    | 1 | NAVIGATE | /route | - | Page loads |
    | 2 | CLICK | hamburger menu | - | Nav drawer opens |
    | ... | ... | ... | ... | ... |

    Screenshot: `flow1-mobile-complete.png`

    ### Flow 2: [Flow Name] - Error Handling

    **User Outcome**: [Error states handled gracefully]

    | Step | Action | Target | Constraints | Expected Outcome |
    |------|--------|--------|-------------|------------------|
    | 1 | NAVIGATE | /route | - | Form displayed |
    | 2 | CLICK | submit button | without filling required | Validation errors shown |
    | 3 | VERIFY | error message | - | "[Expected error]" visible |

    ### Console Validation
    - [ ] No errors in console during happy path
    - [ ] Expected warnings only: [list if applicable]

    ### Success Criteria
    - [ ] All flow steps complete within 30s timeout
    - [ ] No unexpected console errors
    - [ ] Screenshots captured at checkpoints
    - [ ] Data persists correctly (if applicable)
    ```

    ### Action Types Reference

    | Action | Usage | Example |
    |--------|-------|---------|
    | NAVIGATE | Go to route | `NAVIGATE: /dashboard` |
    | CLICK | Click element | `CLICK: button "Save"` |
    | TYPE | Enter text | `TYPE: input "Email"` |
    | FILL_FORM | Multiple fields | `FILL_FORM: [field list]` |
    | VERIFY | Assert state | `VERIFY: list contains "Item"` |
    | WAIT | Wait for state | `WAIT: loading spinner hidden` |
    | SCREENSHOT | Capture visual | `SCREENSHOT: checkout-complete.png` |

    ### Constraint Qualifiers

    Use constraints to disambiguate elements:
    - `in header` / `in footer` / `in modal` / `in sidebar`
    - `type=submit` / `type=button`
    - `inside [container]`
    - `first` / `last` / `nth(2)`
    - `data-testid="specific-id"` (when ambiguity exists)
    ```

12. **AI Coding Assistant Instructions**
    - 10 concise bullet points telling AI assistants how to work with this codebase
    - Include reminders about:
      - Consulting these rules and following conventions
      - Running linters and tests
      - Including validation steps in feature plans
      - Using data-testid for interactive elements
      - Following the test user standard

## Process to Follow:

### For Existing Projects:
1. **Analyze the codebase thoroughly:**
   - Read package.json, pyproject.toml, or equivalent config files
   - Examine folder structure
   - Review 3-5 representative files from different areas (models, services, components, etc.)
   - Identify patterns, conventions, and architectural decisions already in place
   - Check for existing test user setup
   - Identify dev server configuration
2. **Extract and document the existing conventions** following the structure above
3. **Be specific and use actual examples from the codebase**
4. **Add Playwright validation sections** even if not currently present (establish the standard)

### For New Projects:
1. **Ask me clarifying questions:**
   - What type of project is this? (web app, SaaS, dashboard, etc.)
   - What is the primary purpose/domain?
   - Any specific technology preferences or requirements?
   - What scale/complexity? (simple, medium, enterprise)
   - Will this have authentication? (to set up test user standard)
2. **After I answer, research best practices:**
   - Search for 2025 best practices for the chosen tech stack
   - Look up recommended project structures
   - Find modern conventions and tooling recommendations
   - Research Playwright testing patterns for the framework
3. **Create global rules based on research and best practices**

## Critical Requirements:

- **Length: 150-600 lines MAXIMUM** - The document MUST be less than 600 lines. Keep it concise and practical.
- **Be specific, not generic** - Use actual code examples, not placeholders
- **Focus on what matters** - Include conventions that truly guide development, not obvious statements
- **Keep it actionable** - Every rule should be clear enough that a developer (or AI) can follow it immediately
- **Use examples liberally** - Show, don't just tell
- **MUST include Playwright sections** - Sections 10 and 11 are mandatory for fullstack projects

## Output Format:

Create the CLAUDE.md with:
- Clear section headers (## 1. Section Name)
- Code blocks with proper syntax highlighting
- Concise explanations
- Real examples from the codebase (existing projects) or based on best practices (new projects)

Start by analyzing the project structure now. If this is a new project and you need more information, ask your clarifying questions first.
