# Implementation Plan: Embed Documentation as Component

**Branch**: `001-embed-docs-component` | **Date**: 2025-10-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-embed-docs-component/spec.md`

---

## Summary

Refactor the Turborepo monorepo to transform `packages/docs` (a standalone Fumadocs Next.js app) into an embeddable component that can be imported and rendered within `apps/web`. The primary goal is to display documentation content within the web app's layout (header and footer) while preserving all Fumadocs functionality (search, navigation, MDX rendering, themes).

**Key Architectural Decision** (from [research.md](./research.md)):
- **Export Pattern**: packages/docs exports Fumadocs `source` object ONLY (not UI components)
- **Import Pattern**: apps/web imports source from 'docs' workspace + imports Fumadocs UI components directly from fumadocs-ui packages
- **Routing**: Next.js 16 App Router catch-all route `[[...slug]]` with async params pattern

---

## Technical Context

**Language/Version**: TypeScript 5.9.3 with Next.js 16.0.0, React 19.2.0
**Primary Dependencies**:
- Next.js 16.0 App Router (Turbopack default)
- React 19.2
- Turborepo 2.5.8
- Bun 1.3.0 (with workspaces catalog feature)
- Fumadocs (fumadocs-core 16.0.5, fumadocs-ui 16.0.5, fumadocs-mdx 13.0.2)

**Storage**: N/A (documentation content in MDX files, no database)
**Verification**: `bun run check-types`, `bun lint`, `bun build` (NO manual test writing per constitution)
**Target Platform**: Web (Next.js applications and embeddable components)
**Project Type**: Turborepo monorepo (apps/ and packages/ workspaces)

**Performance Goals** (from [spec.md](./spec.md)):
- **SC-002**: Hot reload under 3 seconds (achieved via Turbopack + transpilePackages)
- **SC-005**: Build time maintained via Turborepo caching
- **FR-008**: Bundle size optimized (no duplicate React/Next.js dependencies via Turbopack bundling)

**Constraints**:
- Zero warnings policy (constitution)
- Turbo pipeline compliance
- Preserve Fumadocs functionality
- No content migration
- Incremental changes only
- Next.js 16 async params requirement

**Scale/Scope**: 2 workspaces modified (apps/web, packages/docs), 1 routing integration, Bun catalog for version alignment

---

## Constitution Check

*GATE: Must pass before starting implementation. Re-check after design phase.*

Verify compliance with constitutional principles:

- [x] **Monorepo Component Architecture**: packages/docs exports source, apps/web imports as workspace dependency ✅
- [x] **Verification Over Test Writing**: Using `bun run check-types`, `bun lint`, `bun build` (NOT writing manual tests) ✅
- [x] **Existing Project Modification**: Working with existing apps/web and packages/docs structure ✅
- [x] **Turbo Pipeline Compliance**: Updated `turbo.json` with `^build` dependency ordering ✅
- [x] **Zero-Warning Policy**: All verification commands pass with `--max-warnings 0` ✅

**Gate Status**: ✅ PASSED - All constitutional principles satisfied

---

## Project Structure

### Documentation (this feature)

```text
specs/001-embed-docs-component/
├── plan.md              # This file - implementation roadmap
├── spec.md              # Feature specification with user stories
├── research.md          # ⭐ Technical decisions and rationale
├── data-model.md        # ⭐ TypeScript interfaces (Next.js 16 + Fumadocs 16.0.5)
├── contracts/           # ⭐ API contracts and routing patterns
│   ├── exports.ts       #    - Fumadocs source API
│   └── routing.md       #    - URL mapping and route structure
├── quickstart.md        # ⭐ Developer workflow guide
├── tasks.md             # ⭐ 74 implementation tasks (sequenced by phase)
└── checklists/
    └── requirements.md  # Spec validation checklist
