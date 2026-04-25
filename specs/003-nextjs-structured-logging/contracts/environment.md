# Contract: Logging environment variables

**Single source of truth** for **`NODE_ENV`**, **`LOG_LEVEL`**, and **`LOG_FORMAT`** in this feature. [spec.md](../spec.md), [plan.md](../plan.md), and [quickstart.md](../quickstart.md) **cite this file** for normative names and semantics; duplicate definitions elsewhere MUST match or be removed.

## Variables

### `NODE_ENV`

- **Values**: `production` | `development` (other values: treat as `development` for **`LOG_FORMAT=auto`** resolution, or fail-fast if validation is added).
- **Role**: With `LOG_FORMAT=auto`, **`NODE_ENV===production`** → JSON; otherwise pretty path (see **`LOG_FORMAT`**).
- **Default (typical)**: `development` in local Next dev; production builds set `production` — match Next’s conventions when unset in dev.

### `LOG_LEVEL`

- **Values**: `fatal` | `error` | `warn` | `info` | `debug` | `trace` (lowercase).
- **Default**: `info`.
- **Invalid**: Fail-fast at logger bootstrap **or** clamp to `info` — pick one and test (plan: fail-fast preferred for parity with server).

### `LOG_FORMAT`

- **Values**: `json` | `pretty` | `auto`.
- **Default**: `auto`.
- **Resolution**: If `json` → NDJSON stdout. If `pretty` → pino-pretty transport. If `auto` → `json` when `NODE_ENV===production`, else `pretty`.

## Bootstrap

- All resolution happens when the root logger module is first evaluated (server-side).
- **No** reading these from Edge middleware.
