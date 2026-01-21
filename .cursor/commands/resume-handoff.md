---
description: Resume work from handoff document with context analysis and validation. Reads handoff documents, verifies current state, and proposes next steps for continuing work.
---

# Resume Handoff

## Overview

Resume work from a handoff document through an interactive process. These handoffs contain critical context, learnings, and next steps from previous work sessions that need to be understood and continued.

## Initial Response

When this command is invoked:

1. **If the path to a handoff document was provided**:
   - If a handoff document path was provided as a parameter, skip the default message
   - Immediately read the handoff document FULLY
   - Immediately read any research or plan documents that it links to under `docs/research` or `tasks/`. Do NOT use a sub-agent to read these critical files.
   - Begin the analysis process by ingesting relevant context from the handoff document, reading additional files it mentions
   - Then propose a course of action to the user and confirm, or ask for clarification on direction.

2. **If a ticket number or task identifier was provided**:
   - Locate handoff documents related to the ticket/task. Handoffs are stored in `docs/handoffs/` with filenames that may include ticket numbers or task identifiers.
   - **List the `docs/handoffs/` directory contents** to find relevant handoffs.
   - There may be zero, one or multiple files in the directory.
   - **If there are zero files in the directory, or no matching files**: tell the user: "I'm sorry, I can't seem to find that handoff document. Can you please provide me with a path to it?"
   - **If there is only one matching file**: proceed with that handoff
   - **If there are multiple matching files**: using the date and time specified in the file name (it will be in the format `YYYY-MM-DD_HH-MM-SS` in 24-hour time format), proceed with the _most recent_ handoff document.
   - Immediately read the handoff document FULLY
   - Immediately read any research or plan documents that it links to under `docs/research` or `tasks/`; do NOT use a sub-agent to read these critical files.
   - Begin the analysis process by ingesting relevant context from the handoff document, reading additional files it mentions
   - Then propose a course of action to the user and confirm, or ask for clarification on direction.

3. **If no parameters provided**, respond with:
```
I'll help you resume work from a handoff document. Let me find the available handoffs.

Which handoff would you like to resume from?

Tip: You can invoke this command directly with a handoff path: `/resume-handoff docs/handoffs/YYYY-MM-DD_HH-MM-SS_description.md`

or using a task identifier to find the most recent handoff for that task.
```

Then wait for the user's input.

## Steps

### Step 1: Read and Analyze Handoff

1. **Read handoff document completely**:
   - Use the Read tool WITHOUT limit/offset parameters
   - Extract all sections:
     - Task(s) and their statuses
     - Critical References
     - Recent Changes
     - Learnings
     - Artifacts
     - Action Items and Next Steps
     - Other Notes

2. **Read referenced documents**:
   - Read all files mentioned in "Critical References" section
   - Read any research documents referenced (from `docs/research/`)
   - Read any PRD or task list documents referenced (from `tasks/`)
   - Read files mentioned in "Artifacts" section
   - Read files mentioned in "Recent Changes" section

3. **Spawn focused research tasks** (if needed):
   Based on the handoff content, spawn parallel research tasks to verify current state:

   ```
   Task 1 - Verify recent changes:
   Check if all changes mentioned in "Recent Changes" still exist in the codebase.
   1. Verify each file:line reference from "Recent Changes"
   2. Check if modifications are still present
   3. Note any conflicts or regressions
   Use tools: Read, grep
   Return: Status of each change (present/missing/modified)
   ```

   ```
   Task 2 - Gather artifact context:
   Read all artifacts mentioned in the handoff.
   1. Read feature documents listed in "Artifacts"
   2. Read implementation plans referenced
   3. Read any research documents mentioned
   4. Extract key requirements and decisions
   Use tools: Read
   Return: Summary of artifact contents and key decisions
   ```

   ```
   Task 3 - Verify learnings:
   Check if patterns and learnings from handoff are still applicable.
   1. Read files mentioned in "Learnings" section
   2. Verify patterns are still present
   3. Check for any changes that invalidate learnings
   Use tools: Read, codebase-pattern-finder
   Return: Status of learnings (still valid/changed/invalidated)
   ```

4. **Wait for ALL sub-tasks to complete** before proceeding

5. **Read critical files identified**:
   - Read files from "Learnings" section completely
   - Read files from "Recent Changes" to understand modifications
   - Read any new related files discovered during research

### Step 2: Synthesize and Present Analysis

1. **Present comprehensive analysis**:
   ```
   I've analyzed the handoff from [date]. Here's the current situation:

   **Original Tasks:**
   - [Task 1]: [Status from handoff] → [Current verification]
   - [Task 2]: [Status from handoff] → [Current verification]

   **Key Learnings Validated:**
   - [Learning with file:line reference] - [Still valid/Changed]
   - [Pattern discovered] - [Still applicable/Modified]

   **Recent Changes Status:**
   - [Change 1] - [Verified present/Missing/Modified]
   - [Change 2] - [Verified present/Missing/Modified]

   **Artifacts Reviewed:**
   - [Document 1]: [Key takeaway]
   - [Document 2]: [Key takeaway]

   **Critical References Checked:**
   - [Reference 1]: [Status and key points]
   - [Reference 2]: [Status and key points]

   **Recommended Next Actions:**
   Based on the handoff's action items and current state:
   1. [Most logical next step based on handoff]
   2. [Second priority action]
   3. [Additional tasks discovered]

   **Potential Issues Identified:**
   - [Any conflicts or regressions found]
   - [Missing dependencies or broken code]
   - [Changes that invalidate previous assumptions]

   Shall I proceed with [recommended action 1], or would you like to adjust the approach?
   ```

