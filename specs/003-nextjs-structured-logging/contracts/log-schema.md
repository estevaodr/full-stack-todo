# Contract: Production log line (NDJSON)

## Line format

- One **JSON object** per line (newline-delimited).
- UTF-8 encoding.

## SC-003 ingestion validation (structural)

Applies to **production** NDJSON lines only (not pretty dev output). **Automated ingestion validation** for this success criterion means: split capture on newlines; for each **non-blank** line, run **`JSON.parse`** on the whole line as a single value.

| Outcome | Counts as |
|--------|-----------|
| **Pass** | Parsed value is a plain **object** that includes all of **`level`**, **`syslogSeverity`**, **`time`**, **`msg`** (see [Required fields](#required-fields-production-access--app-log)). Extra keys allowed. |
| **Structural parse failure** | Blank line; line contains **more than one** top-level JSON value; **`JSON.parse` throws**; root is array/primitive/null; **any** of the four required fields **absent**. |

**Out of scope for SC-003’s parse metric** (do not count as structural failure): semantically wrong `msg`; optional fields missing (`requestId` on non-access lines); redaction policy breaches; correlation mismatches — those are separate tests.

**Example shape** (non-normative): [log-line.example.json](./log-line.example.json).

## Syslog severity mapping (normative, FR-007)

**Authoritative table** — `spec.md` §FR-007, `research.md`, and code MUST match this mapping for `syslogSeverity` (RFC 5424 severity 0–7 on the log record).

| Application / pino level | `syslogSeverity` | RFC 5424 name (informative) |
|--------------------------|------------------|-----------------------------|
| `trace` | 7 | Debug |
| `debug` | 7 | Debug |
| `info` | 6 | Informational |
| `warn` | 4 | Warning |
| `error` | 3 | Error |
| `fatal` | 2 | Critical |

## Required fields (production access / app log)

Minimum for any emitted line:

| Field | Type | Description |
|-------|------|-------------|
| `level` | number | Pino numeric level |
| `syslogSeverity` | 0–7 | See **Syslog severity mapping** above |
| `time` | number or string | Epoch ms or ISO per pino config |
| `msg` | string | Message |

When inside a wrapped Route Handler request:

| Field | Type |
|-------|------|
| `requestId` | string |
| `context` | string (optional but recommended) |

Access / request completion line from `withLogging` additionally includes:

| Field | Type |
|-------|------|
| `method` | string |
| `url` | string |
| `statusCode` | number | Always set on access lines, including **handler throw** paths (**500** default when no response status; see [with-logging.md](./with-logging.md)) |
| `responseTimeMs` | number |

## Canonical `url` field (FR-002)

On access / request-completion lines, **`url`** MUST be **pathname + search** only: a path-absolute string starting with `/`, plus an optional `?…` query, derived from the active request URL **without** scheme or host (no `https://` prefix). Same field in **production** NDJSON and **development** pretty output.

## Example

See [log-line.example.json](./log-line.example.json) (optional file — create during implementation if desired).
