---
description: Validate implementation against plan (PRD or task list), verify success criteria, identify issues, and check if completed tasks are actually implemented.
---

# Validate Plan

## Overview

Validate that an implementation plan (PRD or task list) was correctly executed, verifying all success criteria and identifying any deviations or issues.

## Initial Setup

When invoked:

1. **Determine context** - Are you in an existing conversation or starting fresh?
   - If existing: Review what was implemented in this session
   - If fresh: Need to discover what was done through git and codebase analysis

2. **Locate the plan**:
   - If plan path provided (PRD or task list), use it
   - Otherwise, search recent commits for plan references or ask user
   - Plans can be:
     - PRD documents in `tasks/prd-*.md` or `tasks/*.md`
     - Task lists in `tasks/tasks-*.md` or `tasks/*.md`
     - Handoff documents in `docs/handoffs/*.md` (which reference plans)

3. **Gather implementation evidence**:
   ```bash
   # Check recent commits
   git log --oneline -n 20
   git diff HEAD~N..HEAD  # Where N covers implementation commits

   # Run comprehensive checks
   # First, determine project commands (see "Determining Project Commands" section below)
   # Then run: [test command], [build command], [lint command]
   ```

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
   - Use the commands consistently throughout validation

## Validation Process

### Step 1: Context Discovery

If starting fresh or need more context:

1. **Read the implementation plan completely**:
   - If it's a PRD: Read all sections (Overview, Requirements, Technical Considerations, etc.)
   - If it's a task list: Read all tasks and their completion status
   - If it's a handoff: Read it and locate the referenced plan documents

2. **Identify what should have changed**:
   - List all files that should be modified (from plan or task list)
   - Note all success criteria (automated and manual)
   - Identify key functionality to verify
   - Extract all tasks marked as completed (`[x]`)

3. **Spawn parallel research tasks** to discover implementation:
   ```
   Task 1 - Verify code changes:
   Find all modified files related to [feature/plan].
   Compare actual changes to plan specifications.
   Check git diff for changes matching plan requirements.
   Return: File-by-file comparison of planned vs actual

   Task 2 - Verify test coverage:
   Check if tests were added/modified as specified.
   Run test commands and capture results.
   Verify test files exist and cover planned functionality.
   Return: Test status and any missing coverage

   Task 3 - Verify task completion:
   For each task marked [x] in the task list:
   - Verify the code changes actually implement the task
   - Check if all subtasks are truly complete
   - Verify no partial implementations
   Return: Status of each completed task (verified/partial/missing)
   ```

### Step 2: Systematic Validation

For each phase/task in the plan:

1. **Check completion status**:
   - Look for checkmarks in task lists (`[x]`)
   - Verify the actual code matches claimed completion
   - Check if parent tasks are marked complete only when all subtasks are done

2. **Run automated verification**:
   - First, determine project commands using the "Determining Project Commands" section above
   - Execute each command from plan's verification section
   - Run standard checks using the commands from memory or Makefile/Taskfile:
     - Run test command (from memory/Makefile/Taskfile) - All tests pass
     - Run build command (from memory/Makefile/Taskfile) - Build succeeds
     - Run lint command (from memory/Makefile/Taskfile) - No linting errors
   - Document pass/fail status
   - If failures, investigate root cause

3. **Verify code changes**:
   - Check that files mentioned in plan were actually modified
   - Verify code matches specifications
   - Check for deviations (improvements vs issues)
   - Use codebase-analyzer if needed to understand implementation

4. **Assess manual criteria**:
   - List what needs manual testing
   - Provide clear steps for user verification
   - Reference specific UI components or API endpoints

5. **Think deeply about edge cases**:
   - Were error conditions handled?
   - Are there missing validations?
   - Could the implementation break existing functionality?
   - Are there security considerations?

### Step 3: Generate Validation Report

Create comprehensive validation summary:

```markdown
## Validation Report: [Plan/PRD Name]

**Date**: [Current date]
**Plan Document**: `path/to/plan.md`
**Git Commit**: [Current commit hash]
**Branch**: [Current branch]

### Implementation Status

#### Tasks/Phases:
✓ Task 1: [Name] - Fully implemented
✓ Task 2: [Name] - Fully implemented
⚠️ Task 3: [Name] - Partially implemented (see issues)
✗ Task 4: [Name] - Not implemented (marked complete but missing)

### Automated Verification Results

✓ Build passes: [determined build command from Makefile/Taskfile/memory]
✓ Tests pass: [determined test command from Makefile/Taskfile/memory] (X tests, Y passed)
⚠️ Linting: [determined lint command from Makefile/Taskfile/memory] (Z warnings, A errors)

**Test Coverage**:
- Unit tests: [Status]
- Integration tests: [Status]
- E2E tests: [Status]

### Code Review Findings

#### Matches Plan:
- [Feature/Change 1] correctly implemented in `file.ext:line`
- [Feature/Change 2] follows plan specifications
- Error handling follows plan

#### Deviations from Plan:
- Used different approach in `file.ext:line` (improvement/issue)
- Added extra validation in `file.ext:line` (improvement)
- Missing [requirement] specified in plan

#### Potential Issues:
- [Issue 1]: Description and impact
- [Issue 2]: Description and impact
- Missing error handling in `file.ext:line`

### Task-by-Task Verification

#### Task 1: [Task Name]
- Status: ✓ Verified complete
- Files changed: `file1.ext`, `file2.ext`
- Tests: ✓ Added/Updated
- Matches plan: ✓ Yes

#### Task 2: [Task Name]
- Status: ⚠️ Partially complete
- Files changed: `file1.ext` (missing `file2.ext`)
- Tests: ⚠️ Missing test file
- Matches plan: ⚠️ Missing [requirement]

### Manual Testing Required:

1. **UI Functionality**:
   - [ ] Verify [feature] appears correctly at `/route`
   - [ ] Test error states with invalid input
   - [ ] Check responsive design

2. **API/Integration**:
   - [ ] Confirm works with existing [component]
   - [ ] Test with [specific scenario]
   - [ ] Verify error responses

3. **Edge Cases**:
   - [ ] Test with [edge case 1]
   - [ ] Test with [edge case 2]

### Recommendations:

- **Before Merge**:
  - Address linting warnings/errors
  - Add missing tests for [component/feature]
  - Fix [issue] in `file.ext:line`

- **Improvements**:
  - Consider adding integration test for [scenario]
  - Document new API endpoints
  - Add error handling for [case]

- **Follow-up**:
  - [Action item 1]
  - [Action item 2]

### Summary

[Overall assessment: Ready for review / Needs work / Blocked]
[Key achievements]
[Critical issues to address]
```

