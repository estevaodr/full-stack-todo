# Contract: Startup configuration errors (**FR-014**, **FR-015**, **FR-010**)

> Env validation **timing** (startup fail-fast vs running-process behavior) — [scenario-coverage.md](./scenario-coverage.md) §**CHK017**. **Library** (Joi v1, swaps) — [environment.md](./environment.md) §**Startup validation library** (**CHK025**).

## What v1 **does not** require

- **No** fixed **exit code** beyond **non-zero** (implementation may use `1` or platform default).
- **No** JSON, syslog, or NDJSON shape on **stderr** for these messages (structured logger may be unavailable).
- **No** mandated substring, regex, or locale for the message body beyond **human-readable** and **actionable** (see below).

## Minimum clarity (SHOULD for reviewers / ops)

The stderr (or plan-documented non-`console`) text **SHOULD** make obvious:

1. **Which** variable failed: at least **`LOG_LEVEL`** or **`LOG_FORMAT`** (or `NODE_ENV` if validation fails there).
2. **That** the value was rejected vs startup rules (invalid / out of allowed set).
3. **Where** to look next: e.g. allowed tokens `{fatal,…,trace}` or `{json,pretty,auto}`, or a pointer to [environment.md](./environment.md) / `.env.example`.

Joi (or equivalent) default messages satisfy (1)–(2) when they include the var name and constraint; teams MAY tighten copy in implementation without changing this contract.

## Channel

- **stderr** via `process.stderr.write` (or equivalent non-`console` channel per **FR-010**) until a logger exists; same channel acceptable after failure before exit.