```

**Navigation Guide for Implementers**:
- **Start here**: [tasks.md](./tasks.md) - Follow Phase 0 → Phase 6
- **Need API details?**: [contracts/exports.ts](./contracts/exports.ts) - TypeScript interfaces
- **Need routing info?**: [contracts/routing.md](./contracts/routing.md) - URL structure
- **Need examples?**: [data-model.md](./data-model.md) - Complete code examples
- **Need context?**: [research.md](./research.md) - Why we made each decision
- **Need workflow help?**: [quickstart.md](./quickstart.md) - Dev/build/verify commands

---

### Source Code (Turborepo Monorepo)

**⭐ Key Changes**:

```text
apps/web/                                # Next.js 16 application (port 3000)
├── app/
│   ├── docs/                           # NEW: Embedded documentation route
│   │   └── [[...slug]]/
│   │       └── page.tsx                # NEW: Async params pattern (Next.js 16)
│   └── layout.tsx                      # MODIFIED: Add Header + Footer
├── components/
│   ├── Header.tsx                      # NEW: Site header
│   └── Footer.tsx                      # NEW: Site footer
├── next.config.js                      # MODIFIED: transpilePackages: ['docs']
└── package.json                        # MODIFIED: Add 'docs' dependency + catalog refs

packages/docs/                           # Fumadocs documentation app
├── lib/                                # NEW: Export directory
│   ├── source.ts                       # NEW: Fumadocs source configuration
│   └── index.ts                        # NEW: Export source only
├── source.config.ts                    # NEW: MDX configuration
├── app/                                # Existing Fumadocs app structure
├── content/                            # Existing MDX documentation files
└── package.json                        # MODIFIED: Add exports field + catalog refs

package.json (root)                     # MODIFIED: Add workspaces.catalog
turbo.json (root)                       # VERIFIED: ^build dependency exists
```

**Workspaces Affected**:
1. **apps/web**: Add `/docs` route, import source from 'docs', import UI from fumadocs-ui
2. **packages/docs**: Export source object via lib/index.ts
3. **Root package.json**: Add Bun workspaces catalog for version pinning

**New Packages**: None - refactoring existing workspaces only

---

## Implementation Phases

**📋 Detailed Tasks**: See [tasks.md](./tasks.md) for complete task list (74 tasks total)

---

### Phase 0: Next.js 16 Migration (apps/web only)

**Objective**: Upgrade apps/web from Next.js 15.5 → 16.0 to align with packages/docs

**Why Required**: Next.js 16 has breaking changes (async params) that affect routing implementation

**Tasks**: T001-T010 in [tasks.md](./tasks.md#phase-0-nextjs-16-migration)

**Key Actions**:
1. Update package.json versions (Next.js 16.0, React 19.2)
2. Run Next.js async params codemod: `npx @next/codemod@canary next-async-request-api`
3. Remove custom webpack configuration (Turbopack is now default)
4. Verify migration: type checking, linting, build, dev server

**Verification Checkpoint**:
```bash
cd apps/web
bun run check-types  # MUST pass
bun lint             # MUST pass
bun build            # MUST complete
bun dev              # MUST start successfully
```

**📚 Reference**: [research.md Section 7](./research.md#7-nextjs-160-breaking-changes-and-migration) - Next.js 16 breaking changes

---

### Phase 1: Setup (Bun Catalog + Turbo Pipeline)

**Objective**: Configure version pinning via Bun catalog and verify Turbo pipeline

**Why Required**: Ensures consistent Next.js/React versions across all workspaces

**Tasks**: T011-T017 in [tasks.md](./tasks.md#phase-1-setup)

**Key Actions**:
1. Add `workspaces.catalog` to root package.json with pinned versions
2. Update apps/web and packages/docs to reference catalog: `"next": "catalog:"`
3. Run `bun install` to apply catalog versions
4. Verify turbo.json has `"dependsOn": ["^build"]`

**Bun Catalog Syntax** (exact):
```json
// Root package.json
{
  "workspaces": {
    "packages": ["apps/*", "packages/*"],
    "catalog": {
      "next": "16.0.0",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "typescript": "5.9.3"
    }
  }
}
```

**Verification Checkpoint**:
```bash
bun pm ls | grep -E "(next|react|typescript)"  # Verify aligned versions
bun run check-types && bun lint                # MUST pass
```

**📚 References**:
- [research.md Section 3](./research.md#3-nextjs-version-compatibility) - Bun catalog decision
- [tasks.md T011-T015](./tasks.md#bun-catalog-configuration) - Exact syntax and commands

---

### Phase 2: Foundational (Source Export Infrastructure)

**Objective**: Create Fumadocs source export in packages/docs and configure workspace dependencies

**Why Required**: BLOCKS all user story work - must be complete before any embedding can happen

**Tasks**: T018-T027 in [tasks.md](./tasks.md#phase-2-foundational)

**Key Actions**:
1. Create `packages/docs/source.config.ts` (MDX configuration)
2. Create `packages/docs/lib/source.ts` (Fumadocs source loader)
3. Create `packages/docs/lib/index.ts` (export source only)
4. Update `packages/docs/package.json` with exports field
5. Add 'docs' workspace dependency to apps/web
6. Add fumadocs-ui dependencies to apps/web
7. Configure transpilePackages in apps/web/next.config.js

**Source Export Pattern** (exact):
```typescript
// packages/docs/lib/source.ts
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx/runtime/next';
import { docs } from '../source.config';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs),
});

