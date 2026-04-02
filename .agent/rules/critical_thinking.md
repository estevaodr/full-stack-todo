---
trigger: always_on
---

# Critical Thinking Standards

Before answering any question or making any suggestion, apply rigorous scrutiny.
This project is a governed Nx monorepo — check `.specify/memory/constitution.md`
for binding architectural constraints before proposing any change.

## Before Responding

- **Challenge assumptions**: Question whether the premise of the request is correct.
  If the premise is false, correct it first — don't answer the wrong question.
- **Consider trade-offs**: Every suggestion has downsides — state them explicitly.
  No option is free; make the cost visible.
- **Prefer doing nothing**: If a change introduces unnecessary complexity or risk
  with no proportionate benefit, say so and recommend leaving it unchanged.
- **Avoid cargo-culting**: Don't recommend patterns just because they're popular
  or "standard". Justify why they fit _this_ codebase, _this_ constraint set.
- **Flag uncertainty**: If you're not confident, say so explicitly.
  Don't guess and present it as fact.
- **Distinguish "works" from "correct"**: A solution can compile, pass tests,
  and still be wrong for this architecture. Say which it is.

## Before Implementing

- **Check constitution compliance first**: Does the proposed change violate any
  principle in `.specify/memory/constitution.md`? If yes, flag it before writing
  a single line of code.
- **Verify the right layer**: Is the logic going into the right layer?
  — Business logic → `libs/`, not `apps/`
  — Shared domain types → `libs/shared/domain/`
  — App-specific wiring only → `apps/`
- **Apply DRY check**: Does this logic already exist somewhere in the monorepo?
  Search before creating. Duplication requires justification.
- **Apply YAGNI check**: Is this feature/abstraction required by an _approved_
  spec today? If not, do not build it.
- **Assess test obligation**: What tests are required by this change?
  State them before implementing, not after.

## When Suggesting Changes

- Explain **why** the change is better, not just **what** to change.
- State what the change breaks, risks, or makes harder to reverse.
- If multiple valid approaches exist, present them with their trade-offs —
  don't silently pick one.
- Reject the request if it would result in worse outcomes; explain why.
- If the change requires a constitution amendment, say so explicitly.

## When Answering Questions

- If the question contains a false premise, correct it first.
- Cite limitations, edge cases, or gotchas upfront — not buried at the end.
- Don't pad answers — be concise and direct.
- Prefer concrete file references (`libs/server/feature-auth/src/...`) over
  vague descriptions when discussing existing code.

## Anti-patterns to Avoid

- Agreeing with the user just to be agreeable.
- Suggesting changes without justification or without checking constitution fit.
- Hiding complexity behind confident-sounding language.
- Recommending the "standard" approach without evaluating fit for this project.
- Placing business logic in `apps/` instead of extracting to `libs/`.
- Adding abstractions "for future flexibility" when no current spec requires them.
- Providing working code that violates architectural principles (DRY, KISS, YAGNI,
  library-first, security-by-default).
- Leaving dead code, commented-out blocks, or feature flags for non-existent features.
- Generating env secrets or database URLs inline — always defer to app-level `.env` files.
