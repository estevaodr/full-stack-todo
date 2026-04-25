# Data model: Client structured logging

Logical entities for this feature (no new persistent database tables).

## LogRecord (emitted event)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `time` | ISO-8601 or epoch ms | Yes | pino default |
| `level` | number (pino) | Yes | Numeric pino level |
| `syslogSeverity` | 0–7 | Yes (production JSON) | Mapped per [contracts/log-schema.md](./contracts/log-schema.md#syslog-severity-mapping-normative-fr-007) |
| `msg` | string | Yes | Human message |
| `requestId` | string (UUID or client-provided safe id) | When in request scope | From ALS or explicit SC arg |
| `context` | string | Often | `getLogger` context name |
| `method` | string | On access log | HTTP method |
| `url` | string | On access log | Path or full URL policy per implementation |
| `statusCode` | number | On access log | HTTP status |
| `responseTimeMs` | number | On access log | Elapsed ms |
| `err` | serialized error | On failure | No stack secrets |

Additional arbitrary structured keys allowed if redaction rules apply.

## CorrelationContext (ALS store)

| Field | Type | Notes |
|-------|------|--------|
| `requestId` | string | Propagated to all child logs in handler |
| `startedAt` | bigint / number | Optional, for `responseTime` |

## RedactionPolicy (configuration)

| Key | Behavior |
|-----|----------|
| Header `authorization` | Value → `[Redacted]` |
| Header `cookie` | Value → `[Redacted]` |
| Object keys `password`, `token`, `accessToken`, `refreshToken` | Value → `[Redacted]` (extend via contract) |

Placeholder literal: **`[Redacted]`** (must match across code and tests).

## Relationships

- One **HTTP request** (Route Handler invocation) → one **CorrelationContext** instance for lifetime of `withLogging` wrap.
- Many **LogRecord** rows may reference the same `requestId` within that lifetime.
