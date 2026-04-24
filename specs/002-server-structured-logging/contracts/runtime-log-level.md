# Contract: Runtime `LOG_LEVEL` observable semantics (**FR-005**)

Extends **FR-005**, **SC-004 (b)**, [research.md](../research.md) (sync loop).

## Sync model

- Implementation reads **`process.env.LOG_LEVEL`** on a **periodic sync** (default interval **1 second** unless **plan.md** documents otherwise).
- After each sync tick completes, the root pino **minimum level** MUST match the **normalized** allowed token read from env at that tick (or the default `info` when unset as per Joi/runtime rules).
- If at a tick the value is **set** but **not** in the allowed set after the same normalization rules as startup, the tick is a **no-op** for level changes: keep the **previous tick’s** successfully applied minimum level (**sticky last-good**). This differs from **startup** invalid `LOG_LEVEL`, which MUST fail fast (**FR-014**, [scenario-coverage.md](./scenario-coverage.md) §**CHK017**).

## Caching (allowed)

Implementations MAY cache the last applied level **in memory** between ticks **only if** the following **observable invariant** holds:

> **I1:** For any allowed value `V` written to `process.env.LOG_LEVEL`, after test or runtime time advances **strictly past the end of the first sync tick** whose read observed `V` (e.g. fake timers fire the interval once), log calls at severities **enabled** under `V` behave as pino would for minimum level `V`, and severities **disabled** under `V` do **not** emit to stdout.

No requirement to re-read env on **every** single `log.info()` call if **I1** is satisfied.

## “Subsequent log evaluations”

Means: log API invocations handled **after** the sync tick described in **I1** has completed for the current `V` — not “immediately on next microtask” unless the sync runs that often.

## Tests

- **SHOULD** use **fake timers**: mutate `process.env.LOG_LEVEL` → advance time by **≥ one sync interval** → assert emit/suppress behavior (**tasks** T016).
- Manual runbooks MAY use wall-clock wait per **SC-004** quickstart.
