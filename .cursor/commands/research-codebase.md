---
description: Research codebase comprehensively using parallel sub-agents and existing research commands. Synthesizes findings from codebase analysis, documentation, and external research to answer questions thoroughly.
---

# Research Codebase

## Overview

Conduct comprehensive research across the codebase to answer user questions by leveraging parallel research commands and synthesizing their findings.

## Initial Setup

When this command is invoked, respond with:
```
I'm ready to research the codebase. Please provide your research question or area of interest, and I'll analyze it thoroughly by exploring relevant components and connections using all available research tools.
```

Then wait for the user's research query.

## Steps

### Step 1: Read Any Directly Mentioned Files First

1. **Read all mentioned files immediately and FULLY**:
   - If the user mentions specific files (PRDs, task files, docs, JSON, code files), read them FULLY first
   - **IMPORTANT**: Use the Read tool WITHOUT limit/offset parameters to read entire files
   - **CRITICAL**: Read these files yourself in the main context before spawning any sub-tasks
   - This ensures you have full context before decomposing the research

### Step 2: Analyze and Decompose the Research Question

1. **Break down the user's query** into composable research areas:
   - Identify specific components, patterns, or concepts to investigate
   - Consider which directories, files, or architectural patterns are relevant
   - Think about what type of information is needed (implementation details, patterns, documentation, external resources)

2. **Create a research plan** using TodoWrite to track all research subtasks

3. **Determine which research commands to use**:
   - **codebase-locator**: To find files related to the topic
   - **codebase-analyzer**: To understand how components work
   - **codebase-pattern-finder**: To find similar implementations
   - **docs-locator**: To find relevant documentation
   - **docs-analyzer**: To extract insights from documentation
   - **web-search-researcher**: For external libraries/frameworks (if needed)

### Step 3: Spawn Parallel Research Tasks

**Phase 1: Discovery (Run in parallel)**
- Use **codebase-locator** to find all files related to the research topic
  - Example: "Find all files related to authentication including components, services, tests, and configuration"
- Use **docs-locator** to find relevant documentation
  - Example: "Find documentation about authentication patterns or similar features"
- Use **codebase-pattern-finder** to find similar implementations
  - Example: "Find similar implementations of authentication with code examples"

**Phase 2: Deep Analysis (After Phase 1 completes)**
- Use **codebase-analyzer** to understand how components work
  - Example: "Analyze how the authentication system works, including data flow and key functions"
  - **IMPORTANT**: Read the files identified by codebase-locator first, then analyze
- Use **docs-analyzer** to extract insights from documentation found by docs-locator
  - Example: "Extract key decisions, constraints, and patterns from authentication documentation"
  - Only analyze documents that are directly relevant

**Phase 3: External Research (If needed)**
- Use **web-search-researcher** for external libraries/frameworks
  - Example: "Research latest [framework/library] authentication patterns" or "Find [library] best practices"
  - Only use when external dependencies are involved
  - Leverage Context7 MCP when available (per context7-usage rule)

**Key Principles:**
- Start with locator commands to find what exists
- Then use analyzer commands on the most promising findings
- Run multiple commands in parallel when they're searching for different things
- Each command knows its job - provide focused prompts about WHAT to find, not HOW to search
- Don't write detailed prompts about HOW to search - the commands already know

### Step 4: Wait for All Research to Complete and Synthesize Findings

1. **IMPORTANT**: Wait for ALL research tasks to complete before proceeding

2. **Read all files identified by research tasks**:
   - After research tasks complete, read ALL files they identified as relevant
   - Read them FULLY into the main context
   - Prioritize files mentioned by multiple research commands

3. **Compile and synthesize all findings**:
   - Compile all research results (codebase findings, documentation insights, external research)
   - Prioritize live codebase findings as primary source of truth
   - Use documentation findings as supplementary context
   - Connect findings across different components
   - Include specific file paths and line numbers for reference
   - Highlight patterns, connections, and architectural decisions
   - Answer the user's specific questions with concrete evidence

