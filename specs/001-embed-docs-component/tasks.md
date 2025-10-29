# Tasks: Embed Documentation as Component

**Input**: Design documents from `/specs/001-embed-docs-component/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Verification**: This project uses AUTOMATED VERIFICATION (type checking, linting, building) instead of manual test writing. Tasks include verification checkpoints using `bun run check-types`, `bun lint`, and `bun build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Turborepo Monorepo**: All paths relative to workspace roots
- **Apps**: `apps/web/` (Next.js application on port 3000)
- **Packages**: `packages/docs/` (Fumadocs documentation app)
- **Specify workspace** in task descriptions (e.g., "in packages/docs/app/page.tsx")

---

## Phase 0: Next.js 16 Migration (apps/web only)

**Purpose**: Upgrade apps/web from Next.js 15.5 to 16.0 to match packages/docs version

**⚠️ CRITICAL**: Complete before Phase 1. This ensures version alignment across monorepo.

### Migration Tasks

- [X] T001 Update apps/web/package.json: Change `"next": "^15.5.0"` to `"next": "16.0.0"` (will be replaced by catalog in Phase 1)
- [X] T002 Update apps/web/package.json: Change `"react": "^19.1.0"` to `"react": "19.2.0"`
- [X] T003 Update apps/web/package.json: Change `"react-dom": "^19.1.0"` to `"react-dom": "19.2.0"`
- [X] T004 Run `bun install` to update dependencies
- [X] T005 Run Next.js 16 async params codemod: `npx @next/codemod@canary next-async-request-api` (auto-migrates params/searchParams to async)
- [X] T006 Remove custom webpack configuration from apps/web/next.config.js (Turbopack is now default, no Redoc compatibility needed)
- [X] T007 Verify apps/web/next.config.js is minimal (only essential config remains)
- [X] T008 Run verification: `bun run check-types --filter=web && bun lint --filter=web`
- [X] T009 Test apps/web dev server: `cd apps/web && bun dev --port 3000` - verify app starts without errors
- [X] T010 Test apps/web build: `cd apps/web && bun build` - verify build completes successfully

**Checkpoint**: apps/web successfully migrated to Next.js 16.0.0 with Turbopack

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure Bun catalog for version pinning and update Turbo pipeline

### Bun Catalog Configuration

- [X] T011 Add Bun workspaces catalog to root package.json with exact syntax:
  ```json
  "workspaces": {
    "packages": ["apps/*", "packages/*"],
    "catalog": {
      "next": "16.0.0",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "typescript": "5.9.3"
    }
  }
  ```

- [X] T012 [P] Update apps/web/package.json to reference catalog versions:
  ```json
  "dependencies": {
    "next": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
  ```

- [X] T013 [P] Update packages/docs/package.json to reference catalog versions:
  ```json
  "dependencies": {
    "next": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
  ```

- [X] T014 Run `bun install` to sync workspace dependencies with catalog versions
- [X] T015 Verify catalog versions applied: `bun pm ls | grep -E "(next|react|typescript)"` - all should show aligned versions

### Turbo Pipeline Configuration

- [X] T016 Update turbo.json to ensure packages/docs builds before apps/web (verify `"dependsOn": ["^build"]` exists in build task)
- [X] T017 Run initial verification: `bun run check-types && bun lint`

**Checkpoint**: Version alignment via Bun catalog configured, Turbo pipeline updated

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Fumadocs Source Export Setup

- [X] T018 Create packages/docs/lib/ directory
- [X] T019 Create packages/docs/source.config.ts with Fumadocs MDX configuration:
  ```typescript
  import { defineDocs } from 'fumadocs-mdx/config';
  export const docs = defineDocs({ dir: 'content/docs' });
  ```

- [X] T020 Create packages/docs/lib/source.ts to create and export Fumadocs source:
  ```typescript
  import { loader } from 'fumadocs-core/source';
  import { createMDXSource } from 'fumadocs-mdx/runtime/next';
  import { docs } from '../source.config';

  export const source = loader({
    baseUrl: '/docs',
    source: createMDXSource(docs),
  });
  ```

- [X] T021 Create packages/docs/lib/index.ts with source export only:
  ```typescript
  export { source } from './source';
  ```

- [X] T022 Update packages/docs/package.json to add exports field:
  ```json
  "exports": {
    ".": "./lib/index.ts"
  }
  ```

### Workspace Dependency Linking

