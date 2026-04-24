# Requirements quality checklist: Structured logging (API server)

**Purpose**: Unit-test style validation of *requirements writing* for structured logging — completeness, clarity, consistency, measurability, coverage (not implementation verification).  
**Created**: 2026-04-24  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [tasks.md](../tasks.md)

**Defaults used** (no `/speckit.checklist` args): depth **standard**, audience **PR reviewer**, focus **traceability + env/redaction semantics + plan/spec alignment**.

**De-duplication (2026-04-24):** former CHK003 merged into CHK002; former CHK029 merged into CHK009 (then renumbered). Historical IDs: CHK012 → CHK011.

---

## Requirement completeness

- [x] CHK001 Are severity field names and JSON shape for log records explicitly required in the spec, or only deferred to plan/tasks such that acceptance could disagree across readers? [Gap vs completeness, Spec §FR-001, Assumptions] — **Resolved:** [contracts/log-schema.md](../contracts/log-schema.md); FR-001 cross-link.
- [x] CHK002 Does **FR-006** delimit **which** emitted lines count as “HTTP-access-related” and therefore must carry correlation, **and** are alternate spellings for the correlation field ruled out? [Completeness / traceability, Spec §FR-006] — **Resolved:** [contracts/http-request-logging.md](../contracts/http-request-logging.md) §**`reqId` on which lines**; FR-006 + **log-schema** (`reqId` only); MUST = pino-http + **LoggingInterceptor**, SHOULD = other contextual app logs.
- [x] CHK003 Are requirements documented for which log paths must include serialized request bodies (if any), versus forbidding raw body dumps entirely? [Gap, Spec §FR-007, Edge Cases “Large request bodies”] — **Resolved:** [contracts/http-request-logging.md](../contracts/http-request-logging.md) §**Request body on stdout (scope)**; FR-007 + large-body edge case cross-links.
- [x] CHK004 Are startup configuration error messages required to meet any content schema (message text, exit codes), beyond “clear” and non-zero exit? [Completeness, Spec §FR-014, §FR-015] — **Resolved:** v1 **no** mandatory JSON or fixed exit code; **SHOULD** name var + rejection + hint — [contracts/bootstrap-config-errors.md](../contracts/bootstrap-config-errors.md); FR-014/FR-015 cross-links.

## Requirement clarity

- [x] CHK005 Is “valid JSON parseable as a single object” per line quantified for allowed prefixes/suffixes (e.g. transport metadata) or strictly one JSON object with no leading noise? [Clarity, Spec §FR-002, SC-001] — **Resolved:** [contracts/log-schema.md](../contracts/log-schema.md) §NDJSON; FR-002 cross-link.
- [x] CHK006 Is “colorized severity where terminal supports it” defined so acceptance is falsifiable without subjective judgment? [Clarity / measurability, Spec §FR-003, SC-002] — **Resolved:** SC-002 = **manual runbook** + rubric in **quickstart**; optional CI snapshots out of scope unless spec amended.
- [x] CHK007 Is “evaluates verbosity” / “subsequent log evaluations” pinned to observable semantics when implementation caches levels (spec allows cache if consistent)? [Clarity, Spec §FR-005] — **Resolved:** [contracts/runtime-log-level.md](../contracts/runtime-log-level.md) (**I1**, sync tick, fake timers); FR-005 cross-link.
- [x] CHK008 Is redaction a **single** literal **`[Redacted]`** for every governed path (Authorization + nested `password`), with no alternate placeholders per secret class? [Clarity / consistency, Spec §FR-007, SC-003] — **Resolved:** [contracts/redaction.md](../contracts/redaction.md); FR-007 (merged former CHK009 + CHK029).
- [x] CHK009 Is “own-property” for nested `password` redaction aligned with observable behavior for array indices, prototypes, and non-plain objects in requirements (not only clarifications)? [Clarity, Spec §FR-007, Clarifications] — **Resolved:** [contracts/redaction.md](../contracts/redaction.md) §**`password` walk**; FR-007 cross-link.

## Requirement consistency