4. **Cross-reference findings**:
   - Verify findings against actual code
   - Note any discrepancies or conflicting information
   - Identify patterns that emerge from multiple sources

### Step 5: Generate Research Document

1. **Determine document location and filename**:
   - Location: `docs/research/` (create directory if it doesn't exist)
   - Filename: `YYYY-MM-DD-[description].md` where:
     - YYYY-MM-DD is today's date
     - description is a brief kebab-case description of the research topic
   - Examples:
     - `2025-01-20-authentication-flow.md`
     - `2025-01-20-todo-crud-patterns.md`
     - `2025-01-20-user-management-system.md`

2. **Gather metadata**:
   - Current date and time with timezone (ISO format)
   - Current git commit: `git rev-parse HEAD`
   - Current branch: `git branch --show-current`
   - Repository name

3. **Write the research document** using this structure:

```markdown
---
date: [Current date and time with timezone in ISO format]
git_commit: [Current commit hash]
branch: [Current branch name]
repository: [Repository name]
topic: "[User's Question/Topic]"
tags: [research, codebase, relevant-component-names]
status: complete
last_updated: [Current date in YYYY-MM-DD format]
---

# Research: [User's Question/Topic]

**Date**: [Current date and time with timezone]
**Git Commit**: [Current commit hash]
**Branch**: [Current branch name]
**Repository**: [Repository name]

## Research Question
[Original user query]

## Summary
[High-level findings answering the user's question in 2-3 paragraphs]

## Detailed Findings

### [Component/Area 1]
**Source**: [Which research command found this - codebase-analyzer, codebase-pattern-finder, etc.]

- Finding with reference (`file.ext:line`)
- Connection to other components
- Implementation details
- Key patterns or conventions

### [Component/Area 2]
[Continue pattern...]

## Code References
- `path/to/file.ext:123` - Description of what's there
- `another/file.ext:45-67` - Description of the code block
- [Include file:line references from all research sources]

## Architecture Insights
[Patterns, conventions, and design decisions discovered]
- Architectural patterns identified
- Design decisions and their rationale
- Integration points between components
- Dependencies and relationships

## Documentation Insights
[Relevant insights from documentation analysis]
- Key decisions from documentation (from docs-analyzer)
- Constraints and requirements
- Historical context
- Technical specifications

## External Research (if applicable)
[Findings from web-search-researcher]
- Current best practices
- External library patterns
- Version-specific information
- Links to authoritative sources

## Related Files and Components
[Organized list of all relevant files found]
- Implementation files
- Test files
- Configuration files
- Documentation files

## Patterns and Conventions
[Code patterns and conventions discovered]
- Reusable patterns found
- Naming conventions
- File organization patterns
- Testing patterns

## Open Questions
[Any areas that need further investigation or clarification]

## Next Steps
[Suggested follow-up research or actions]
```

### Step 6: Add GitHub Permalinks (If Applicable)

1. **Check if on main branch or if commit is pushed**:
   - `git branch --show-current`
   - `git status`

2. **If on main/master or pushed, generate GitHub permalinks**:
   - Get repo info: `gh repo view --json owner,name` (if gh CLI available)
   - Or construct from git remote: `git remote get-url origin`
   - Create permalinks: `https://github.com/{owner}/{repo}/blob/{commit}/{file}#L{line}`
   - Replace local file references with permalinks in the document where possible

### Step 7: Save and Present Findings

1. **Create the research directory if it doesn't exist**: `mkdir -p docs/research`

2. **Save the research document** to `docs/research/YYYY-MM-DD-[description].md`

3. **Present findings to the user**:
   ```
   Research complete! I've created a comprehensive research document at:
   
   docs/research/YYYY-MM-DD-[description].md
   
   **Key Findings:**
   - [Summary point 1]
   - [Summary point 2]
   - [Summary point 3]
   
   **Key Files Referenced:**
   - `path/to/file.ext:line` - [what it contains]
   - [More key files...]
   
   Would you like me to:
   - Dive deeper into any specific area?
   - Answer follow-up questions?
   - Generate a PRD or task list based on these findings?
   ```

### Step 8: Handle Follow-Up Questions

1. **If the user has follow-up questions**:
   - Append to the same research document
   - Update the frontmatter fields `last_updated` and add `last_updated_note: "Added follow-up research for [brief description]"`
   - Add a new section: `## Follow-up Research [timestamp]`
   - Spawn new research tasks as needed for additional investigation
   - Continue updating the document

2. **For follow-up research**:
   - Use the same parallel research approach
   - Focus on the specific follow-up question
   - Integrate new findings into the existing document

## Important Guidelines

1. **Always use parallel research commands** to maximize efficiency:
   - Run discovery commands (locator, pattern-finder, docs-locator) in parallel
   - Then run analysis commands sequentially on findings
   - Use web-search-researcher only when external dependencies are involved

2. **Always run fresh codebase research**:
   - Never rely solely on existing research documents
   - Verify findings against actual code
   - Documentation provides context but code is the source of truth

3. **Focus on concrete evidence**:
   - Include specific file paths and line numbers
   - Reference actual code, not assumptions
   - Show connections between components

4. **Leverage all available commands**:
   - Use codebase-locator, codebase-analyzer, codebase-pattern-finder
   - Use docs-locator and docs-analyzer for documentation insights
   - Use web-search-researcher for external dependencies
   - Each command has a specific purpose - use them appropriately

5. **Synthesize comprehensively**:
   - Connect findings across different sources
   - Identify patterns and architectural decisions
   - Note both what exists and how it works
   - Include both code and documentation insights

6. **Critical ordering**:
   - ALWAYS read mentioned files first before spawning research tasks (Step 1)
   - ALWAYS wait for all research tasks to complete before synthesizing (Step 4)
   - ALWAYS gather metadata before writing the document (Step 5)
   - NEVER write the research document with placeholder values

7. **File reading**:
   - Always read mentioned files FULLY (no limit/offset) before spawning research tasks
   - Read all files identified by research tasks FULLY before synthesizing

8. **Document structure**:
   - Research documents should be self-contained with all necessary context
   - Include temporal context (when the research was conducted)
   - Link to GitHub when possible for permanent references
   - Keep findings organized by component/area

## Integration with Other Commands

- **create-prd**: Research findings can inform PRD creation
- **generate-tasks**: Research findings can guide task list generation
- **codebase-locator, codebase-analyzer, codebase-pattern-finder**: Core research tools
- **docs-locator, docs-analyzer**: Documentation research tools
- **web-search-researcher**: External research tool
- **create-handoff**: Research documents can be referenced in handoffs

## Example Research Flow

```
User: "How does authentication work in this codebase?"

1. No files mentioned, proceed to research
2. Decompose: Need to find auth components, understand flow, find patterns
3. Spawn parallel Phase 1:
   - codebase-locator: "Find all files related to authentication"
   - docs-locator: "Find authentication documentation"
   - codebase-pattern-finder: "Find authentication implementation patterns"
4. Wait for all Phase 1 to complete
5. Read identified files
6. Spawn sequential Phase 2:
   - codebase-analyzer: "Analyze authentication flow"
   - docs-analyzer: "Extract auth decisions from docs"
7. Synthesize all findings
8. Generate research document
9. Present to user
```

## Output Format

- **Format**: Markdown (`.md`)
- **Location**: `docs/research/`
- **Filename**: `YYYY-MM-DD-[description].md`
- **Structure**: YAML frontmatter + structured content with code references, architecture insights, and patterns

Remember: You are a research synthesizer. Your job is to orchestrate parallel research commands, read their findings, and synthesize comprehensive answers with concrete evidence from the codebase.