- [X] T023 Add packages/docs as dependency in apps/web/package.json: `"docs": "*"` (workspace protocol)
- [X] T024 Add fumadocs-ui dependencies to apps/web/package.json:
  ```json
  "dependencies": {
    "fumadocs-ui": "16.0.5",
    "fumadocs-core": "16.0.5"
  }
  ```

- [X] T025 Configure apps/web/next.config.js to transpile packages/docs:
  ```javascript
  const nextConfig = {
    transpilePackages: ['docs'],
  };
  export default nextConfig;
  ```

- [X] T026 Run `bun install` to link workspace dependencies
- [X] T027 Run foundational verification: `bun run check-types --filter=web && bun run check-types --filter=docs`

**Checkpoint**: Foundation ready - source export configured, workspace dependencies linked

---

## Phase 3: User Story 1 - View Documentation with Unified Layout (Priority: P1) 🎯 MVP

**Goal**: Enable users to view Fumadocs documentation within apps/web layout (header + footer wrapping docs content)

**Independent Verification**: Navigate to `http://localhost:3000/docs` and verify Fumadocs renders within apps/web layout with header above and footer below

### Layout Components

- [X] T028 [P] [US1] Create apps/web/components/ directory if it doesn't exist
- [X] T029 [P] [US1] Create apps/web/components/Header.tsx with simple header component:
  ```typescript
  export default function Header() {
    return <header className="border-b p-4">
      <nav>Site Header</nav>
    </header>;
  }
  ```

- [X] T030 [P] [US1] Create apps/web/components/Footer.tsx with simple footer component:
  ```typescript
  export default function Footer() {
    return <footer className="border-t p-4 mt-8">
      <p>Site Footer</p>
    </footer>;
  }
  ```

- [X] T031 [US1] Update apps/web/app/layout.tsx to import and render Header and Footer wrapping {children}

### Documentation Route Setup (Next.js 16 Async Params Pattern)

- [X] T032 [US1] Create apps/web/app/docs/ directory
- [X] T033 [US1] Create apps/web/app/docs/[[...slug]]/ directory (optional catch-all route)
- [X] T034 [US1] Create apps/web/app/docs/[[...slug]]/page.tsx with Next.js 16 async params pattern:
  ```typescript
  import { source } from 'docs';
  import { DocsPage, DocsBody } from 'fumadocs-ui/page';
  import { notFound } from 'next/navigation';
  import type { Metadata } from 'next';

  interface PageProps {
    params: Promise<{ slug?: string[] }>;
  }

  export function generateStaticParams() {
    return source.generateParams();
  }

  export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;  // ✅ Await params in Next.js 16
    const page = source.getPage(slug);
    if (!page) return {};
    return {
      title: page.data.title,
      description: page.data.description,
    };
  }

  export default async function Page({ params }: PageProps) {
    const { slug } = await params;  // ✅ Await params in Next.js 16
    const page = source.getPage(slug);
    if (!page) notFound();

    return (
      <DocsPage toc={page.data.toc}>
        <DocsBody>{page.data.body}</DocsBody>
      </DocsPage>
    );
  }
  ```

- [X] T035 [US1] Add inline code comments in apps/web/app/docs/[[...slug]]/page.tsx explaining:
  - "Imports source from packages/docs workspace package"
  - "Imports Fumadocs UI components directly from fumadocs-ui"
  - "Async params pattern required for Next.js 16"

### Verification for User Story 1 ⚠️

- [X] T036 [US1] Run `bun run check-types --filter=web` - MUST pass with 0 errors
- [X] T037 [US1] Run `bun run check-types --filter=docs` - MUST pass with 0 errors
- [X] T038 [US1] Run `bun lint --filter=web` - MUST pass with 0 warnings
- [X] T039 [US1] Run `bun build --filter=docs` - MUST complete successfully
- [X] T040 [US1] Run `bun build --filter=web` - MUST complete successfully
- [X] T041 [US1] Start dev server (`bun dev`) and manually verify `/docs` route renders with header and footer
- [X] T042 [US1] Navigate to `/docs` and verify Fumadocs content renders within apps/web layout
- [X] T043 [US1] Test Fumadocs navigation (sidebar, search) works correctly when embedded

**Checkpoint**: User Story 1 fully functional - MVP complete and ready for transfer to larger monorepo

---

## Phase 4: User Story 2 - Hot Reload During Development (Priority: P2)

**Goal**: Ensure hot reload works for changes to both packages/docs content and apps/web layout