- [x] CHK010 Do FR-008 (injectable logger pattern) and Assumptions (`PinoLogger` + `@InjectPinoLogger`) state one contract without conflicting tokens or forbidden patterns? [Consistency, Spec §FR-008, Assumptions] — **Resolved:** [contracts/application-logger.md](../contracts/application-logger.md); FR-008 + Assumptions cross-link; bootstrap `NestFactory` carve-out documented.
- [x] CHK011 Do User Story 4 acceptance (format via env) and plan/research notes on **restart for `LOG_FORMAT` transport** create a spec/plan conflict that requirements should resolve or explicitly defer? [Conflict / consistency, Spec §User Story 4, Plan §Implementation Notes] — **Resolved 2026-04-24** (historical **CHK012**): spec states transport fixed at bootstrap; `LOG_FORMAT` needs **restart**; `LOG_LEVEL` in-process without restart. Plan Summary cites “Spec amended”.
- [x] CHK012 Are “Nest internal logs through pino” (FR-009/FR-010 family) consistent with “zero console.* including tests” (FR-010) regarding Nest testing harnesses and third-party code under `apps/server`? [Consistency, Spec §FR-009–FR-010] — **Resolved:** [contracts/nest-logging-tests.md](../contracts/nest-logging-tests.md); FR-009/FR-010 cross-links; `node_modules` out of scope, `*.spec.ts` in scope.
- [x] CHK013 Are SC-001’s “50 lines” and tasks’ integration harness minimums stated as requirements-level acceptance or only as task-derived criteria—and should they match? [Consistency, Spec §SC-001, tasks T026] — **Resolved:** **50** normative in **SC-001** + [contracts/log-schema.md](../contracts/log-schema.md) §**SC-001 sample size**; **T026** ≥50, no weaker threshold.

## Acceptance criteria quality

- [x] CHK014 Can SC-002’s “single reviewer correctly identifies severity and correlation on 100% of 10 samples” be operationalized without a rubric (who counts as reviewer, what counts as correct)? [Measurability, Spec §SC-002] — **Resolved:** rubric + reviewer rule in **quickstart** §SC-002; enforcement table in spec.
- [x] CHK015 Is SC-004’s “within 1 minute” tied to a defined sync interval or left as an untestable bound against plan’s polling design? [Measurability, Spec §SC-004, Plan §Runtime level] — **Resolved:** SC-004(b) ties to **next sync** (default **1s**); manual ≤1 min; **research.md** updated.
- [x] CHK016 Does SC-005 define the exact static rule (AST vs text grep) to avoid false positives/negatives for `console` usage under `apps/server`? [Measurability, Spec §SC-005] — **Resolved:** **ESLint `no-console`** authoritative; [contracts/static-analysis-console.md](../contracts/static-analysis-console.md); SC-005 + enforcement table.

## Scenario coverage

