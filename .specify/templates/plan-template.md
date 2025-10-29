# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.2 with Next.js 15+ and React 19
**Primary Dependencies**: Next.js, React, Turborepo, Bun 1.3.0
**Storage**: [if applicable, e.g., PostgreSQL, file system, API or N/A]
**Verification**: `bun run check-types`, `bun lint`, `bun build` (NO manual test writing)
**Target Platform**: Web (Next.js applications and embeddable components)
**Project Type**: Turborepo monorepo (apps/ and packages/ workspaces)
**Performance Goals**: [domain-specific, e.g., build time, bundle size, runtime performance or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., zero warnings policy, Turbo pipeline compliance or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., number of packages, component count, API endpoints or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with constitutional principles:

- [ ] **Monorepo Component Architecture**: Changes structured as reusable packages within Turborepo workspace?
- [ ] **Verification Over Test Writing**: Using `bun run check-types`, `bun lint`, `bun build` (NOT writing manual tests)?
- [ ] **Existing Project Modification**: Working with existing structure, not creating new projects?
- [ ] **Turbo Pipeline Compliance**: New tasks integrated into `turbo.json` with correct dependencies?
- [ ] **Zero-Warning Policy**: All verification commands pass with `--max-warnings 0`?

*Fill ONLY if there are violations that require justification (see Complexity Tracking below)*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (Turborepo Monorepo)
<!--
  ACTION REQUIRED: Document which workspaces will be modified for this feature.
  This is a Turborepo monorepo - specify whether changes go in apps/ or packages/.
-->

```text
# Monorepo structure (apps and packages)
apps/
├── web/                    # Main Next.js application (port 3000)
│   ├── app/               # Next.js App Router pages
│   ├── components/        # App-specific components
│   └── package.json       # Dependencies including @repo/ui, @repo/docsy

packages/
├── docs/                   # Documentation Next.js app (embeddable component target)
│   ├── app/               # Documentation pages
│   ├── components/        # Doc-specific components
│   └── package.json       # Fumadocs dependencies
├── ui/                     # Shared React component library (@repo/ui)
│   ├── src/
│   └── package.json
├── eslint-config/         # Shared ESLint configs (@repo/eslint-config)
└── typescript-config/     # Shared TypeScript configs (@repo/typescript-config)
```

**Workspaces Affected**: [List specific workspace paths that will be modified, e.g., "apps/web", "packages/docs", "packages/ui"]

**New Packages**: [If creating new packages, list them with rationale for new workspace creation]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