**Independent Verification**: Run `bun dev`, modify packages/docs/content/*.mdx or apps/web/components/Header.tsx, verify browser auto-updates in <3 seconds

### Implementation for User Story 2

- [X] T044 [US2] Verify transpilePackages configuration in apps/web/next.config.js includes 'docs' package
- [X] T045 [US2] Test hot reload: Modify a packages/docs content file and observe browser update (<3 seconds)
- [X] T046 [US2] Test hot reload: Modify apps/web/components/Header.tsx and observe browser update (<3 seconds)
- [X] T047 [US2] Test hot reload: Modify packages/docs/lib/source.ts and verify rebuild triggers

### Verification for User Story 2 ⚠️

- [X] T048 [US2] Run `bun dev` and measure hot reload time for packages/docs changes (target: <3 seconds per SC-002)
- [X] T049 [US2] Run `bun dev` and measure hot reload time for apps/web changes (target: <3 seconds per SC-002)
- [X] T050 [US2] Verify no console errors or warnings during hot reload in browser dev tools
- [X] T051 [US2] Verify Turbopack HMR metrics in console (should show fast update times)
- [X] T052 [US2] Run `bun run check-types` across all workspaces - MUST pass
- [X] T053 [US2] Run `bun lint` across all workspaces - MUST pass

**Checkpoint**: User Stories 1 AND 2 both work independently with fast hot reload

---

## Phase 5: User Story 3 - Build and Deploy Unified Application (Priority: P3)

**Goal**: Produce a single production build artifact from apps/web that includes embedded documentation

**Independent Verification**: Run `bun build`, verify apps/web/.next/ contains production build, start production server and verify `/docs` works

### Implementation for User Story 3

- [X] T054 [US3] Verify turbo.json build task includes correct outputs for both workspaces (`.next/**`, `!.next/cache/**`)
- [X] T055 [US3] Run full production build: `bun build` (packages/docs builds first per Turbo dependencies, then apps/web)
- [X] T056 [US3] Verify build output: Check that apps/web/.next/ directory contains production assets
- [X] T057 [US3] Test production build locally: `cd apps/web && bun start` and navigate to `/docs`
- [X] T058 [US3] Verify Turbopack production build metrics (build time, bundle size)
- [X] T059 [US3] Verify static pages generated: Check `.next/server/app/docs/` contains pre-rendered HTML

### Verification for User Story 3 ⚠️

- [X] T060 [US3] Run `bun build` - MUST complete for both packages/docs and apps/web with 0 warnings
- [X] T061 [US3] Run `bun run check-types` after build - MUST pass
- [X] T062 [US3] Run `bun lint` after build - MUST pass
- [X] T063 [US3] Start production server (`cd apps/web && bun start`) and manually verify `/docs` functionality matches development environment
- [X] T064 [US3] Verify all acceptance scenarios from spec.md for User Story 3
- [X] T065 [US3] Test navigation between docs pages in production build
- [X] T066 [US3] Verify search functionality works in production build

**Checkpoint**: All user stories independently functional in both dev and production modes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final documentation

- [ ] T067 [P] Add code comment in packages/docs/lib/index.ts explaining export pattern:
  ```typescript
  /**
   * Public API for embedding Fumadocs in apps/web.
   * Export pattern: Source only (not components).
   * Apps import Fumadocs UI components directly from fumadocs-ui.
   *
   * For transfer to larger monorepo: Copy this pattern exactly.
   */
  export { source } from './source';
  ```

- [ ] T068 [P] Add code comment in apps/web/app/docs/[[...slug]]/page.tsx explaining import pattern:
  ```typescript
  /**
   * Embedding pattern for Fumadocs in Next.js 16 App Router.
   *
   * 1. Import source from packages/docs workspace package
   * 2. Import UI components directly from fumadocs-ui
   * 3. Use async params pattern (Next.js 16 requirement)
   * 4. Access page data via source.getPage(slug)
   *
   * For transfer to larger monorepo: Replicate this file structure.
   */
  ```

- [ ] T069 [P] Create minimal README.md in packages/docs/lib/ documenting the export pattern:
  ```markdown
  # Fumadocs Export Pattern

  This directory exports the Fumadocs source for consumption by apps/web.

  **Export:** `source` object from fumadocs-core/source
  **Pattern:** Apps import source, not components
  **UI Components:** Apps import directly from fumadocs-ui packages
  ```

- [ ] T070 [P] Create minimal README.md in apps/web/app/docs/ documenting the import pattern:
  ```markdown
  # Embedded Documentation Route

  This route embeds Fumadocs from packages/docs.

  **Pattern:** Import source from 'docs' workspace package
  **UI:** Import DocsPage, DocsBody from 'fumadocs-ui/page'
  **Next.js 16:** Async params pattern required
  ```

- [ ] T071 Review packages/docs for any unused Fumadocs configuration files (remove if they conflict with embedding)
- [ ] T072 Final monorepo-wide verification: `bun run check-types && bun lint && bun build`
- [ ] T073 Verify Bun catalog versions correctly applied: `bun pm ls` - check Next.js, React, TypeScript versions
- [ ] T074 Test full workflow from clean state: `rm -rf node_modules apps/web/.next packages/docs/.next && bun install && bun build && bun dev`

**Checkpoint**: All documentation complete, all verification passing, ready for transfer to larger monorepo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Migration (Phase 0)**: No dependencies - MUST complete first
- **Setup (Phase 1)**: Depends on Migration completion
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - Core MVP, no dependencies
  - User Story 2 (P2): Can start after Foundational - Verifies dev experience of US1 setup
  - User Story 3 (P3): Can start after Foundational - Validates production build of US1
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core MVP, no dependencies
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Verifies dev experience of US1 setup
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Validates production build of US1

### Within Each User Story

- Implementation tasks before verification tasks
- Parallel tasks ([P] marker) can run simultaneously on different files
- Verification tasks run sequentially after implementation complete
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 0: T001-T003 (updating package.json versions) can run in parallel
- Phase 1: T012-T013 (updating package.json catalog references) can run in parallel
- US1: T029-T030 (creating Header and Footer components) can run in parallel
- US1 Verification: T036-T037 (check-types for different workspaces) can run in parallel
- Polish: T067-T070 (adding documentation) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 0: Next.js 16 Migration
2. Complete Phase 1: Setup (Bun catalog + Turbo config)
3. Complete Phase 2: Foundational (source export infrastructure)
4. Complete Phase 3: User Story 1 (embedded docs with layout)
5. **STOP and VALIDATE**: Test User Story 1 independently at `http://localhost:3000/docs`
6. If working, this is the MVP ready for transfer to larger monorepo