## Working with Existing Context

If you were part of the implementation:
- Review the conversation history
- Check your todo list for what was completed
- Focus validation on work done in this session
- Be honest about any shortcuts or incomplete items
- Reference files you modified during implementation

## Important Guidelines

1. **Be thorough but practical**:
   - Focus on what matters for the plan
   - Don't nitpick style unless it violates standards
   - Prioritize functional correctness

2. **Run all automated checks**:
   - Don't skip verification commands
   - Document all results (pass/fail/warnings)
   - Investigate failures thoroughly

3. **Document everything**:
   - Both successes and issues
   - Include file:line references
   - Provide actionable recommendations

4. **Think critically**:
   - Question if the implementation truly solves the problem
   - Check if it follows existing patterns
   - Verify it doesn't break existing functionality

5. **Consider maintenance**:
   - Will this be maintainable long-term?
   - Are there missing tests?
   - Is documentation needed?

6. **Verify task completion honestly**:
   - Don't assume tasks marked `[x]` are complete
   - Check actual code changes
   - Verify all subtasks are done before parent task

## Validation Checklist

Always verify:
- [ ] All tasks marked `[x]` are actually implemented
- [ ] All subtasks complete before parent task marked complete
- [ ] Project commands determined (from Makefile/Taskfile or user)
- [ ] Project commands stored in memory
- [ ] Automated tests pass (using determined test command)
- [ ] Build succeeds (using determined build command)
- [ ] No linting errors (using determined lint command)
- [ ] Code follows existing patterns
- [ ] No regressions introduced
- [ ] Error handling is robust
- [ ] Documentation updated if needed
- [ ] Manual test steps are clear
- [ ] Files mentioned in plan were modified
- [ ] Requirements from PRD are met

## Integration with Other Commands

- **process-task-list**: Validates task lists created by this command
- **create-prd**: Validates implementations against PRDs
- **create-handoff**: Can validate work described in handoffs
- **research-codebase**: Can be used to understand current implementation
- **codebase-analyzer**: Can verify implementation details
- **create-pr**: Validation report can inform PR description

## Common Validation Scenarios

### Scenario 1: All Tasks Complete
- All tasks marked `[x]` are verified
- All tests pass
- Code matches plan
- Ready for review/merge

### Scenario 2: Partial Implementation
- Some tasks marked complete but not implemented
- Missing tests or incomplete features
- Need to update task list or complete work

### Scenario 3: Code Divergence
- Implementation differs from plan (better or worse)
- Need to document deviations
- May need plan update or code changes

### Scenario 4: Missing Tests
- Functionality implemented but tests missing
- Need to add test coverage
- May indicate incomplete understanding

### Scenario 5: Regressions
- New code breaks existing functionality
- Tests failing that previously passed
- Need to fix before proceeding

## Example Validation Flow

```
User: /validate-plan tasks/tasks-feature-x.md
Assistant: Let me validate the implementation against the task list...

[Reads task list]
[Checks git history]
[Spawns verification tasks]
[Waits for completion]
[Runs determined test, build, and lint commands from Makefile/Taskfile/memory]

## Validation Report: Feature X Implementation

### Implementation Status
✓ Task 1: Setup - Fully implemented
✓ Task 2: API endpoints - Fully implemented
⚠️ Task 3: Tests - Partially implemented (missing integration tests)

### Automated Verification Results
✓ Build passes: [determined build command] (e.g., `make build` or `task build`)
✓ Tests pass: [determined test command] (e.g., `make test` or `task test`) (45 tests, 45 passed)
⚠️ Linting: [determined lint command] (e.g., `make lint` or `task lint`) (2 warnings)

### Code Review Findings
...
```

## File Locations

- **PRDs**: `tasks/prd-*.md` or `tasks/*.md`
- **Task Lists**: `tasks/tasks-*.md` or `tasks/*.md`
- **Handoffs**: `docs/handoffs/*.md` (may reference plans)

## Output Format

- **Report**: Markdown document (can be saved to `docs/validation/` if requested)
- **Interactive**: Presented to user with clear status indicators
- **Actionable**: Includes specific recommendations with file:line references

Remember: Good validation catches issues before they reach production. Be constructive but thorough in identifying gaps or improvements. The goal is to ensure the implementation truly matches the plan and is ready for the next step.
