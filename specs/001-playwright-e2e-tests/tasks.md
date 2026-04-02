# Tasks: Playwright E2E Tests

**Input**: Design documents from `/specs/001-playwright-e2e-tests/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize standard Nx Playwright E2E application (`apps/client-e2e`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Configure Playwright `webServer` in `apps/client-e2e/playwright.config.ts` to boot backend and frontend targets automatically
- [x] T003 Implement global authentication fixture caching in `apps/client-e2e/src/fixtures/auth.setup.ts` to avoid UI login overhead

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication E2E Flows (Priority: P1) 🎯 MVP

**Goal**: Users must be able to securely register, login, and experience proper error handling for authentication limits to access their tasks.

**Independent Test**: Can be independently tested by registering a new account and logging in without needing any preexisting data.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create `register.page.ts` POM in `apps/client-e2e/src/pages/register.page.ts`
- [x] T005 [P] [US1] Create `login.page.ts` POM in `apps/client-e2e/src/pages/login.page.ts`
- [x] T006 [US1] Create core test file `apps/client-e2e/src/e2e/auth.spec.ts`
- [x] T007 [US1] Implement registration success and duplicate error scenarios in `auth.spec.ts`
- [x] T008 [US1] Implement login success and invalid credential scenarios in `auth.spec.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Lifecycle E2E Flows (Priority: P2)

**Goal**: Authenticated users must be able to add, complete, and delete their tasks successfully with changes reflected in real-time UI states and persisted on the backend.

**Independent Test**: Can be tested independently given an authenticated session state (via global setup/fixtures).

### Implementation for User Story 2

- [x] T009 [P] [US2] Create `dashboard.page.ts` POM in `apps/client-e2e/src/pages/dashboard.page.ts`
- [x] T010 [US2] Create core test file `apps/client-e2e/src/e2e/tasks.spec.ts` utilizing the `auth.setup.ts` fixture
- [x] T011 [US2] Implement task creation scenario in `tasks.spec.ts`
- [x] T012 [US2] Implement task completion toggle scenario in `tasks.spec.ts`
- [x] T013 [US2] Implement task deletion scenario in `tasks.spec.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Security & Protected Routes (Priority: P3)

**Goal**: The application must ensure that unauthorized users cannot access protected views like the dashboard.

**Independent Test**: Can be tested independently by navigating completely unauthenticated.

### Implementation for User Story 3

- [x] T014 [US3] Create core test file `apps/client-e2e/src/e2e/security.spec.ts`
- [x] T015 [US3] Implement unauthenticated navigation dashboard redirect scenario in `security.spec.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 Verify `apps/client-e2e` execution runs all tests under 3 minutes
- [x] T017 Validate configuration produces trace files and screenshots for failure debugging
- [x] T018 Patch `apps/client/src/lib/api-client.ts` to favor `body.message` for descriptive error handling
- [x] T019 Implement `waitForResponse` pattern in `tasks.spec.ts` to synchronize with Optimistic UI reloads
- [x] T020 Robustify `DashboardPage` POM with default descriptions to satisfy backend DTO constraints

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses the seeded test state from global setup infrastructure
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- POM classes before integration logic tests
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational POM tasks marked [P] can run in parallel (within their phase)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch Models for User Story 1 together:
Task: "Create `register.page.ts` POM in `apps/client-e2e/src/pages/register.page.ts`"
Task: "Create `login.page.ts` POM in `apps/client-e2e/src/pages/login.page.ts`"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently
3. Add User Story 2 → Test independently
4. Add User Story 3 → Test independently
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