### Incremental Delivery

1. Complete Migration → apps/web on Next.js 16
2. Complete Setup + Foundational → Foundation ready
3. Add User Story 1 → Verify independently → MVP complete!
4. Add User Story 2 → Verify independently → Dev experience validated
5. Add User Story 3 → Verify independently → Production ready
6. Each story adds value without breaking previous stories

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and verifiable
- Run verification commands (`check-types`, `lint`, `build`) after implementation
- Use Turbo filters (`--filter=workspace`) for targeted verification
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **NO manual test writing** - rely on TypeScript, ESLint, and build process for quality gates
- **Minimal documentation** - only code comments and basic README per clarifications (solution transfers to larger monorepo)
- **Self-contained source** - all Fumadocs config stays in packages/docs
- **Fail-fast error handling** - build failures propagate naturally, no custom error handling needed
- **Turbopack default** - Next.js 16 uses Turbopack by default (no webpack configuration needed)
- **Async params** - Next.js 16 requires awaiting params and searchParams in all page components

---

## Transfer Notes (for larger monorepo)

Key patterns to replicate in any Turborepo monorepo:

1. **Bun Catalog**: Define versions in root `package.json` workspaces.catalog object:
   ```json
   "workspaces": {
     "catalog": { "next": "16.0.0", "react": "19.2.0" }
   }
   ```
   Reference via `"next": "catalog:"` in workspace package.json files

2. **Export Pattern**: packages/docs/lib/index.ts exports Fumadocs source:
   ```typescript
   export { source } from './source';
   ```
   Package.json has `"exports": { ".": "./lib/index.ts" }`

3. **Import Pattern**: apps/web/app/docs/[[...slug]]/page.tsx imports source from workspace, UI components from fumadocs-ui:
   ```typescript
   import { source } from 'docs';  // Workspace package
   import { DocsPage, DocsBody } from 'fumadocs-ui/page';  // Direct import
   ```

4. **Next.js 16 Async Pattern**: All page components must be async and await params:
   ```typescript
   export default async function Page({ params }: PageProps) {
     const { slug } = await params;  // ✅ Required in Next.js 16
     // ...
   }
   ```

5. **Turbo Dependency**: turbo.json ensures packages/docs builds before apps/web:
   ```json
   "build": { "dependsOn": ["^build"] }
   ```

6. **Transpilation**: apps/web/next.config.js includes transpilePackages for hot reload:
   ```javascript
   transpilePackages: ['docs']
   ```

7. **Turbopack**: Next.js 16 uses Turbopack by default (no webpack configuration needed)

These 7 patterns are sufficient to replicate the solution in any Turborepo monorepo with Next.js 16.
