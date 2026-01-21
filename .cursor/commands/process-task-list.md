---
description: Manages task lists in markdown files to track progress on completing a PRD. Integrates handoff creation for context preservation when pausing or completing milestones.
---

# Process Task List

## Overview

Guidelines for managing task lists in markdown files to track progress on completing a PRD. Integrates handoff creation for context preservation.

## Determining Project Commands

Before running tests, builds, or linting, determine the correct commands:

1. **Check Memory First**:
   - Use MCP memory tools to search for existing "Project Commands" or "Build Configuration" entity
   - If found and commands are stored, use those commands
   - If not found or incomplete, proceed to step 2

2. **Check for Makefile or Taskfile.yml**:
   - Look for `Makefile` or `Taskfile.yml` in the project root
   - Read the file to find test, build, and lint targets/commands
   - Extract the actual commands (e.g., `make test`, `task test`, or specific commands)

3. **If found, extract commands**:
   - Test command: Look for targets like `test`, `test:all`, `test-all`
   - Build command: Look for targets like `build`, `build:all`, `build-all`
   - Lint command: Look for targets like `lint`, `lint:all`, `lint-all`
   - Store these commands in memory using MCP memory tools

4. **If not found, ask the user**:
   - "I couldn't find a Makefile or Taskfile.yml. What commands should I use to run tests, build, and lint?"
   - Wait for user response
   - Store the user's response in memory using MCP memory tools

5. **Store in Memory Using MCP**:
   - Use `mcp_memory_create_entities` or `mcp_memory_add_observations` to store:
     - Entity name: "Project Commands" or use project name + " Build Configuration"
     - Entity type: "Build Configuration" or "Project Configuration"
     - Observations:
       - "Test command: [exact command]"
       - "Build command: [exact command]"
       - "Lint command: [exact command]"
       - "Source: Makefile" or "Source: Taskfile.yml" or "Source: User provided"
       - "Last verified: [current date]"

6. **Use stored commands**:
   - When commands are needed, first check memory using `mcp_memory_search_nodes` or `mcp_memory_open_nodes`
   - If not in memory, follow steps 2-5 above
   - Use the commands consistently throughout task execution

## Task Implementation
- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **Completion protocol:**
  1. When you finish a **sub‑task**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. If **all** subtasks underneath a parent task are now `[x]`, follow this sequence:
    - **First**: Determine project commands using the "Determining Project Commands" section above
    - **Then**: Run the full test suite using the determined test command
    - **Only if all tests pass**: Stage changes (`git add .`)
    - **Clean up**: Remove any temporary files and temporary code before committing
    - **Commit**: Use a descriptive commit message that:
      - Uses conventional commit format (`feat:`, `fix:`, `refactor:`, etc.)
      - Summarizes what was accomplished in the parent task
      - Lists key changes and additions
      - References the task number and PRD context
      - **Formats the message as a single-line command using `-m` flags**, e.g.:

        ```
        git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to task 1.0 in PRD"
        ```
    - **Create handoff** (optional but recommended after major milestones):
      - After committing a parent task, consider creating a handoff document
      - Use the **create-handoff** command to capture current state
      - Include the task list file path in the handoff's "Critical References"
      - Mark status as `in_progress` if more tasks remain, or `ready_for_review` if all tasks complete
  3. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.
- Stop after each sub‑task and wait for the user's go‑ahead.

## Handoff Integration

### When to Create Handoffs

Create handoff documents using the **create-handoff** command in these scenarios:

1. **After Completing Major Milestones**:
   - After completing a parent task and committing
   - When reaching a natural stopping point (e.g., completing a phase)
   - Include task list progress in the handoff

2. **When Pausing Work**:
   - User requests to pause or stop
   - Before ending a session
   - When switching to a different task/feature

3. **When Blocked or Encountering Issues**:
   - When blocked on a dependency or decision
   - When encountering unexpected complexity
   - Status should be `blocked` in the handoff

4. **Before Major Refactoring**:
   - Before making significant architectural changes
   - When about to modify critical systems
   - Capture current state for rollback reference

### Handoff Content for Task Lists

When creating a handoff while working on a task list, include:

