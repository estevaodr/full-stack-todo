# Contract: `getLogger`

## Import surface

- Exported from `@full-stack-todo/client/logging`.
- Root module chain includes **`server-only`** so accidental Client Component import fails at build time.

## API

```ts
getLogger(contextName: string, options?: { requestId?: string }): Logger
```

- **Route Handlers** (inside `withLogging`): `options` optional — `requestId` taken from ALS when omitted.
- **Server Components**: **must** pass `requestId` from `await headers()` (explicit); do not rely on ALS.

## Rules

- Single pino root instance; children via `logger.child({ context, requestId })` as appropriate.
- No `console.*` for application events in code paths covered by this feature.