- [x] CHK017 Are primary / alternate / exception requirements explicitly mapped for invalid env at startup vs invalid env after bootstrap (if any difference matters)? [Coverage, Spec §FR-014–FR-015, Edge Cases] — **Resolved:** [contracts/scenario-coverage.md](../contracts/scenario-coverage.md) §**CHK017** (table: startup vs post-bootstrap for `LOG_LEVEL` / `LOG_FORMAT`); **FR-014**/**FR-015** cross-links; **Edge Cases** + **Assumptions** in [spec.md](../spec.md).
- [x] CHK018 Are recovery requirements defined if logger or transport fails mid-process, or is absence intentional and documented? [Gap, Exception flow] — **Resolved:** intentional **no** v1 failover / spool mandate — [contracts/scenario-coverage.md](../contracts/scenario-coverage.md) §**CHK018**; **Edge Cases** + **Assumptions** + **FR-013** alignment in [spec.md](../spec.md).
- [x] CHK019 Are concurrent-request isolation requirements stated beyond the single edge-case bullet (e.g. ordering, worker threads)? [Coverage, Spec §Edge Cases, FR-012] — **Resolved:** isolation + **no** cross-request ordering guarantee + worker / off-ALS — [contracts/scenario-coverage.md](../contracts/scenario-coverage.md) §**CHK019**; **FR-012** + **Edge Cases** in [spec.md](../spec.md).

## Edge case coverage

- [x] CHK020 Are requirements for malformed JSON bodies, non-object bodies, or missing `Content-Type` aligned with redaction and “no raw secret” obligations? [Edge case, Gap, Spec §FR-007] — **Resolved:** [contracts/http-request-logging.md](../contracts/http-request-logging.md); Edge Cases + FR-007.
- [x] CHK021 Is behavior specified when `x-request-id` is present but empty or duplicate across retries? [Edge case, Gap, Spec §FR-006] — **Resolved:** [contracts/http-request-logging.md](../contracts/http-request-logging.md); Edge Cases + FR-006.
- [x] CHK022 Are websocket or non-Express HTTP surfaces explicitly in or out of scope for `reqId` and interceptor logging? [Boundary, Gap, Spec §FR-013] — **Resolved:** [contracts/http-request-logging.md](../contracts/http-request-logging.md) §**Transport surfaces** (Express HTTP in scope; WS / Fastify / non-Express out for mandatory FR-006/9/12); **FR-013** + **Edge Cases** in [spec.md](../spec.md); pointer §**CHK022** in [contracts/scenario-coverage.md](../contracts/scenario-coverage.md).

## Non-functional requirements

- [x] CHK023 Are performance or size limits for logging / serialization (beyond plan’s informal note) required at spec level for “large bodies”? [NFR completeness, Spec §Edge Cases, Plan §Performance Goals] — **Resolved:** **NFR-001** + [contracts/http-request-logging.md](../contracts/http-request-logging.md) §**Serialization limits** (8192-byte preview cap, no full-buffer-for-logging, no log-write SLA); **FR-007** + Edge Cases; **plan.md** Performance Goals; §**CHK023** in [contracts/scenario-coverage.md](../contracts/scenario-coverage.md).
- [x] CHK024 Are clock skew, timestamp format, and timezone requirements for log records specified or intentionally omitted? [Gap, NFR, Spec §Key Entities “Log record”] — **Resolved:** **NFR-002** + [contracts/log-schema.md](../contracts/log-schema.md) (epoch ms **`time`**, clock skew out of scope, no required tz string on JSON lines, pretty optional); **Key Entities** + **Assumptions** in [spec.md](../spec.md); §**CHK024** in [contracts/scenario-coverage.md](../contracts/scenario-coverage.md).

## Dependencies and assumptions

- [x] CHK025 Is reliance on Joi for fail-fast startup validation documented as a requirement or only as plan dependency—and what if validation layer changes? [Assumption / dependency, Plan §Joi, Spec §FR-014–FR-015] — **Resolved:** [contracts/environment.md](../contracts/environment.md) §**Startup validation library** (Joi = v1 reference impl; swap allowed if behavior + docs updated); **Assumptions** in [spec.md](../spec.md); §**CHK025** in [contracts/scenario-coverage.md](../contracts/scenario-coverage.md).
- [x] CHK026 Is “RFC 5424 semantics” requirement tied to library mapping documentation sufficiently that independent auditors can verify alignment without reading pino source? [Traceability, Spec §FR-001, tasks T028] — **Resolved:** golden table + audit instructions in [contracts/log-schema.md](../contracts/log-schema.md) §**RFC 5424 semantics ↔ pino numeric `level`**; **FR-001** + **Assumptions**; **T028**; §**CHK026** in [contracts/scenario-coverage.md](../contracts/scenario-coverage.md).

## Ambiguities and conflicts

- [x] CHK027 Does “single interceptor-based request/response logger” (FR-009) conflict with separate pino-http access logging if both exist—should requirements name allowed components? [Ambiguity, Spec §FR-009] — **Resolved:** [contracts/http-request-logging.md](../contracts/http-request-logging.md) §**HTTP logging stack** (pino-http = access middleware; **one** `LoggingInterceptor` = outcome); **FR-009** + **FR-006** in [spec.md](../spec.md); [nest-logging-tests.md](../contracts/nest-logging-tests.md); §**CHK027** in [contracts/scenario-coverage.md](../contracts/scenario-coverage.md).

## Notes

- Check off as reviewed: `[x]`
- Branch note: `check-prerequisites.sh --json` may fail when git branch name ≠ `NNN-feature`; feature dir still from `.specify/feature.json`.
