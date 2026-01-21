---
description: Create detailed Product Requirements Documents (PRD) through interactive research and iteration. Leverages codebase analysis to understand existing patterns before defining requirements.
alwaysApply: false
---

# Create PRD

## Overview

Create a detailed Product Requirements Document (PRD) in Markdown format through an interactive, research-driven process. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature. The process leverages ALL existing codebase analysis commands to understand current patterns before defining new requirements.

## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If a file path or feature description was provided, skip the default message
   - Immediately begin the research and analysis process

2. **If no parameters provided**, respond with:
```
I'll help you create a detailed Product Requirements Document (PRD). Let me start by understanding what we're building.

Please provide:
1. A brief description of the feature or functionality you want to build
2. Any relevant context, constraints, or specific requirements
3. Links to related documentation, tickets, or previous implementations (if any)

I'll analyze the codebase, understand existing patterns, and work with you to create a comprehensive PRD.

Tip: You can also invoke this command with a feature description directly.
```

Then wait for the user's input.

## Steps

### Step 1: Context Gathering & Comprehensive Research

1. **Read all mentioned files immediately and FULLY**:
   - Any referenced documentation
   - Related PRDs or task files
   - Existing implementation files mentioned
   - **IMPORTANT**: Use the Read tool WITHOUT limit/offset parameters to read entire files
   - **CRITICAL**: DO NOT ask questions before researching the codebase

2. **Spawn parallel research tasks** using ALL available commands:
   Before asking the user any questions, use specialized commands to research comprehensively:

   **Phase 1: Discovery (Run in parallel)**
   - Use **codebase-locator** to find all files related to the feature area
     - Example prompt: "Find all files related to [feature area] including components, services, tests, and configuration"
   - Use **docs-locator** to find relevant documentation in the docs/ directory
     - Example prompt: "Find documentation about [feature area] or similar features"
   - Use **codebase-pattern-finder** to find similar features we can model after
     - Example prompt: "Find similar implementations of [feature type] with code examples"

   **Phase 2: Deep Analysis (After Phase 1 completes)**
   - Use **codebase-analyzer** to understand how similar features are currently implemented
     - Example prompt: "Analyze how [similar feature] works, including data flow and key functions"
     - **IMPORTANT**: Read the files identified by codebase-locator first, then analyze
   - Use **docs-analyzer** to extract high-value insights from documentation found by docs-locator
     - Example prompt: "Extract key decisions, constraints, and patterns from [documentation file]"
     - Only analyze documents that are directly relevant to the feature
     - Focus on decisions made, constraints identified, and lessons learned

   **Phase 3: External Research (If needed for external dependencies)**
   - Use **web-search-researcher** for external libraries/frameworks that will be used
     - Example: "Research latest [framework] [specific feature] API" or "Find [library] best practices"
     - Only use when working with external dependencies or unfamiliar APIs
     - Leverage Context7 MCP when available (per context7-usage rule)
     - Use for version-specific features, breaking changes, or current best practices

   **Command Output Integration:**
   These commands will provide:
   - **codebase-locator**: File locations organized by purpose (implementation, tests, config, types)
   - **codebase-analyzer**: Detailed implementation analysis with file:line references, data flow, and patterns
   - **codebase-pattern-finder**: Concrete code examples and patterns with file:line references
   - **docs-locator**: List of relevant documentation files in docs/ directory
   - **docs-analyzer**: Key decisions, constraints, technical specifications, and actionable insights from documentation
   - **web-search-researcher**: Up-to-date external documentation, best practices, and code examples

3. **Read all files identified by research tasks**:
   - After research tasks complete, read ALL files they identified as relevant
   - Read them FULLY into the main context
   - This ensures you understand existing patterns before defining new requirements
   - Prioritize files mentioned by multiple research commands

4. **Synthesize findings from all sources**:
   - Cross-reference the feature request with actual codebase patterns
   - Combine insights from codebase analysis with documentation insights
   - Integrate external research findings for external dependencies
   - Identify existing components/services that can be leveraged
   - Note architectural constraints and conventions
   - Determine integration points and dependencies
   - Note any conflicting information or decisions that need clarification

