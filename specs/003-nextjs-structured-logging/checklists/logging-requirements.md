# Requirements-quality checklist: Client structured logging

**Purpose**: Unit-test the **written requirements** (spec, plan, contracts) for completeness, clarity, consistency, and measurability—not implementation behavior.  
**Created**: 2026-04-24  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [contracts/](../contracts/)

## Requirement completeness

- [x] CHK001 Are requirements for **every** App Router API route surface that must use the standard logging wrapper explicitly listed or clearly bounded (e.g. “all `src/app/api/**/route.ts`”), or is scope left implicit? [Completeness, Gap, Spec §FR-002, Plan §Scale/Scope] — **Resolved**: Spec **Scope terms** bound handlers to `apps/client/src/app/api/**/route.{ts,tsx,js,jsx}` (Node + wrapper).
- [x] CHK002 Are requirements defined for **Server Components** that need logs but must not use async request context—including how they obtain correlation when `x-request-id` is absent? [Completeness, Spec §FR-005, Spec Edge Cases] — **Resolved**: FR-005 + Edge Cases require `await headers()` / `x-request-id` when present; **one-time UUID** when absent, with mismatch note vs edge.
- [x] CHK003 Does the spec or supplement define which **application code paths** are “covered” by FR-001’s ban on ad-hoc print-style logging (whole `apps/client`, server-only trees, or named directories)? [Completeness, Gap, Spec §FR-001] — **Resolved**: Spec **Covered server paths** list under FR-001.
- [x] CHK004 Are **redaction** requirements complete for nested objects (depth), arrays of secrets, and header name casing (`Authorization` vs `authorization`), or is only the shallow case specified? [Completeness, Spec §FR-006, contracts/redaction.md] — **Resolved**: `contracts/redaction.md` — case-insensitive headers, depth 10, array object traversal.
- [x] CHK005 Is the **numeric severity** requirement (FR-007) traceable to a single normative mapping table shared across spec, research, and contracts without contradiction? [Completeness, Consistency, Spec §FR-007, research.md, contracts/log-schema.md] — **Resolved**: Single table in `contracts/log-schema.md`; spec FR-007 + research point there only.

## Requirement clarity

- [x] CHK006 Is **“agreed redaction marker”** in User Story 2 bound to exactly one literal (e.g. `[Redacted]`) in the spec or a contract, so “agreed” is not reader-dependent? [Clarity, Spec §US2, contracts/redaction.md] — **Resolved**: US2 + FR-006 + Key entities bind literal **`[Redacted]`**; contract unchanged as source.
- [x] CHK007 Is **“human-scannable”** in SC-004 defined with minimum acceptance signals (e.g. includes severity + message + request id on access lines), or does it rely solely on subjective sign-off? [Clarity, Measurability, Spec §SC-004] — **Resolved**: SC-004 lists required fields for access lines + minima for other app lines.
- [x] CHK008 Are **“error details”** in FR-002 constrained (stack only, message only, no header echo) to avoid conflict with redaction rules? [Clarity, Conflict risk, Spec §FR-002, Spec §FR-006] — **Resolved**: FR-002 — message required, stack optional, no raw headers/body as “details”.
- [x] CHK009 Is **“URL (or path)”** in FR-002 resolved to one canonical choice (full URL vs path-only) in requirements for log field semantics? [Clarity, Spec §FR-002, contracts/log-schema.md] — **Resolved**: **`url`** = pathname + search, no scheme/host (`contracts/log-schema.md` §Canonical `url`).
- [x] CHK010 Does **SC-005** name exactly one product rule (restart-only vs in-process reload) in the spec’s normative text, not only in assumptions, so success criteria are unambiguous? [Clarity, Consistency, Spec §SC-005, Spec §Assumptions, research.md] — **Resolved**: SC-005 normative **restart/recycle only**; US4 + Assumptions aligned.

## Requirement consistency

- [x] CHK011 After Clarifications **B**, are **spec**, **technical supplement**, and **plan** aligned on Pages Router being out of scope for acceptance (no dangling “must test withPagesLogging” in normative spec text)? [Consistency, Spec §Clarifications, docs/logging/…, Plan §Summary] — **Resolved**: Clarification bullet + supplement **v1** acceptance section + plan Summary; `withPagesLogging` only under follow-up.
- [x] CHK012 Do **FR-003** (middleware assigns id) and **FR-004** (ALS in handlers) state the same correlation **header name** and lifecycle story without implying middleware uses ALS? [Consistency, Spec §FR-003–004] — **Resolved**: FR-003 names **`x-request-id`**, Edge-only, no ALS/logger; FR-004 same string after middleware, ALS only inside wrapped Node handlers.
- [x] CHK013 Do **contracts/middleware-request-id.md** (invalid header → replace) and **spec Edge Cases** (invalid/long id) describe the **same** normalization policy? [Consistency, Spec §Edge Cases, contracts/middleware-request-id.md, research.md] — **Resolved**: Edge Cases → contract + research; contract adds missing/empty, invalid replace, forward valid opaque; cross-links both ways.

## Acceptance criteria quality

