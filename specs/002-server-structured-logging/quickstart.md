# Quickstart: Structured logging (`apps/server`)

## Prerequisites

- Monorepo deps installed (`npm ci` or workspace equivalent).
- Postgres + env for server already working (see `apps/server` README / `.env.example`).

## Environment variables

| Variable | Example | Effect |
|----------|---------|--------|
| `NODE_ENV` | `production` | With `LOG_FORMAT=auto`, emits **NDJSON** lines on stdout |
| `NODE_ENV` | `development` | With `LOG_FORMAT=auto`, emits **pretty** colorized logs |
| `LOG_FORMAT` | `json` / `pretty` / `auto` | Overrides auto behavior when `json` or `pretty`; `auto` or unset follows `NODE_ENV` |
| `LOG_LEVEL` | `fatal` … `trace` (default `info`) | Minimum severity; invalid at startup **abort**; in-process changes sync ~**1s** without restart |

**Runtime tweak (no restart)** — **`LOG_LEVEL` only**:

1. Change in-process env (e.g. in REPL or test harness): `process.env.LOG_LEVEL = 'debug'`.
2. Wait ≤ sync interval (default **1s**) or emit a log after change — new level applies.

**`LOG_FORMAT` (JSON vs pretty)**: pick value in env **before** start, or **restart** the server after changing it—transport is wired at bootstrap (same as spec FR-004 / SC-004).

> Production Kubernetes note: updating a ConfigMap **does not** mutate in-process `process.env` until the pod restarts unless a sidecar/agent does—this matches spec assumption (“platform hook outside feature”).

## Run locally

```bash
# development pretty logs (typical)
NODE_ENV=development LOG_FORMAT=auto LOG_LEVEL=debug npx nx serve server
```

```bash
# production-shaped JSON logs
NODE_ENV=production LOG_FORMAT=auto LOG_LEVEL=info npx nx serve server
```

## Verify quickly

1. **Automated**: `npx nx test server` (includes NDJSON sample, reqId, redaction, and level-table checks).
2. **JSON**: pipe stdout through `jq -c .` — each non-empty line should parse.
3. **reqId**: send `curl -H 'x-request-id: abc' http://localhost:3000/api/v1/...` (or your `PORT`) — logs include same id (`abc`).
4. **Redaction** (credentials from [`scripts/seed-data.yaml`](../../scripts/seed-data.yaml) after a normal DB seed): login sends a JSON body with a top-level `password` field; follow-up calls send `Authorization: Bearer <JWT>`. Inspect server stdout — **`password` values and the bearer secret must not appear in clear text**; governed paths should show only **`[Redacted]`** (see automated `redaction.http.integration.spec.ts` for nested `{"user":{"password":"…"}}` against a test-only echo route).

   ```bash
   BASE="http://localhost:${PORT:-3000}"
   # Alice — same email/password as first user in seed-data.yaml ([HTTPie](https://httpie.io/): `http`)
   TOKEN="$(http --print=b POST "${BASE}/api/v1/auth/login" \
     email=alice@example.com password='SecureP@ssw0rd123!' | jq -r '.access_token')"

   http POST "${BASE}/api/v1/todos" "Authorization: Bearer ${TOKEN}" \
     title='Redaction smoke' description='Check logs for [Redacted] only'

   http GET "${BASE}/api/v1/todos" "Authorization: Bearer ${TOKEN}"
   ```

## Manual acceptance — SC-002 (development / pretty)

**Not** the default automated CI gate. Use before release or when changing pretty formatting.

**Setup**: `NODE_ENV=development`, `LOG_FORMAT=auto` (or `pretty`), mixed HTTP traffic (≥1 success, ≥1 error path), capture **10** consecutive or representative **stdout** lines (skip blank lines).

**Rubric** (per line, **no JSON parser** on the line text):

| Check | Pass if |
|-------|---------|
| **(A) Severity** | Reviewer can point to a **visible** severity cue on the line (e.g. level label, colorized token, or keyword clearly tied to one of `fatal`…`trace`). |
| **(B) Request correlation** | Reviewer can point to a **visible** value that matches the request’s **`reqId`** for that call: same string as `x-request-id` header if sent, otherwise the generated UUID shown in access/context output for that request. |

**SC-002 pass** = **10/10** lines pass both (A) and (B). Reviewer identity is **any** engineer on the team; disputes escalate to a second reviewer on the contested lines only.

## Manual acceptance — SC-004 (b) (runtime `LOG_LEVEL`)

**Automated path** (preferred): tests advance fake timers past the configured **LOG_LEVEL** sync interval (default **1s**, see `research.md`) and assert log level behavior.

**Runbook path**: after changing `process.env.LOG_LEVEL` in a live or local process, wait **≤ 1 minute** (slack for humans), emit a log at known severities, confirm filter behavior matches the new minimum level.

## Tests

```bash
npx nx test server
```

Ensure new `LoggingInterceptor` specs pass.