5. **Present informed understanding and focused questions**:
   ```
   Based on your feature request and my comprehensive research of the codebase, I understand we need to [accurate summary].

   **Codebase Findings:**
   - [Current implementation pattern with file:line reference from codebase-analyzer]
   - [Relevant component/service that exists from codebase-locator]
   - [Architectural pattern to follow from codebase-pattern-finder]
   - [Potential integration point or dependency]

   **Documentation Insights:**
   - [Key decision or constraint from docs-analyzer]
   - [Technical specification or pattern from documentation]

   **External Research (if applicable):**
   - [Current best practice or API pattern from web-search-researcher]

   **Questions that my research couldn't answer:**
   - [Specific business logic clarification]
   - [User experience preference]
   - [Design decision that affects implementation]
   - [Clarification needed on conflicting information]
   ```

   Only ask questions that you genuinely cannot answer through code investigation, documentation analysis, or external research.

### Step 2: Interactive Clarification

1. **Ask focused clarifying questions** based on research gaps:
   - Provide options in letter/number lists for easy selection
   - Focus on "what" and "why" rather than "how"
   - Ask about business logic, user experience, and scope boundaries
   - Avoid technical implementation questions that can be derived from codebase patterns
   - Reference your research findings when asking questions

2. **Common question areas** (adapt based on research findings):
   - **Problem/Goal:** "What problem does this feature solve for the user?" or "What is the main goal we want to achieve with this feature?"
   - **Target User:** "Who is the primary user of this feature?"
   - **Core Functionality:** "Can you describe the key actions a user should be able to perform with this feature?"
   - **User Stories:** "Could you provide a few user stories? (e.g., As a [type of user], I want to [perform an action] so that [benefit].)"
   - **Acceptance Criteria:** "How will we know when this feature is successfully implemented? What are the key success criteria?"
   - **Scope/Boundaries:** "Are there any specific things this feature *should not* do (non-goals)?"
   - **Data Requirements:** "What kind of data does this feature need to display or manipulate?"
   - **Design/UI:** "Are there any existing design patterns or UI components we should follow?" (Reference findings from codebase-pattern-finder)
   - **Edge Cases:** "Are there any potential edge cases or error conditions we should consider?"

3. **If the user corrects any misunderstanding**:
   - DO NOT just accept the correction
   - Spawn new research tasks to verify the correct information
   - Use codebase-locator or codebase-analyzer to verify specific claims
   - Read the specific files/directories they mention
   - Only proceed once you've verified the facts yourself

### Step 3: PRD Structure Development

Once you have sufficient information:

1. **Create initial PRD outline**:
   ```
   Here's my proposed PRD structure:

   ## Overview
   [1-2 sentence summary]

   ## Key Sections:
   1. [Section name] - [what it covers]
   2. [Section name] - [what it covers]
   3. [Section name] - [what it covers]

   Does this structure make sense? Should I adjust any sections?
   ```

2. **Get feedback on structure** before writing the full PRD

### Step 4: Generate PRD

After structure approval:

1. **Generate the PRD** using the structure outlined below
2. **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory
3. **Reference codebase findings** throughout the PRD with specific file:line references from all research sources

## PRD Structure

The generated PRD should include the following sections:

1.  **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal. Include references to existing codebase patterns discovered during research (from codebase-analyzer, codebase-pattern-finder).

2.  **Goals:** List the specific, measurable objectives for this feature.

3.  **User Stories:** Detail the user narratives describing feature usage and benefits.

4.  **Current State Analysis:** Based on comprehensive codebase research:
    - What exists now that's relevant (from codebase-locator)
    - Existing components/services that can be leveraged (with file references from codebase-analyzer)
    - Architectural patterns to follow (from codebase-pattern-finder)
    - Integration points and dependencies (from codebase-analyzer)
    - Key decisions and constraints from documentation (from docs-analyzer)
    - External library considerations (from web-search-researcher, if applicable)

5.  **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements. Reference similar implementations found during research (from codebase-pattern-finder).

6.  **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.

7.  **Design Considerations:** 
    - Link to mockups if available
    - Describe UI/UX requirements
    - Reference existing UI components/patterns found in codebase (with file references from codebase-pattern-finder)
    - Mention relevant styles or design systems
    - Include external design patterns if researched (from web-search-researcher)

