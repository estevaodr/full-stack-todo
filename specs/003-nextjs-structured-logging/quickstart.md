# Quickstart: Client structured logging

## Prerequisites

- Monorepo root; Node LTS; `npx nx build client` / `npx nx serve client` as usual.
- After implementation: `@full-stack-todo/client/logging` resolves via `tsconfig.base.json`.

## Environment variables

**Normative names, values, defaults, and `LOG_FORMAT` resolution**: [contracts/environment.md](./contracts/environment.md).

| Variable | Values | Default | Effect |
|----------|--------|---------|--------|
| `NODE_ENV` | `production` / `development` | (set by toolchain) | With `LOG_FORMAT=auto`, selects JSON vs pretty |
| `LOG_LEVEL` | `fatal` \| `error` \| `warn` \| `info` \| `debug` \| `trace` | `info` | Minimum level at **process start** |
| `LOG_FORMAT` | `json` \| `pretty` \| `auto` | `auto` | `auto` + `production` → JSON; else pretty |

Table is a **quick reference** only — if it ever disagrees with the contract, **the contract wins** (see [spec.md](./spec.md#assumptions) precedence).

**Changing `LOG_LEVEL`**: restart the Next server process (or recycle the deployment) unless a future in-process sync is implemented (see **SC-005** in spec).

## Operator: verify production JSON

```bash
cd /path/to/full-stack-todo
NODE_ENV=production LOG_FORMAT=json LOG_LEVEL=info npx nx serve client
# Trigger an API route; each log line should be one JSON object.
```

## Developer: local pretty logs

```bash
NODE_ENV=development LOG_FORMAT=auto npx nx serve client
```

## Correlation

1. Send `curl -H "x-request-id: abc-123" http://localhost:3000/api/...`
2. Confirm log lines for that request include `requestId":"abc-123"` (or replacement if id was invalid per [research.md](./research.md)).

## Server Component logging

- Use `const h = await headers();` then pass `h.get('x-request-id')` into `getLogger('MyPage', { requestId })`.
- **Static vs dynamic (v1)**: Calling **`await headers()`** for correlation/logging can force **dynamic** rendering per Next.js; there is **no** separate automated “stay static” gate in spec v1 — document the tradeoff for each route you log from.
- Expect **dynamic** rendering for routes that call `headers()` for logging.

## Middleware

- **Do not** import the logging library from `middleware.ts`.
- Only set/normalize `x-request-id` on request and response.

## Tests

```bash
npx nx test client-logging
# or the workspace target name chosen when the lib is generated
```
