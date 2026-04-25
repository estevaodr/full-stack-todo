# Research: Next.js client structured logging

## Decision: Correlation id for invalid / oversized `x-request-id`

**Choice**: If incoming `x-request-id` is **missing**, generate a new UUID. If **present but invalid** (e.g. length > **128** after trim, or contains non-ASCII / control characters), **replace** with a **new UUID** for downstream use and log a single **warn** (once per request) at the Edge middleware boundary is **not** allowed (no logger) — so **silently replace** in middleware and set the sanitized value on the forwarded request + response headers.

**Rationale**: Prevents log injection / oversized headers breaking log pipelines; matches operator expectation that id is always safe ASCII. No warn from Edge keeps middleware logger-free.

**Alternatives considered**: Pass-through untrusted header (rejected: security + pipeline risk); truncate in place (rejected: partial id worse than fresh UUID for correlation).

---

## Decision: `LOG_LEVEL` change semantics (v1)

**Choice**: **Process restart or recycle** required for new `LOG_LEVEL` to apply (document in [quickstart.md](./quickstart.md)).

**Rationale**: Matches default assumption in [spec.md](./spec.md#assumptions); simplest pino setup; parity with “env at bootstrap” mental model.

**Alternatives considered**: Periodic `process.env` → `logger.level` sync (like `apps/server`); deferred to optional follow-up if operators need hot change without restart.

---

## Decision: Library placement (`libs/client/logging`)

**Choice**: New **`libs/client/logging`** Nx library with **`@full-stack-todo/client/logging`** path alias.

**Rationale**: Satisfies Constitution **Principle I** (library-first); independently testable; `apps/client` stays thin.

**Alternatives considered**: Colocate only under `apps/client/src/lib` (rejected: violates library-first for reusable infra).

---

## Decision: Test runner for `withLogging`

**Choice**: **Vitest**, colocated `*.spec.ts` under `libs/client/logging/src/__tests__/` with `nx test client-logging` once the lib target is wired (or `vitest run` via `nx:run-commands` mirroring `apps/client`).

**Rationale**: Constitution IV states client stack uses Vitest; keeps logging tests out of Playwright E2E.

**Alternatives considered**: Jest for lib only (rejected: splits client toolchain).

---

## Decision: Syslog severity mapping (normative)

**Choice**: Map pino levels to RFC 5424 **severity** numbers on a field such as `syslogSeverity` on each JSON line.

**Normative source of truth**: [contracts/log-schema.md](./contracts/log-schema.md#syslog-severity-mapping-normative-fr-007) (table duplicated nowhere else for acceptance).

**Rationale**: Single-digit field for aggregators; aligns with common mapping (no local0 facility in payload).

**Alternatives considered**: Emit PRI integer only (rejected: less human for dashboards); omit numeric (rejected: spec FR-007).
