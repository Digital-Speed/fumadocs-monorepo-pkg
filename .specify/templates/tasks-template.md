---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Verification**: This project uses AUTOMATED VERIFICATION (type checking, linting, building) instead of manual test writing. Tasks should include verification checkpoints using `bun run check-types`, `bun lint`, and `bun build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Turborepo Monorepo**: All paths relative to workspace roots
- **Apps**: `apps/web/` (Next.js application on port 3000)
- **Packages**: `packages/docs/`, `packages/ui/`, `packages/eslint-config/`, `packages/typescript-config/`
- **Specify workspace** in task descriptions (e.g., "in packages/docs/app/page.tsx")

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Workspace configuration and dependencies (for NEW workspaces only - skip if modifying existing)

- [ ] T001 Create package structure in apps/ or packages/ per implementation plan
- [ ] T002 Initialize package.json with dependencies and Turbo integration
- [ ] T003 [P] Configure TypeScript extends from @repo/typescript-config
- [ ] T004 [P] Configure ESLint extends from @repo/eslint-config
- [ ] T005 Update root turbo.json if adding new tasks (maintain pipeline dependencies)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T006 Create base component structure or layout in target workspace
- [ ] T007 [P] Setup shared types/interfaces used across multiple stories
- [ ] T008 [P] Configure Next.js routing structure (App Router)
- [ ] T009 Setup environment configuration and build-time constants
- [ ] T010 Run initial verification: `bun run check-types && bun lint && bun build --filter=[workspace]`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Verification**: [How to verify this story works - e.g., "Run `bun dev --filter=web` and navigate to /feature"]

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create [Component1] in [workspace]/components/[name].tsx
- [ ] T012 [P] [US1] Create [Component2] in [workspace]/components/[name].tsx
- [ ] T013 [US1] Implement [Page/Route] in [workspace]/app/[route]/page.tsx
- [ ] T014 [US1] Add TypeScript types/interfaces in [workspace]/types/[name].ts
- [ ] T015 [US1] Integrate components into page layout
- [ ] T016 [US1] Add error boundaries and loading states

### Verification for User Story 1 ⚠️

- [ ] T017 [US1] Run `bun run check-types --filter=[workspace]` - MUST pass with 0 errors
- [ ] T018 [US1] Run `bun lint --filter=[workspace]` - MUST pass with 0 warnings
- [ ] T019 [US1] Run `bun build --filter=[workspace]` - MUST complete successfully
- [ ] T020 [US1] Manual browser verification of user story acceptance criteria

**Checkpoint**: At this point, User Story 1 should be fully functional and verified independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Verification**: [How to verify this story works on its own]

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create [Component] in [workspace]/components/[name].tsx
- [ ] T022 [US2] Implement [Page/Route] in [workspace]/app/[route]/page.tsx
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

### Verification for User Story 2 ⚠️

- [ ] T024 [US2] Run `bun run check-types --filter=[workspace]` - MUST pass
- [ ] T025 [US2] Run `bun lint --filter=[workspace]` - MUST pass
- [ ] T026 [US2] Run `bun build --filter=[workspace]` - MUST complete
- [ ] T027 [US2] Manual verification of user story acceptance criteria

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Verification**: [How to verify this story works on its own]

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create [Component] in [workspace]/components/[name].tsx
- [ ] T029 [US3] Implement [Page/Route] in [workspace]/app/[route]/page.tsx
- [ ] T030 [US3] Integration work (if dependencies on US1/US2)

### Verification for User Story 3 ⚠️

- [ ] T031 [US3] Run `bun run check-types --filter=[workspace]` - MUST pass
- [ ] T032 [US3] Run `bun lint --filter=[workspace]` - MUST pass
- [ ] T033 [US3] Run `bun build --filter=[workspace]` - MUST complete
- [ ] T034 [US3] Manual verification of user story acceptance criteria

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates (README, inline comments)
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization (bundle size, build time)
- [ ] TXXX Accessibility improvements (ARIA, keyboard nav)
- [ ] TXXX Final monorepo-wide verification: `bun run check-types && bun lint && bun build`
- [ ] TXXX Update turbo.json if any new caching patterns needed

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all component creation tasks for User Story 1 together:
Task: "Create [Component1] in packages/docs/components/[name1].tsx"
Task: "Create [Component2] in packages/docs/components/[name2].tsx"

# Run all verification commands for a workspace together:
Task: "Run bun run check-types --filter=docs"
Task: "Run bun lint --filter=docs"
Task: "Run bun build --filter=docs"
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
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and verifiable
- Run verification commands (`check-types`, `lint`, `build`) after implementation
- Use Turbo filters (`--filter=workspace`) for targeted verification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- NO manual test writing - rely on TypeScript, ESLint, and build process for quality gates
