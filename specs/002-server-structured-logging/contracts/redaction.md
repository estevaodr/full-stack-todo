# Contract: Redaction placeholder (`apps/server`)

Extends **FR-007**, **SC-003**.

## Literal placeholder

Every redacted secret value written to **stdout** (or any structured log field governed by **FR-007**) MUST use **exactly** this string:

```text
[Redacted]
```

- **No** alternate spellings (`[REDACTED]`, `***`, `<redacted>`, etc.) for acceptance.
- Applies to: HTTP **`Authorization`** header value when present in serialized request data, and to each **`password`** own-property value (any nesting depth) in logged body snapshots per **FR-007**.

## `password` walk: own-properties, arrays, prototypes (**FR-007**)

Aligns clarification **B** with observable tests (nested objects, edge shapes).

| Case | Requirement |
|------|----------------|
| **Own** key `password` on a **plain object** | Value replaced with `[Redacted]` before serialization to stdout. |
| **Nesting** | Walk **depth-first** into nested **plain objects** and **arrays**; at each object, apply row above to own keys only. |
| **Array elements** | If `body` (or logged snapshot) is an array, each **object element** is walked the same way; e.g. `[{ "password": "x" }]` → inner value **MUST** redact. |
| **Array indices named `password`** | Keys are numeric strings in JSON; **only** string key exactly **`password`** matches **FR-007** (not `"0"`). |
| **Prototype / inherited `password`** | **MUST NOT** be required to redact keys that are **not** own properties of the current object (`Object.prototype` / chain). Only **own** properties count. |
| **Non-plain values** (e.g. `Date`, `Buffer`) as the value of an own `password` key | Replace with `[Redacted]`; **MUST NOT** serialize raw contents of that value to stdout. |
| **`Map` / `Set` / custom class`** in snapshot | If serializer turns them into plain JSON, apply same rules on the **serialized tree**; if omitted from snapshot, no extra obligation. |

## Scope note

This contract does **not** require logging full request bodies; when the pipeline omits or truncates body data, redaction rules apply only to **what is serialized**.
