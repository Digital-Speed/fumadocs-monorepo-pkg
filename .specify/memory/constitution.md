<!--
SYNC IMPACT REPORT
==================
Version Change: (initial) → 1.0.0
Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles defined)
  - Monorepo Architecture Standards
  - Quality Gates & Automation
  - Governance
Removed Sections: N/A
Templates Status:
  ✅ plan-template.md - Updated Technical Context (TypeScript/Next.js/Turborepo/Bun stack)
  ✅ plan-template.md - Updated Constitution Check with all 5 principles as checkboxes
  ✅ plan-template.md - Updated Project Structure to reflect Turborepo monorepo (apps/ + packages/)
  ✅ tasks-template.md - Updated verification approach (NO manual tests, use check-types/lint/build)
  ✅ tasks-template.md - Updated Path Conventions for Turborepo workspace structure
  ✅ tasks-template.md - Updated all task phases to use verification commands instead of tests
  ✅ tasks-template.md - Updated sample tasks with TypeScript/React/Next.js examples
  ✅ spec-template.md - No changes needed (generic template supports component architecture)
  ✅ checklist-template.md - No changes needed (generic template)
  ✅ agent-file-template.md - No changes needed (generic template)
Follow-up TODOs:
  - RATIFICATION_DATE marked as TODO - needs project owner input for historical accuracy
  - No command files found in .specify/templates/commands/ to validate
-->

# Turborepo Monorepo Constitution

## Core Principles

### I. Monorepo Component Architecture

All features MUST be structured as reusable, independently buildable packages within the Turborepo workspace. Packages MUST be self-contained with clear boundaries and explicit dependencies. The primary goal is to enable Next.js applications (packages/docs) to be exported and embedded as components into other Next.js applications (apps/web).

**Rationale**: Enables code reuse, independent development, and clear dependency management across the monorepo. Supports the core objective of building embeddable documentation components.

### II. Verification Over Test Writing (NON-NEGOTIABLE)

Testing MUST be achieved through **automated verification commands** (`bun run check-types`, `bun lint`, `bun build`), NOT by writing unit/integration tests. Every change MUST pass all verification gates before merge. Focus on type safety, linting rules, and successful builds as quality measures.

**Rationale**: As a monorepo software architect role, emphasis is on architectural quality through TypeScript's type system, ESLint rules, and build validation rather than manual test authoring. This leverages the tooling ecosystem for continuous verification.

### III. Existing Project Modification

All work MUST be performed on the existing codebase structure. Do NOT scaffold new projects or restructure the fundamental architecture without explicit approval. Changes MUST be incremental and preserve existing functionality.

**Rationale**: The project has established patterns, dependencies, and structure that must be respected. Breaking changes would disrupt the existing codebase and violate the principle of working with existing systems.

### IV. Turbo Pipeline Compliance

All new packages and tasks MUST integrate with Turbo's pipeline configuration (`turbo.json`). Task dependencies MUST use the `^` prefix correctly to ensure upstream builds complete before downstream tasks. Caching MUST be configured appropriately for each task type.

**Rationale**: Turbo orchestration ensures correct build order, efficient caching, and parallel execution where possible. Violating pipeline rules breaks the monorepo build system.

### V. Zero-Warning Policy

All code MUST pass linting with `--max-warnings 0`. Type checking via `bun run check-types` MUST complete without errors. Warnings indicate potential issues and MUST be resolved, not suppressed.

**Rationale**: Enforces code quality standards across all workspaces. Warnings left unaddressed accumulate technical debt and indicate incomplete implementation.

## Monorepo Architecture Standards

### Workspace Organization

- **Apps** (`apps/`): Deployable Next.js applications (web)
- **Packages** (`packages/`): Reusable libraries and components (docs, ui, eslint-config, typescript-config)
- **Internal dependencies**: Use workspace protocol (`"*"`) for all internal package references
- **Shared tooling**: ESLint and TypeScript configs MUST be shared via `@repo/eslint-config` and `@repo/typescript-config`

### Package Manager

- Bun (v1.3.0) is the REQUIRED package manager
- All dependency management MUST use `bun` commands
- Node.js version MUST be >= 18

### Build Outputs

- Next.js apps: `.next/**` (excluding cache)
- Libraries: `dist/**` when applicable
- All outputs MUST be defined in `turbo.json` for proper caching

## Quality Gates & Automation

### Pre-Merge Requirements

Every change MUST pass ALL of the following automated checks:

1. **Type Check**: `bun run check-types` across all workspaces
2. **Lint**: `bun lint` with zero warnings
3. **Build**: `bun build` completes successfully for affected workspaces
4. **Format**: Code MUST be formatted via Prettier (`bun run format`)

### Verification Workflow

1. Make incremental changes to existing code
2. Run verification commands to validate changes
3. Fix all errors and warnings before proceeding
4. Use Turbo filters (`--filter=web`) for targeted verification when appropriate
5. Commit only after all gates pass

### No Manual Test Writing

Do NOT create test files, test suites, or test frameworks unless explicitly requested by project owner. Rely on TypeScript, ESLint, and build processes for quality assurance.

## Governance

### Constitutional Authority

This constitution supersedes ad-hoc practices and preferences. All development decisions MUST align with these principles. Violations require explicit justification and approval.

### Amendment Process

1. Amendments MUST be documented with clear rationale
2. Version MUST be incremented per semantic versioning:
   - **MAJOR**: Backward incompatible principle changes or removals
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications, wording fixes, non-semantic changes
3. All dependent templates MUST be updated to reflect amendments
4. Migration plan MUST be provided for MAJOR changes

### Compliance Review

- All pull requests MUST be verified against constitutional principles
- Complexity additions MUST be justified against simplicity principles
- See `CLAUDE.md` for runtime development guidance and detailed technical context

### Complexity Justification

Any additions that increase system complexity (new dependencies, new patterns, architectural deviations) MUST include written justification explaining:
- Why the existing approach is insufficient
- Why simpler alternatives were rejected
- How the addition aligns with constitutional principles

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE: needs project owner to specify original adoption date) | **Last Amended**: 2025-10-29
