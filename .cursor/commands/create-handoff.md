---
description: Creates a handoff document for transferring work context to another session. Use this when you need to pause work and want to capture the current state for resumption later.
---

# Create Handoff

## Overview

Create a comprehensive handoff document to transfer work context between sessions. This document captures the current state, learnings, and next steps to enable seamless continuation of work.

## Steps

### 1. Filepath & Metadata

Create your file under `docs/handoffs/YYYY-MM-DD_HH-MM-SS_description.md`, where:
- YYYY-MM-DD is today's date
- HH-MM-SS is the current time in 24-hour format
- description is a brief kebab-case description

Examples:
- `docs/handoffs/2025-01-08_13-55-22_auth-implementation.md`
- `docs/handoffs/2025-01-08_13-55-22_todo-feature-refactor.md`

### 2. Gather Context

Before writing, collect:
- Current git branch: `git branch --show-current`
- Current commit: `git rev-parse HEAD`
- Recent changes: `git diff --stat`
- Modified files: `git status`

### 3. Write Handoff Document

Use the following template structure:

```markdown
---
date: [Current date and time with timezone in ISO format]
git_commit: [Current commit hash]
branch: [Current branch name]
topic: "[Feature/Task Name] Implementation"
status: [in_progress | blocked | ready_for_review]
---

# Handoff: [Concise description]

## Task(s)
[Description of the task(s) you were working on, along with the status of each:
- completed
- work in progress
- planned/discussed

If working on an implementation plan, note which phase you are on.]

## Critical References
[List any critical specification documents, architectural decisions, or design docs that must be followed. Include only 2-3 most important file paths. Leave blank if none.]

## Recent Changes
[Describe recent changes made to the codebase in file:line syntax]
- `path/to/file.ext:45-67` - Added pagination logic
- `path/to/another/file.ext:12` - Updated interface

## Learnings
[Describe important things you learned:
- Patterns discovered
- Root causes of bugs
- Other important pieces of information
Consider listing explicit file paths.]

## Artifacts
[Exhaustive list of artifacts you produced or updated as filepaths and/or file:line references]

## Action Items & Next Steps
[List of action items and next steps for the next session to accomplish]

## Other Notes
[Other notes, references, or useful information that don't fall into the above categories]
```

### 4. Save and Confirm

After writing the document:
- Create the handoffs directory if it doesn't exist: `mkdir -p docs/handoffs`
- Save the file
- Confirm the handoff was created and provide the path

## Response Template

After creating the handoff, respond with:

```
Handoff created! You can resume from this handoff in a new session by referencing:

docs/handoffs/[your-handoff-filename].md
```

## Guidelines

- **More information, not less**: This template defines the minimum of what a handoff should be. Include more information if necessary.
- **Be thorough and precise**: Include both top-level objectives and lower-level details as necessary.
- **Avoid excessive code snippets**: While a brief snippet to describe a key change is important, avoid large code blocks. Prefer using `path/to/file.ext:line` references that can be followed later.
- **Create the handoffs directory if it doesn't exist**: Use `mkdir -p docs/handoffs` before writing.
