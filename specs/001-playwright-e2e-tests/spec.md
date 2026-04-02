# Feature Specification: Playwright E2E Tests

**Feature Branch**: `001-playwright-e2e-tests`  
**Created**: 2026-04-01
**Status**: Draft  
**Input**: User description: "Please define and create the e2e test for apps using playwright"

## Clarifications

### Session 2026-04-01
- Q: Setup and execution orchestration of the E2E environment. → A: Option A - Use Playwright's webServer config to automatically start the specific Nx app dev targets before tests.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authentication E2E Flows (Priority: P1)

Users must be able to securely register, login, and experience proper error handling for authentication limits to access their tasks.

**Why this priority**: Without authentication, no user data can be isolated or managed. It's the primary gateway to the application.

**Independent Test**: Can be independently tested by registering a new account and logging in without needing any preexisting data.

**Acceptance Scenarios**:

1. **Given** I am on the registration page, **When** I enter a valid email and strong password, **Then** I should be redirected to the dashboard with a success message.
2. **Given** an account already exists with the email, **When** I try to register with it, **Then** I should see an "Email already in use" error.
3. **Given** I am on the login page, **When** I enter invalid credentials, **Then** I should see an "Invalid credentials" error.
4. **Given** I have a registered account, **When** I enter valid credentials, **Then** I should be redirected to the dashboard.

---

### User Story 2 - Task Lifecycle E2E Flows (Priority: P2)

Authenticated users must be able to add, complete, and delete their tasks successfully with changes reflected in real-time UI states and persisted on the backend.

**Why this priority**: Task management is the core value proposition of the application.

**Independent Test**: Can be tested independently given an authenticated session state (via global setup/fixtures).

**Acceptance Scenarios**:

1. **Given** I am logged into the dashboard, **When** I enter "Finish documentation" and press "Add Task", **Then** the task should appear in my list and the count should increase.
2. **Given** I have a task "Finish documentation", **When** I click the checkbox next to it, **Then** the task should be visually marked as completed.
3. **Given** I have a task "Finish documentation", **When** I click the delete icon, **Then** the task should be removed and a confirmation message displayed.

---

### User Story 3 - Security & Protected Routes (Priority: P3)

The application must ensure that unauthorized users cannot access protected views like the dashboard.

**Why this priority**: Privacy and security must be enforced by the client layout and routing. 

**Independent Test**: Can be tested independently by navigating completely unauthenticated.

**Acceptance Scenarios**:

1. **Given** I am not logged in, **When** I attempt to navigate to `/dashboard`, **Then** I should be redirected to the `/login` page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automate testing for the User Registration and Login processes.
- **FR-002**: System MUST automate testing for creating, completing, and deleting tasks.
- **FR-003**: System MUST execute E2E tests using the Playwright framework against the running frontend and backend APIs.
- **FR-004**: System MUST use Global Setup or Fixtures to manage authentication states effectively across tests (e.g., seeding a user state directly to avoid UI login overhead in task tests).
- **FR-005**: System MUST utilize user-facing Locators (`getByRole`, `getByLabel`, `getByText`) rather than CSS or XPath.
- **FR-006**: System MUST configure Playwright's `webServer` setting to automatically start and stop the required Nx dev server targets during the test lifecycle.
- **FR-007**: System MUST inject the shell's `PATH` and set `cwd` to the workspace root in the `webServer` command to prevent `ENOENT` errors when Nx spawns child processes (Turbopack, etc.).
- **FR-008**: System MUST wait for the backend API health check (e.g., `/api/v1`) to be reachable before resolving the `webServer` ready state.

### Key Entities *(include if feature involves data)*

- **Playwright Test Suite**: The structured collection of E2E scripts ensuring application health.
- **Page Object Models**: Encapsulated classes containing selectors and operations for key pages (Login, Register, Dashboard).

### Edge Cases & Exception Handling (E2E Mitigation)

- **Auth Bounds**: Redirection MUST be enforced on all protected routes (e.g., `/dashboard`, `/settings`), not just `/dashboard` (CHK003). Interacting with an expired session MUST force a redirect to login (CHK004). Server-side rejection of malformed registration payloads MUST surface an explicit error (CHK007). API responses for auth MUST respond within an SLA of 5000ms for E2E wait limits (CHK013).
- **Task Resilience**: Task state changes MUST be evaluated only after server confirmation (CHK002). If backend throws 500 on creation or deletion, the UI MUST revert/notify appropriately (CHK005, CHK006). Rapid, concurrent task toggles MUST NOT corrupt the UI state (CHK010). **E2E assertions MUST explicitly wait for network response resolution (`waitForResponse`) before navigation/reloads to prevent premature cancellation of optimistic UI updates.**
- **UI Bounds**: The dashboard MUST have an explicit zero-state graphic when no tasks exist (CHK008). Presentation bounds MUST limit visible items and handle scrolling deterministically in E2E (CHK009). Polling expectations for asynchronous task mutations MUST be capped at standard Playwright SLA (CHK011, CHK012). **Backend validation constraints (e.g., required descriptions) MUST be satisfied by standard Page Object defaults to avoid brittle 400 errors.**

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of defined BDD scenarios from `docs/test/BDD_SCENARIOS.md` are mapped to passing automated E2E tests.
- **SC-002**: Test suite runs and completes successfully against a local or staging environment in under 3 minutes.
- **SC-003**: No tests exhibit flakiness (>95% pass rate across multiple sequential local runs).
- **SC-004**: Test execution produces meaningful trace files and screenshots for any failure points.

## Assumptions

- Playwright and necessary browsers can be seamlessly integrated into the Nx monorepo (via `@nx/playwright` or directly).
- The development/test server and database can be spun up deterministically before test execution.
- We will be creating an `apps/client-e2e` project (or similar standard Nx Playwright app) for isolating E2E code away from the client application.
