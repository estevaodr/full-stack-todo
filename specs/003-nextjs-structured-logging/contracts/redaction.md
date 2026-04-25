# Contract: Redaction

## Placeholder

All redacted scalar values become the literal string: **`[Redacted]`**

## HTTP headers (Web `Headers` / Request)

- **`authorization`** (case-insensitive name match, e.g. `Authorization` vs `authorization`): entire field value redacted if logged via serializers or explicit merge.
- **`cookie`** (case-insensitive): entire field value redacted.

Implementations MUST treat these header names as **case-insensitive** when matching on `Headers` / incoming metadata.

## Object keys (case-sensitive unless implementation documents case-insensitivity)

**Closed set for SC-002 / redaction acceptance** (minimum four keys; extend in code + document additions here in PRs):

- `password`
- `token`
- `accessToken`
- `refreshToken`

Extend list in code with single source constant; document additions here in PR.

## Nested objects and depth

- Redaction traverses **nested plain objects** up to **depth 10** (root = depth 0). Deeper nodes are **not** traversed for key-based redaction (parent object still emitted; deep subtree may omit redaction — avoid logging secrets below depth limit).
- **Arrays**: each element inspected — **objects** get the same key-based redaction; **strings** are not pattern-scanned unless a field is itself an object with contract keys.

## Body logging

- **Default**: do not log raw request bodies.
- If a handler logs a parsed JSON object, redaction applies per **Nested objects and depth** and **Object keys** above (not shallow-only).

## Volume / performance (pointers)

- **Full bodies**: default **off** (see above). **NFR-LOG-001** in [spec.md](../spec.md#non-functional-requirements-logging-volume-v1).
- **Correlation header size**: bounded by middleware validation — [middleware-request-id.md](./middleware-request-id.md#validation-rules-normative) (**NFR-LOG-002** in spec).

## Tests

- Golden strings: secret substrings must **not** appear in captured stdout for controlled fixtures.