// packages/docs/lib/index.ts
export { source } from './source';
```

**Verification Checkpoint**:
```bash
bun run check-types --filter=web   # MUST pass
bun run check-types --filter=docs  # MUST pass
```

**📚 References**:
- [research.md Section 8](./research.md#8-fumadocs-1605-component-architecture) - Export pattern decision
- [data-model.md Section 4](./data-model.md#4-fumadocs-source-interface-actual-api-from-fumadocs-core-1605) - FumadocsSource interface
- [contracts/exports.ts](./contracts/exports.ts) - Complete TypeScript interfaces
- [tasks.md T018-T027](./tasks.md#fumadocs-source-export-setup) - Step-by-step implementation

---

### Phase 3: User Story 1 - View Documentation with Unified Layout (MVP)

**Objective**: Enable users to view Fumadocs within apps/web layout (header + footer)

**User Story**: [spec.md User Story 1](./spec.md#user-story-1)

**Tasks**: T028-T043 in [tasks.md](./tasks.md#phase-3-user-story-1)

**Key Actions**:
1. Create Header.tsx and Footer.tsx components
2. Update apps/web/app/layout.tsx to wrap children with Header/Footer
3. Create `apps/web/app/docs/[[...slug]]/page.tsx` with Next.js 16 async pattern
4. Import source from 'docs' workspace package
5. Import DocsPage/DocsBody from 'fumadocs-ui/page'
6. Implement generateStaticParams and generateMetadata

**Catch-All Route Pattern** (exact - Next.js 16):
```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import { source } from 'docs';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug?: string[] }>;  // ⚠️ Promise in Next.js 16
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;  // ⚠️ Must await in Next.js 16
  const page = source.getPage(slug);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // ⚠️ Must await in Next.js 16
  const page = source.getPage(slug);
  if (!page) notFound();

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>{page.data.body}</DocsBody>
    </DocsPage>
  );
}
```

**Verification Checkpoint**:
```bash
bun run check-types --filter=web  # MUST pass
bun build --filter=docs           # MUST complete
bun build --filter=web            # MUST complete
bun dev                           # Start dev server
# Navigate to http://localhost:3000/docs - verify docs render with header/footer
```

**📚 References**:
- [research.md Section 7](./research.md#7-nextjs-160-breaking-changes-and-migration) - Async params requirement
- [research.md Section 8](./research.md#8-fumadocs-1605-component-architecture) - Import pattern
- [data-model.md Examples](./data-model.md#examples) - Complete working examples
- [contracts/routing.md](./contracts/routing.md) - Route structure and URL mapping
- [tasks.md T028-T043](./tasks.md#phase-3-user-story-1) - Detailed implementation steps

---

### Phase 4: User Story 2 - Hot Reload During Development

**Objective**: Verify hot reload works for both packages/docs and apps/web changes

**User Story**: [spec.md User Story 2](./spec.md#user-story-2)

**Tasks**: T044-T053 in [tasks.md](./tasks.md#phase-4-user-story-2)

**Key Actions**:
1. Verify transpilePackages: ['docs'] in apps/web/next.config.js
2. Test hot reload by modifying packages/docs content files
3. Test hot reload by modifying apps/web layout components
4. Measure and verify hot reload time <3 seconds

**Hot Reload Configuration**:
```javascript
// apps/web/next.config.js
const nextConfig = {
  transpilePackages: ['docs'],  // Enables Fast Refresh for packages/docs
};
export default nextConfig;
```

**Verification Checkpoint**:
```bash
bun dev  # Start dev server
# 1. Edit packages/docs/content/*.mdx - verify browser updates <3s
# 2. Edit apps/web/components/Header.tsx - verify browser updates <3s
# 3. Check console for Turbopack HMR metrics
bun run check-types  # MUST pass
bun lint             # MUST pass
```

**📚 References**:
- [research.md Section 5](./research.md#5-hot-reload-and-development-experience) - Hot reload strategy
- [quickstart.md Section 3-4](./quickstart.md#3-edit-documentation-content) - Hot reload workflow
- [tasks.md T044-T053](./tasks.md#phase-4-user-story-2) - Testing procedures

---

### Phase 5: User Story 3 - Build and Deploy Unified Application

**Objective**: Produce single production build artifact from apps/web with embedded docs

**User Story**: [spec.md User Story 3](./spec.md#user-story-3)

**Tasks**: T054-T066 in [tasks.md](./tasks.md#phase-5-user-story-3)

**Key Actions**:
1. Verify turbo.json outputs include `.next/**` (excluding cache)
2. Run full production build: `bun build`
3. Verify packages/docs builds before apps/web (Turbo dependency chain)
4. Test production build: `cd apps/web && bun start`
5. Verify static pages generated in `.next/server/app/docs/`

**Build Verification Checklist**:
```bash
bun build                          # MUST complete for both workspaces
ls apps/web/.next/server/app/docs  # Verify static HTML exists
cd apps/web && bun start           # Start production server
# Navigate to http://localhost:3000/docs - verify production build works
```

**Verification Checkpoint**:
```bash
bun build                # MUST complete with 0 warnings
bun run check-types      # MUST pass
bun lint                 # MUST pass
cd apps/web && bun start # MUST serve docs correctly
```

**📚 References**:
- [research.md Section 6](./research.md#6-build-pipeline-and-dependency-optimization) - Build strategy
- [quickstart.md Build Section](./quickstart.md#build-for-production) - Build workflow
- [tasks.md T054-T066](./tasks.md#phase-5-user-story-3) - Build verification steps

---

### Phase 6: Polish & Documentation

**Objective**: Add code comments and minimal documentation for transfer to larger monorepo

**Tasks**: T067-T074 in [tasks.md](./tasks.md#phase-6-polish--cross-cutting-concerns)

**Key Actions**:
1. Add code comments to packages/docs/lib/index.ts explaining export pattern
2. Add code comments to apps/web/app/docs/[[...slug]]/page.tsx explaining import pattern
3. Create minimal README.md in packages/docs/lib/
4. Create minimal README.md in apps/web/app/docs/
5. Review and remove unused Fumadocs configuration files
6. Run final verification: `bun run check-types && bun lint && bun build`
7. Test clean workflow from scratch

**Final Verification**:
```bash
rm -rf node_modules apps/web/.next packages/docs/.next
bun install
bun build
bun dev
# Verify everything works from clean state
```

**📚 References**:
- [tasks.md T067-T074](./tasks.md#phase-6-polish--cross-cutting-concerns) - Documentation requirements
- [spec.md Clarifications](./spec.md#clarifications) - Minimal documentation requirement

---

## Post-Implementation Constitution Re-Check

After all phases complete, re-verify constitutional compliance:

- [ ] **Monorepo Component Architecture**: packages/docs exports source, apps/web imports cleanly
- [ ] **Verification Over Test Writing**: All quality gates passing (check-types, lint, build)
- [ ] **Existing Project Modification**: No new projects created, only existing workspaces modified
- [ ] **Turbo Pipeline Compliance**: Build ordering correct, caching working
- [ ] **Zero-Warning Policy**: All verification commands pass with 0 warnings

**Final Gate**: Must PASS before marking feature complete

---

## Transfer Checklist (for larger monorepo)

When replicating this pattern in a larger monorepo, follow these steps:

### 1. **Version Alignment** (Bun Catalog)
- [ ] Add workspaces.catalog to root package.json with Next.js 16.0, React 19.2
- [ ] Update all workspace package.json files to reference: `"next": "catalog:"`
- [ ] Run `bun install` to apply catalog versions
- [ ] **See**: [tasks.md Phase 1](./tasks.md#phase-1-setup) for exact syntax

### 2. **Source Export** (packages/docs)
- [ ] Create lib/source.ts with Fumadocs loader
- [ ] Create lib/index.ts exporting source only
- [ ] Add `"exports": { ".": "./lib/index.ts" }` to package.json
- [ ] **See**: [contracts/exports.ts](./contracts/exports.ts) for TypeScript interfaces

### 3. **Route Implementation** (apps/web)
- [ ] Create app/docs/[[...slug]]/page.tsx with async params pattern
- [ ] Import source from 'docs' workspace package
- [ ] Import DocsPage, DocsBody from 'fumadocs-ui/page'
- [ ] Implement generateStaticParams and generateMetadata
- [ ] **See**: [data-model.md Examples](./data-model.md#examples) for complete code

### 4. **Configuration** (apps/web)
- [ ] Add transpilePackages: ['docs'] to next.config.js
- [ ] Add 'docs' workspace dependency to package.json
- [ ] Add fumadocs-ui dependencies to package.json
- [ ] **See**: [tasks.md Phase 2](./tasks.md#phase-2-foundational) for configuration

### 5. **Pipeline** (turbo.json)
- [ ] Verify build task has `"dependsOn": ["^build"]`
- [ ] Verify outputs include `.next/**` and `!.next/cache/**`
- [ ] **See**: [research.md Section 6](./research.md#6-build-pipeline-and-dependency-optimization)

**🔑 Key Patterns**: 7 replicable patterns documented in [tasks.md Transfer Notes](./tasks.md#transfer-notes-for-larger-monorepo)

---

## Quick Reference

### For Implementers
- **Start**: [tasks.md Phase 0](./tasks.md#phase-0-nextjs-16-migration)
- **API Contracts**: [contracts/exports.ts](./contracts/exports.ts)
- **Code Examples**: [data-model.md](./data-model.md)
- **Why Decisions**: [research.md](./research.md)

### For Reviewers
- **User Stories**: [spec.md](./spec.md)
- **Requirements**: [spec.md Requirements](./spec.md#requirements)
- **Success Criteria**: [spec.md Success Criteria](./spec.md#success-criteria)

### For Future Maintainers
- **Transfer Guide**: [tasks.md Transfer Notes](./tasks.md#transfer-notes-for-larger-monorepo)
- **Architecture**: [research.md Sections 7-8](./research.md#7-nextjs-160-breaking-changes-and-migration)
- **Developer Workflow**: [quickstart.md](./quickstart.md)

---

## Version History

- **2025-10-29**: Created plan with Next.js 16, Fumadocs 16.0.5, Bun catalog
- **2025-10-29**: Updated with cross-references to all implementation detail files
- **2025-10-29**: Added complete transfer checklist for larger monorepo
