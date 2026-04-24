# Contract: Application logger injection (**FR-008**)

Unifies **FR-008** with Assumptions / stakeholder **Input** so there is a single approved pattern and no token drift.

## Approved pattern (v1)

| Element | Requirement |
|---------|----------------|
| **Type** | **`PinoLogger`** from **`nestjs-pino`** (import path per implementation; one module, no second app logger type). |
| **Injection** | **`@InjectPinoLogger(MyClass.name)`** where **`MyClass`** is the **host** injectable (service, controller, etc.). Token string MUST equal that class’s **`name`** at runtime (same as FR-008 “owning class name”). |
| **Usage** | Call severity methods on the injected instance (`info`, `error`, …) so messages go through the structured pipeline. |

This matches Assumptions: *`PinoLogger` + `@InjectPinoLogger(ServiceName.name)`*.

## Forbidden in `apps/server` application sources

- **`new Logger(...)`** from **`@nestjs/common`**.
- Using **`Logger`** from **`@nestjs/common`** (static methods or instances) as the **primary** logger for application/feature log lines that must appear in the pino-backed stream.

## Allowed (not a conflict with FR-008)

- **`NestFactory.create(..., { logger: <Nest LoggerService backed by pino> })`** and other **bootstrap** wiring that assigns Nest’s abstract logger to pino — not an “application service” obtaining a legacy `Logger` for business logs.
- **`LoggingInterceptor`** and infrastructure that log via the same **pino** pipeline without using `@nestjs/common` **`Logger`** for application semantics.

## Tests

Same rules apply under **`apps/server`** test files for code they own (**FR-010** / **SC-005**); use **`PinoLogger`** or test doubles that do not introduce **`console.*`** or **`new Logger()`**.