```markdown
## Task(s)
- [Current task number and description] - [status: completed | in_progress | blocked]
- [Next task number and description] - [status: planned]

## Critical References
- `tasks/tasks-[prd-name].md` - Current task list being worked on
- `tasks/prd-[feature-name].md` - Related PRD document
- [Any other critical files]

## Recent Changes
[Recent file changes in file:line format from the current task]

## Learnings
- [Patterns discovered during implementation]
- [Important codebase insights]
- [File paths where patterns were found]

## Artifacts
- [List of files created/modified in current task]
- `tasks/tasks-[prd-name].md` - Updated task list

## Action Items & Next Steps
- Continue with task [X.Y] - [description]
- [Any blockers that need resolution]
- [Next steps from task list]
```

### Resuming from Handoff

When resuming work from a handoff that references a task list:

1. **Use the `resume-handoff` command first**:
   - If a handoff path is provided, use: `/resume-handoff docs/handoffs/YYYY-MM-DD_HH-MM-SS_description.md`
   - The `resume-handoff` command will:
     - Read the handoff document completely
     - Read the task list file referenced in "Critical References"
     - Verify current state against handoff (check if changes still exist)
     - Validate learnings and patterns are still applicable
     - Read all referenced documents (PRDs, research docs, artifacts)
     - Present comprehensive analysis of current state
     - Propose next steps based on handoff's action items

2. **After `resume-handoff` analysis**:
   - Review the analysis and recommendations
   - Confirm the approach with the user
   - The `resume-handoff` command will create a TodoWrite task list from action items
   - Then continue with `process-task-list` to work on the task list

3. **Continue with task list protocol**:
   - Read the task list file (already done by `resume-handoff`)
   - Identify the next task from the task list
   - Verify the task list matches the handoff's status
   - Continue from where you left off following the task list protocol
   - Update the task list as you progress

**Workflow when resuming:**
```
User: /resume-handoff docs/handoffs/2025-01-20_15-30-00_feature-implementation.md
→ resume-handoff analyzes handoff, verifies state, proposes next steps
→ User confirms approach
→ Continue with process-task-list to work on the task list
→ Follow normal task list protocol
```

**If handoff is not available or user wants to work directly on task list:**
- Read the task list file directly
- Check git status to understand current state
- Identify the next uncompleted task
- Continue following the task list protocol

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.
   - Note any blockers or issues discovered.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.
   - Update this section after each sub-task completion.

3. **Link to Handoffs** (optional):
   - Add a "Handoffs" section to track handoff documents created during implementation
   - Example:
     ```markdown
     ## Handoffs
     - `docs/handoffs/2025-01-20_15-30-00_feature-implementation.md` - After completing task 2.0
     ```

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
   - Create handoff after major milestones (optional but recommended).
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.
7. **When pausing or user requests handoff**:
   - Immediately create a handoff using the **create-handoff** command
   - Include current task list progress
   - Reference the task list file in handoff's "Critical References"
   - Provide the handoff path to the user
8. **When resuming from a handoff**:
   - If user provides a handoff path, use the **resume-handoff** command first
   - After `resume-handoff` completes its analysis, continue with task list work
   - Verify task list status matches handoff before proceeding

## Integration with Other Commands

- **resume-handoff**: **Use this first** when resuming work from a handoff that references a task list. It will analyze the handoff, verify current state, and prepare you to continue with the task list.
- **create-handoff**: Use to create handoff documents at appropriate points (after milestones, when pausing, etc.)
- **create-prd**: The PRD that the task list is implementing
- **generate-tasks**: The command that created the task list
- **validate-plan**: Can validate task list completion and implementation status

## Example Workflows

### Starting Fresh with a Task List

1. Read the task list file
2. Identify the first uncompleted task (e.g., task 1.1)
3. Start working on task 1.1
4. Complete task 1.1, mark as `[x]`, update task list
5. Wait for user approval
6. Continue with task 1.2
7. Complete all subtasks under task 1.0
8. Run tests, commit changes
9. **Create handoff** (optional) - capture milestone
10. Mark task 1.0 as `[x]`
11. Continue with next parent task

### Resuming from a Handoff

1. User invokes: `/resume-handoff docs/handoffs/2025-01-20_15-30-00_feature-implementation.md`
2. `resume-handoff` command:
   - Reads handoff document
   - Reads task list from "Critical References"
   - Verifies current state (checks if changes still exist)
   - Validates learnings are still applicable
   - Presents analysis and recommendations
3. User confirms approach
4. `resume-handoff` creates TodoWrite task list from action items
5. Continue with `process-task-list`:
   - Read the task list file (already analyzed)
   - Identify next task from handoff's "Action Items & Next Steps"
   - Verify task list status matches handoff
   - Continue following task list protocol
6. Update task list as you progress
7. Create new handoff when pausing or completing milestones
