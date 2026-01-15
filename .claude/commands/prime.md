---
description: Prime agent with codebase understanding
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of the codebase by analyzing structure, documentation, and key files.

## Process

### 1. Analyze Project Structure

Use the Glob and Read tools to explore the project structure. Run a directory listing command like:

```bash
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" 2>/dev/null | grep -v node_modules | grep -v .next | head -50
```

Or if tree is available:

```bash
tree -L 3 -I 'node_modules|__pycache__|.git|dist|build|.next|coverage' 2>/dev/null || echo "tree not available"
```

### 2. Read Core Documentation

- Read CLAUDE.md or similar global rules file
- Read .agents/PRD.md if it exists
- Read README files at project root and major directories
- Read any architecture documentation

### 3. Identify Key Files

Based on the structure, identify and read:
- Main entry points (main.py, index.ts, app.py, src/app/page.tsx, etc.)
- Core configuration files (pyproject.toml, package.json, tsconfig.json)
- Key model/schema definitions
- Important service or controller files

### 4. Understand Current State

Check if this is a git repository and get status:

```bash
git rev-parse --is-inside-work-tree 2>/dev/null && git log -10 --oneline && git status || echo "Not a git repository"
```

## Output Report

Provide a concise summary covering:

### Project Overview
- Purpose and type of application
- Primary technologies and frameworks
- Current version/state

### Architecture
- Overall structure and organization
- Key architectural patterns identified
- Important directories and their purposes

### Tech Stack
- Languages and versions
- Frameworks and major libraries
- Build tools and package managers
- Testing frameworks

### Core Principles
- Code style and conventions observed
- Documentation standards
- Testing approach

### Current State
- Active branch (if git repo)
- Recent changes or development focus
- Any immediate observations or concerns

**Make this summary easy to scan - use bullet points and clear headers.**