- [x] CHK014 Can **SC-001** be evaluated without defining what “attributed to that request” means in text (e.g. access log vs child context log lines)? [Measurability, Gap, Spec §SC-001] — **Resolved**: SC-001 defines attribution = wrapper ALS lifetime; access line + child `getLogger` lines in same context; exclusions listed.
- [x] CHK015 Is **SC-003**’s “automated ingestion validation” referenced to a concrete contract or example line shape so reviewers know what “structural parse failure” excludes? [Measurability, Spec §SC-003, contracts/log-schema.md, contracts/log-line.example.json] — **Resolved**: `contracts/log-schema.md` §SC-003 table + spec link; example JSON cited as shape reference.
- [x] CHK016 Are **SC-002**’s “at least three common secret field keys” enumerated in spec or contract so the requirement is closed-set? [Measurability, Spec §SC-002, contracts/redaction.md] — **Resolved**: SC-002 cites contract; `redaction.md` labels **closed set** (`password`, `token`, `accessToken`, `refreshToken`).

## Scenario coverage

- [x] CHK017 Are **primary** operator and security journeys (US1–US2) reflected in functional requirements without gaps (correlation + redaction + access fields)? [Coverage, Spec §US1–2, Spec §FR-002–006] — **Resolved**: Spec **Journey traceability** table maps US1→FR-003/004/002/SC-001/FR-005, US2→FR-006/SC-002/FR-002.
- [x] CHK018 Are **alternate** flows specified when clients send a **valid** custom `x-request-id` (non-UUID) vs UUID—must logs preserve opaque tokens verbatim? [Coverage, Ambiguity, Spec §US1, contracts/middleware-request-id.md] — **Resolved**: US1 scenario 4 + **FR-003** + middleware contract (forward unchanged, logs same string).
- [x] CHK019 Are **exception** flows for handler throw (Edge Cases + FR-002) consistent on whether a **statusCode** is always defined in the access log line? [Coverage, Spec §Edge Cases, Spec §FR-002, contracts/with-logging.md] — **Resolved**: Edge Cases + **FR-002** + `with-logging.md` + `log-schema.md` — **`statusCode` always**; **500** default on throw without response status.

## Edge case coverage

- [x] CHK020 Is the **static vs dynamic** Server Component tradeoff (Edge Cases) reflected in measurable guidance or an explicit “documentation only” acceptance, so implementers know if it is in-scope for v1? [Edge case, Spec §Edge Cases, Gap] — **Resolved**: Edge Cases — **v1 = documentation only**, no static/dynamic product gate; **quickstart** + supplement carry the tradeoff.
- [x] CHK021 Is **log-only uuid** for Server Components when header missing explicitly excluded or allowed for correlation parity with middleware, per spec Edge Cases—and is that free of contradiction with SC-001? [Edge case, Consistency, Spec §Edge Cases, Spec §SC-001] — **Resolved**: **Allowed** per **FR-005** + Edge Cases; **SC-001** narrowed to wrapped handlers **only** + explicit exclusion of RSC lines.

## Non-functional requirements (requirements text)

- [x] CHK022 Are **performance / volume** expectations for logging (e.g. max header size, no full body) stated as requirements or explicitly deferred with a pointer? [NFR, Gap, Plan §Performance, contracts/redaction.md] — **Resolved**: **NFR-LOG-001–003** (spec §Non-functional requirements logging volume); **redaction.md** Volume section; plan links to spec NFRs.
- [x] CHK023 Is **build-time exclusion** of the logger from client bundles (FR-009) defined in requirement terms (what “client bundle” means in Next: Client Components vs server chunks) or only at plan level? [Completeness, Spec §FR-009, Plan §Constitution] — **Resolved**: **FR-009** defines **client bundle** vs server graphs + `server-only` / lint.

## Dependencies & assumptions

- [x] CHK024 Is the **dependency** between normative **spec** and **technical supplement** stated with a rule for conflict resolution (spec wins vs supplement wins)? [Traceability, Spec §Assumptions, Gap] — **Resolved**: **Assumptions** — **Normative precedence** (`spec` > `contracts` for interface slices > plan/supplement/quickstart; spec beats contract on conflict).
- [x] CHK025 Are **environment variable** names and semantics duplicated only where necessary, with a single contract (`contracts/environment.md`) cited from spec/plan/quickstart without drift? [Consistency, contracts/environment.md, quickstart.md] — **Resolved**: `environment.md` **single source** header; spec supplement bullet defers env there; plan + quickstart + docs cite contract; quickstart table labeled non-authoritative.

## Ambiguities & conflicts

- [x] CHK026 If **optional in-process LOG_LEVEL** remains in supplement assumptions but **research** chose restart-only for v1, is that dual documentation flagged as “v1 vs follow-up” in the spec to avoid reader conflict? [Conflict, Ambiguity, Spec §Assumptions, research.md, quickstart.md] — **Resolved**: Spec **Assumptions** — supplement optional section = **follow-up only**; supplement heading + body point at **SC-005** / **research**.
- [x] CHK027 Is **FR-010**’s “success and error paths” for the wrapper defined at requirements level (what “error path” means: thrown error, 4xx/5xx, or both)? [Clarity, Spec §FR-010, contracts/with-logging.md] — **Resolved**: **FR-010** defines success + **error (a)** throw + **error (b)** returned 4xx/5xx; `with-logging.md` Behavior step 6 + **FR-010 test coverage** table + Tests.

## Notes

- Check off items during **spec / contract review** before merge of requirements changes.
- Items intentionally avoid “Verify implementation…” wording; they question whether **the written requirements** are good enough.