2. **Get confirmation** before proceeding

### Step 3: Create Action Plan

1. **Use TodoWrite to create task list**:
   - Convert action items from handoff into todos
   - Add any new tasks discovered during analysis
   - Prioritize based on dependencies and handoff guidance
   - Mark tasks as "in_progress" or "pending" based on handoff status

2. **Present the plan**:
   ```
   I've created a task list based on the handoff and current analysis:

   [Show todo list]

   Ready to begin with the first task: [task description]?
   ```

### Step 4: Begin Implementation

1. **Start with the first approved task**
2. **Reference learnings from handoff** throughout implementation
3. **Apply patterns and approaches documented** in the handoff
4. **Update progress** as tasks are completed
5. **Consider creating a new handoff** when reaching a milestone or pausing work

## Guidelines

1. **Be Thorough in Analysis**:
   - Read the entire handoff document first
   - Read all referenced documents (Critical References, Artifacts, Research docs)
   - Verify ALL mentioned changes still exist
   - Check for any regressions or conflicts
   - Read all referenced artifacts

2. **Be Interactive**:
   - Present findings before starting work
   - Get buy-in on the approach
   - Allow for course corrections
   - Adapt based on current state vs handoff state

3. **Leverage Handoff Wisdom**:
   - Pay special attention to "Learnings" section
   - Apply documented patterns and approaches
   - Avoid repeating mistakes mentioned
   - Build on discovered solutions
   - Reference "Critical References" when implementing

4. **Track Continuity**:
   - Use TodoWrite to maintain task continuity
   - Reference the handoff document in commits
   - Document any deviations from original plan
   - Consider creating a new handoff when done (using create-handoff command)

5. **Validate Before Acting**:
   - Never assume handoff state matches current state
   - Verify all file references still exist
   - Check for breaking changes since handoff
   - Confirm patterns are still valid
   - Verify git branch and commit status

6. **Handle Missing Context**:
   - If referenced files don't exist, note this clearly
   - If patterns have changed, document the differences
   - If the codebase has diverged significantly, propose a re-evaluation

## Common Scenarios

### Scenario 1: Clean Continuation
- All changes from handoff are present
- No conflicts or regressions
- Clear next steps in action items
- All referenced documents exist
- Proceed with recommended actions

### Scenario 2: Diverged Codebase
- Some changes missing or modified
- New related code added since handoff
- Need to reconcile differences
- Adapt plan based on current state
- May need to re-apply some changes

### Scenario 3: Incomplete Handoff Work
- Tasks marked as "in_progress" in handoff
- Need to complete unfinished work first
- May need to re-understand partial implementations
- Focus on completing before new work
- Verify partial implementations are still valid

### Scenario 4: Stale Handoff
- Significant time has passed
- Major refactoring has occurred
- Original approach may no longer apply
- Need to re-evaluate strategy
- Consider using research-codebase command to understand current state

### Scenario 5: Missing References
- Referenced files or documents don't exist
- Patterns have changed significantly
- Need to find alternative approaches
- Document what's missing and propose alternatives

## Integration with Other Commands

- **create-handoff**: Creates handoff documents that this command resumes from
- **research-codebase**: Can be used to understand current state if handoff is stale
- **codebase-analyzer**: Can verify learnings and patterns from handoff
- **process-task-list**: Can convert handoff action items into structured task lists
- **create-prd**: May need to reference or update PRDs mentioned in handoff

## Example Interaction Flow

```
User: /resume-handoff docs/handoffs/2025-01-20_14-30-00_auth-implementation.md
Assistant: Let me read and analyze that handoff document...

[Reads handoff completely]
[Reads referenced documents]
[Spawns verification tasks if needed]
[Waits for completion]
[Reads identified files]

I've analyzed the handoff from 2025-01-20. Here's the current situation...

**Original Tasks:**
- Implement JWT authentication: in_progress → Verified: Partially complete
- Add password hashing: completed → Verified: Present in codebase

**Key Learnings Validated:**
- [Pattern name] in `path/to/file.ext:45` - Still valid
- [Configuration pattern] - Still applicable

**Recent Changes Status:**
- `path/to/file.ext:45-67` - Verified present
- `path/to/another/file.ext:12` - Verified present

**Artifacts Reviewed:**
- `docs/test/MANUAL_AUTH_TESTING.md`: Auth testing procedures documented
- `tasks/tasks-full_stack_developmen_series_part_8.md`: Related task list

**Recommended Next Actions:**
Based on the handoff's action items and current state:
1. Complete JWT token refresh implementation
2. Add integration tests for auth flow
3. Update API documentation

**Potential Issues Identified:**
- None identified - codebase matches handoff state

Shall I proceed with implementing the JWT token refresh, or would you like to adjust the approach?

User: Yes, proceed with the JWT token refresh
Assistant: [Creates todo list and begins implementation]
```

## File Locations

- **Handoffs**: `docs/handoffs/YYYY-MM-DD_HH-MM-SS_description.md`
- **Research Documents**: `docs/research/YYYY-MM-DD-description.md`
- **PRDs and Task Lists**: `tasks/*.md`
- **Documentation**: `docs/**/*.md`

## Output Format

- **Analysis**: Presented interactively to user
- **Task List**: Created using TodoWrite
- **Verification Results**: Included in analysis presentation
- **Next Steps**: Proposed based on handoff and current state

Remember: You are resuming work from a previous session. Your job is to understand the context, verify the current state, and continue the work seamlessly while building on previous learnings and avoiding past mistakes.