8.  **Technical Considerations:** 
    - Reference existing architectural patterns (with file:line references from codebase-analyzer)
    - Mention integration with existing modules/services (from codebase-locator and codebase-analyzer)
    - Note technical constraints discovered during research (from docs-analyzer)
    - Suggest dependencies based on codebase analysis (from codebase-analyzer)
    - Reference similar implementations as examples (from codebase-pattern-finder)
    - Include external library best practices (from web-search-researcher, if applicable)

9.  **Success Metrics:** How will the success of this feature be measured? (e.g., "Increase user engagement by 10%", "Reduce support tickets related to X").

10. **Implementation Notes:** 
    - Key files/components that will likely be created or modified (from codebase-locator findings)
    - Testing strategy based on existing test patterns (from codebase-pattern-finder)
    - Migration considerations if applicable (from docs-analyzer)
    - External library integration approach (from web-search-researcher, if applicable)

## Important Guidelines

1. **Be Research-Driven**:
   - Always research the codebase BEFORE asking questions
   - Use ALL available commands: codebase-locator, codebase-analyzer, codebase-pattern-finder, docs-locator, docs-analyzer, web-search-researcher
   - Use parallel research tasks for efficiency
   - Read files completely, not partially
   - Verify findings with actual code
   - Combine insights from multiple sources

2. **Be Skeptical**:
   - Question vague requirements
   - Identify potential issues early
   - Ask "why" and "what about"
   - Don't assume - verify with code
   - Cross-reference findings from different sources

3. **Be Interactive**:
   - Don't write the full PRD in one shot
   - Get buy-in at each major step
   - Allow course corrections
   - Work collaboratively

4. **Be Thorough**:
   - Include specific file paths and line numbers from research
   - Reference existing patterns and components
   - Include insights from documentation analysis
   - Incorporate external research findings when relevant
   - Write clear, measurable requirements
   - Consider edge cases and error conditions

5. **Be Practical**:
   - Leverage existing codebase patterns
   - Reuse existing components/services when possible
   - Follow established architectural conventions
   - Consider integration points
   - Use current best practices from external research

6. **No Open Questions in Final PRD**:
   - If you encounter open questions during planning, STOP
   - Research or ask for clarification immediately
   - Use additional research commands if needed
   - Do NOT write the PRD with unresolved questions
   - The PRD must be complete and actionable

## Command Usage Strategy

### When to Use Each Command

- **codebase-locator**: Always use first to discover what files exist related to the feature
- **docs-locator**: Use to find relevant documentation before deep analysis
- **codebase-pattern-finder**: Use to find similar implementations and code examples
- **codebase-analyzer**: Use after locator to understand HOW existing code works
- **docs-analyzer**: Use after docs-locator to extract insights from relevant documentation
- **web-search-researcher**: Use when external libraries/frameworks are involved or when you need current best practices

### Command Sequencing

1. **Parallel Discovery**: codebase-locator + docs-locator + codebase-pattern-finder (run simultaneously)
2. **Sequential Analysis**: codebase-analyzer (on files found) + docs-analyzer (on docs found)
3. **External Research**: web-search-researcher (only if external dependencies involved)

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be:
- Explicit and unambiguous
- Avoid jargon where possible
- Include file references for context
- Provide enough detail to understand the feature's purpose and core logic
- Reference existing codebase patterns for consistency
- Include code examples from pattern-finder when helpful

## Output

*   **Format:** Markdown (`.md`)
*   **Location:** `/tasks/`
*   **Filename:** `prd-[feature-name].md`

## Final Instructions

1. **DO NOT start implementing the PRD** - this command is only for creating requirements
2. **Research first, ask questions second** - leverage ALL codebase analysis commands before asking clarifying questions
3. **Use all available commands** - codebase-locator, codebase-analyzer, codebase-pattern-finder, docs-locator, docs-analyzer, web-search-researcher
4. **Reference codebase findings** - include file:line references throughout the PRD from all research sources
5. **Iterate based on feedback** - be ready to refine the PRD based on user input
6. **Ensure completeness** - resolve all open questions before finalizing the PRD
