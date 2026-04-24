# Data model: Structured logging (002-server-structured-logging)

This feature is **observability infrastructure**, not domain persistence. Entities below are **logical** (what appears in logs and context), not TypeORM tables.

## Request context (ALS)

| Field | Type | Source | Notes |
|-------|------|--------|------|
| `reqId` | string | `x-request-id` header or `randomUUID()` | Stable for one HTTP request lifecycle |
| (optional) `method` | string | Express/Nest request | Only if needed for uniform access logs |
| (optional) `url` | string | sanitized path | Avoid logging querystrings with secrets |

**Validation / rules**

- Must not leak across concurrent requests (**FR-012**).
- Non-HTTP scopes: store may be empty; callers must tolerate missing `reqId`.

## Log record (stdout JSON, production)

| Field | Type | Required | Notes |
|-------|------|----------|------|
| `level` | number | yes | Normative mapping per [log-schema.md](./contracts/log-schema.md) §**RFC 5424 semantics ↔ pino numeric `level`** (**CHK026**) |
| `time` | epoch ms | yes | Canonical instant (**NFR-002** / **CHK024**); clock skew & NTP out of scope; no required timezone string field on JSON lines |
| `msg` | string | yes | human message |
| `reqId` | string | for HTTP-related entries | Per **FR-006** naming lock in implementation |
| `context` | string | often | Nest context / service name when using Nest logger adapter |
| `err` | object | when error | Serialized error with stack |

**Redaction**

- `Authorization` header value → `[Redacted]` before emit.
- Any nested JSON key exactly `password` → `[Redacted]` in serialized body snapshots.
- Optional body previews on stdout: **≤ 8192 UTF-8 bytes** per **NFR-001** / [http-request-logging.md](./contracts/http-request-logging.md) §**Serialization limits**.

## Configuration (validated env)

| Name | Values | Default | Notes |
|------|--------|---------|------|
| `NODE_ENV` | `production`, `development`, … | `development` (Joi) | Drives `LOG_FORMAT=auto` resolution |
| `LOG_FORMAT` | `json`, `pretty`, `auto` | `auto` | Empty → `auto`; invalid → fail fast (**FR-015**) |
| `LOG_LEVEL` | `fatal`…`trace` | `info` | Invalid **at startup** → fail fast (**FR-014**); while running, invalid tokens ignored per tick (sticky last-good); valid changes via in-process env + sync (**FR-005**, [scenario-coverage.md](./contracts/scenario-coverage.md) §**CHK017**) |

## Relationships

- **HTTP request** `1` —has— `1` **Request context** (ALS) for request duration.
- **Log record** `N` —may-reference— `1` **Request context** (`reqId` correlation).
