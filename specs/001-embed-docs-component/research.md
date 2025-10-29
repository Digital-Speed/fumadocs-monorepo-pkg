# Research: Embed Documentation as Component

**Date**: 2025-10-29
**Objective**: Research embedding patterns for Fumadocs Next.js app into apps/web with App Router

---

## 1. Embedding Next.js Apps as Components

### Question
Can a Next.js app (packages/docs) be imported as components into another Next.js app (apps/web)?

### Research Findings

**Next.js App Router Component Patterns**:
- Next.js apps are composed of React Server Components (RSC) by default
- Components can be shared between Next.js apps in a monorepo via package exports
- Catch-all routes (`[[...slug]]`) can proxy requests to embedded components
- Server Components maintain SSR benefits when imported across workspace boundaries

**Monorepo Component Sharing**:
- Turborepo supports workspace dependencies using the `"*"` protocol
- TypeScript paths and Next.js transpilePackages enable cross-workspace imports
- Build pipeline must sequence dependencies (docs before web) via `turbo.json`

### Decision

**Approach**: Export Fumadocs page components from `packages/docs` and import them into `apps/web` using a catch-all route.

**Implementation**:
1. packages/docs exports a main page component via `lib/index.ts`
2. apps/web creates `app/docs/[[...slug]]/page.tsx` catch-all route
3. Catch-all route imports and renders Fumadocs component with slug parameter
4. Use Server Components (default) to maintain SSR performance

### Rationale

- **SSR Preserved**: Server Components maintain Next.js SSR benefits
- **Routing Simplicity**: Catch-all route handles all `/docs/*` paths without duplication
- **Hot Reload**: Turborepo dev mode supports cross-workspace Fast Refresh
- **Type Safety**: TypeScript validates component props across workspaces

### Alternatives Considered

**Alternative 1: Parallel Routes (`@docs`)**
- More complex routing setup with multiple segment groups
- Harder to maintain and understand
- **Rejected**: Catch-all simpler for single embedded app

**Alternative 2: iFrame Embedding**
- Would run packages/docs as separate server
- Loses SSR benefits, creates style isolation issues
- **Rejected**: Violates Next.js component architecture principles

---

## 2. Fumadocs Component Architecture

### Question
What Fumadocs components need to be exported for embedding?

### Research Findings

**Fumadocs Structure** (from fumadocs-ui 16.0.5):
- `DocsLayout`: Wraps documentation with sidebar, navigation, theme
- `DocsBody`: Renders MDX content
- `DocsPage`: Combines layout + body for full page rendering
- Search component: Integrated via fumadocs-core search utilities
- Theme configuration: Tailwind-based, configured via fumadocs.config

**Fumadocs Dependencies**:
- fumadocs-core: Content utilities, search indexing, file system routing
- fumadocs-mdx: MDX processing and generation
- fumadocs-ui: Pre-built React components for docs interface

### Decision

**Export Strategy**: Export the high-level `DocsPage` component that encapsulates Fumadocs layout, navigation, and content rendering.

**Exports from packages/docs/lib/index.ts**:
```typescript
export { DocsPage } from '../app/docs/[...slug]/page'
export { generateStaticParams, generateMetadata } from '../app/docs/[...slug]/page'
export type { PageProps } from '../app/docs/[...slug]/page'
```

### Rationale

- **Minimal Surface Area**: Single component export reduces coupling
- **Fumadocs Encapsulation**: Keeps Fumadocs implementation details in packages/docs
- **Metadata Support**: Export generateMetadata for SEO in apps/web
- **Static Generation**: Export generateStaticParams for build-time rendering

### Alternatives Considered

**Alternative 1: Export Individual Components (Layout, Body, Search separately)**
- More granular control but increases complexity
- Apps/web would need to understand Fumadocs internal structure
- **Rejected**: Violates encapsulation, harder to maintain

**Alternative 2: Export Entire App via API**
- Would require running packages/docs as microservice
- Adds network latency and infrastructure complexity
- **Rejected**: Overengineered for monorepo embedding

---

## 3. Next.js Version Compatibility

### Question
Can Next.js 15.5 (apps/web) and Next.js 16.0 (packages/docs) coexist in monorepo?

### Research Findings

**Next.js Version Differences**:
- Next.js 15.5 → 16.0: Minor version bump, mostly compatible
- Both support React 19 and App Router
- Potential issues: Different `next/` imports, build output formats

**Monorepo Dependency Management**:
- Bun workspaces can handle different versions per package
- Turborepo builds each workspace independently
- Shared dependencies (React, React-DOM) use highest semver-compatible version

**Risk Assessment**:
- Low risk: Minor version difference unlikely to cause runtime issues
- Potential build conflicts if Next.js internals differ significantly
- Development experience may have inconsistencies between workspaces

### Decision

**Version Strategy**: Use Bun's catalog feature to pin Next.js 16.0.0, React 19.2.0, and TypeScript 5.9.3 in root package.json `workspaces.catalog` object, with workspace packages referencing via `"next": "catalog:"` syntax.

**Exact Bun Catalog Syntax:**

Root `package.json`:
```json
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

Workspace `package.json` (apps/web, packages/docs):
```json
{
  "dependencies": {
    "next": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### Rationale

- **Consistency**: Single Next.js version across monorepo reduces complexity
- **Future-Proof**: Next.js 16.0 is newer and will have longer support lifecycle
- **Reduced Risk**: Eliminates potential version conflicts before they occur
- **Simpler Debugging**: Same Next.js version means consistent behavior
- **Bun 1.3.0 Feature**: Catalog feature available in Bun 1.3.0, enables centralized version management
- **Publish-Safe**: Bun automatically replaces `"catalog:"` with resolved versions during `bun publish`

---

## 4. Routing Strategy for `/docs/*`

### Question
How should apps/web route `/docs/*` requests to embedded Fumadocs?

### Research Findings

**Next.js App Router Patterns**:
- Catch-all routes: `[[...slug]]` matches zero or more segments (optional)
- Dynamic routes: `[slug]` matches single segment
- Route groups: `(group)` organize without affecting URL
- Parallel routes: `@folder` for simultaneous rendering

**Fumadocs Routing**:
- Fumadocs expects routes like `/docs/getting-started`, `/docs/api/reference`
- Uses file-based routing from `content/` directory
- Generates routes from MDX filenames

### Decision

**Routing Approach**: Use optional catch-all route `app/docs/[[...slug]]/page.tsx` in apps/web.

**Implementation**:
```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import { DocsPage, generateStaticParams, generateMetadata } from 'docs'

export { generateStaticParams, generateMetadata }

export default function EmbeddedDocsPage({ params }: { params: { slug?: string[] } }) {
  return <DocsPage params={params} />
}
```

### Rationale

- **Optional Catch-All**: `[[...slug]]` handles both `/docs` (root) and `/docs/path/to/page`
- **Zero Duplication**: Single route file handles all documentation pages
- **Static Generation**: Re-export generateStaticParams for build-time rendering
- **SEO Support**: Re-export generateMetadata for proper page metadata

### Alternatives Considered

**Alternative 1: Parallel Routes**
- Syntax: `app/@docs/[...slug]/page.tsx`
- More complex with multiple segment groups
- **Rejected**: Overcomplicated for single embedded app

**Alternative 2: Proxy via API Route**
- Create API route that forwards to packages/docs
- Loses SSR benefits, adds latency
- **Rejected**: Defeats purpose of component embedding

---

## 5. Hot Reload and Development Experience

### Question
Will hot reload work when packages/docs is embedded in apps/web during development?

### Research Findings

**Turborepo Dev Mode**:
- Runs `dev` task for all workspaces concurrently
- Each Next.js app runs its own dev server
- Fast Refresh monitors file changes per workspace

**Next.js Fast Refresh in Monorepo**:
- Fast Refresh works across workspace dependencies
- Changes in packages/ trigger rebuild and refresh in apps/
- Requires proper transpilePackages configuration in Next.js config

**Development Server Ports**:
- apps/web: Port 3000 (specified in package.json)
- packages/docs: Default port (3001 or auto-assigned)
- Only apps/web port is accessed by developers

### Decision

**Development Workflow**: Run `bun dev` at monorepo root, which starts both apps/web and packages/docs dev servers via Turborepo. Configure apps/web to transpile packages/docs for hot reload.

**Configuration**:
```javascript
// apps/web/next.config.js
module.exports = {
  transpilePackages: ['docs'], // Enable Fast Refresh for packages/docs
}
```

### Rationale

- **Automatic Hot Reload**: Changes in packages/docs trigger Fast Refresh in apps/web
- **Single Command**: `bun dev` starts entire development environment
- **Performance**: Fast Refresh is optimized for monorepo dependencies
- **Developer Experience**: Meets <3 second hot reload requirement (SC-002)

### Alternatives Considered

**Alternative 1: Single Dev Server (Only apps/web)**
- packages/docs not run separately
- Simpler but loses ability to develop packages/docs standalone
- **Rejected**: Reduces flexibility for docs-only development

**Alternative 2: Manual Server Management**
- Developer manually starts both servers
- Error-prone, slows development workflow
- **Rejected**: Turborepo automates this better

---

## 6. Build Pipeline and Dependency Optimization

### Question
How to avoid duplicating shared dependencies (React, Next.js) in build outputs?

### Research Findings

**Turborepo Build Orchestration**:
- `^build` prefix ensures upstream packages build first
- Caching prevents unnecessary rebuilds
- Each workspace produces independent build output

**Next.js Build Outputs**:
- Standalone apps produce full `.next/` directory
- Libraries can be built to `dist/` with bundler (esbuild, tsup)
- Next.js automatically deduplicates shared deps via webpack

**Dependency Optimization**:
- packages/docs as library: Build to `dist/`, consumed by apps/web
- packages/docs as app: Full Next.js build, components imported at runtime
- Shared dependencies (React) hoisted to monorepo root by Bun

### Decision

**Build Strategy**: Build packages/docs as a Next.js app (keep existing build), apps/web imports components at build time via transpilePackages.

**Turbo Configuration**:
```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Wait for upstream packages
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    }
  }
}
```

**Dependency Chain**:
1. packages/docs builds (produces `.next/`)
2. apps/web builds, transpiles packages/docs components
3. apps/web produces unified `.next/` with embedded docs

### Rationale

- **No Duplication**: Next.js webpack deduplicates shared dependencies (React, React-DOM)
- **Preserved Functionality**: packages/docs remains buildable as standalone app
- **Optimal Performance**: Transpilation at build time produces optimized bundle
- **Turbo Caching**: Unchanged workspaces use cached builds

### Alternatives Considered

**Alternative 1: Build packages/docs to Library (`dist/`)**
- Would require rewriting packages/docs build to output ES modules
- Breaks Fumadocs build process expectations
- **Rejected**: Too invasive, violates "minimal Fumadocs changes" constraint

**Alternative 2: Runtime Dependency Loading**
- Import packages/docs at runtime via dynamic imports
- Increases bundle size, loses SSR benefits
- **Rejected**: Performance penalty, complicates deployment

---

## Summary of Decisions

| Research Area | Decision | Rationale |
|---------------|----------|-----------|
| **Embedding Pattern** | Export Fumadocs components, import via catch-all route | SSR preserved, routing simplicity, type safety |
| **Component Exports** | Export high-level `DocsPage` component | Minimal surface area, encapsulation |
| **Next.js Versions** | Upgrade apps/web to Next.js 16.0 | Consistency, reduced risk, simpler debugging |
| **Routing Strategy** | Optional catch-all `[[...slug]]` route | Handles root + nested paths, zero duplication |
| **Hot Reload** | Turborepo dev mode + transpilePackages | Automatic Fast Refresh, <3 second target |
| **Build Pipeline** | packages/docs as app, transpile at build time | No duplication, preserved functionality, optimal perf |

---

## Resolved Clarifications

**From Technical Context**:

1. **Performance Goals**: Hot reload under 3 seconds (achieved via Fast Refresh + transpilePackages), build time maintained via Turbo caching, bundle size optimized via webpack deduplication
   - ✅ RESOLVED: Development workflow supports <3s hot reload, build optimization via Next.js bundler

2. **Constraints**: Zero warnings policy enforced via `--max-warnings 0`, Turbo pipeline updated with `^build` dependencies
   - ✅ RESOLVED: All verification commands configured to maintain zero-warning policy

3. **Scale/Scope**: 2 workspaces modified (apps/web, packages/docs), 1 routing integration (catch-all), 1 dependency optimization (transpilePackages)
   - ✅ RESOLVED: Scope confirmed, no additional workspaces needed

---

## 7. Next.js 16.0 Breaking Changes and Migration

### Question
What are the critical breaking changes in Next.js 16.0 that affect our embedding implementation?

### Research Findings

**Version-Specific Context:**
- Current apps/web: Next.js 15.5.0 → Upgrading to 16.0.0
- Current packages/docs: Next.js 16.0.0 → Already on target version
- Current React: apps/web 19.1.0, packages/docs 19.2.0 → Standardizing to 19.2.0

**Critical Breaking Changes:**

**1. Async Request APIs (HIGHEST IMPACT)**
- `params` and `searchParams` props are now `Promise` types that MUST be awaited
- Affects: `page.tsx`, `layout.tsx`, `route.tsx`, metadata files
- No synchronous access allowed (complete removal)

**Before (Next.js 15):**
```typescript
export default function Page({ params }: { params: { slug?: string[] } }) {
  return <div>{params.slug}</div>
}
```

**After (Next.js 16):**
```typescript
export default async function Page({
  params
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params;
  return <div>{slug}</div>
}

// Metadata generation also requires await
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Docs: ${slug?.join('/')}` };
}
```

**2. generateStaticParams API**
- Still returns array of param objects (no breaking change)
- Works with optional catch-all routes `[[...slug]]`
- TypeScript signature unchanged for return type
- fetch requests inside generateStaticParams are automatically memoized

**3. Turbopack is Default Bundler**
- Webpack requires explicit opt-in via `--webpack` flag
- Custom webpack configurations must be preserved
- HMR improvements: 28x faster (18ms), cold start 14x faster (3.2s)

**4. Node.js Version Requirements**
- Minimum: Node.js 20.9.0 (Node.js 18 NO LONGER SUPPORTED)
- Current system: v22.19.0 ✅ Compatible

**5. transpilePackages Configuration**
- Syntax unchanged: `transpilePackages: ['package-name']`
- HMR limitations with workspace packages mitigated in v16 due to Turbopack performance improvements
- Still recommended for monorepo hot reload

### Decision

**Migration Strategy**: Upgrade apps/web from Next.js 15.5 to 16.0 using Bun catalog, apply async params codemod, preserve webpack configuration for compatibility.

**Implementation Steps:**

1. **Update Bun Catalog** (root package.json):
```json
{
  "workspaces": {
    "catalog": {
      "next": "16.0.0",
      "react": "19.2.0",
      "react-dom": "19.2.0"
    }
  }
}
```

2. **Update Workspace Packages** (apps/web, packages/docs):
```json
{
  "dependencies": {
    "next": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:"
  }
}
```

3. **Run Async API Codemod**:
```bash
npx @next/codemod@canary next-async-request-api
```

4. **Preserve Webpack** (apps/web only has custom webpack config):
```json
// apps/web/package.json
{
  "scripts": {
    "dev": "next dev --port 3000 --webpack",
    "build": "next build --webpack"
  }
}
```

5. **Configure transpilePackages** (for hot reload):
```javascript
// apps/web/next.config.js
module.exports = {
  transpilePackages: ['docs'], // Enable hot reload for packages/docs
  // ... existing webpack config
}
```

### Rationale

- **Async Params**: Required for Next.js 16 compatibility, affects our catch-all route implementation
- **Webpack Preservation**: apps/web has custom webpack config for Redoc compatibility
- **transpilePackages**: Essential for development experience with embedded docs hot reload
- **Codemod Usage**: Automated migration reduces manual errors and ensures TypeScript type safety
- **Version Alignment**: Catalog ensures both apps/web and packages/docs use identical Next.js/React versions

### Alternatives Considered

**Alternative 1: Stay on Next.js 15.5 in apps/web**
- Would maintain version mismatch (15.5 vs 16.0)
- Increases complexity, different APIs between packages
- **Rejected**: Violates version alignment strategy

**Alternative 2: Use Turbopack Instead of Webpack**
- Turbopack is faster and default in v16
- Requires rewriting custom webpack config for Redoc
- **Rejected**: Webpack config preservation is simpler, Turbopack migration can be future work

---

## 8. Fumadocs 16.0.5 Component Architecture

### Question
What is the exact component structure and export pattern for Fumadocs 16.0.5?

### Research Findings

**Fumadocs Architecture:**
- **fumadocs-core** (16.0.5) - Headless content handling and document logic
- **fumadocs-ui** (16.0.5) - UI component library for rendering
- **fumadocs-mdx** (13.0.2) - MDX processing and compilation

**Component Hierarchy:**
```
RootProvider (root layout - required)
  └── DocsLayout (docs layout)
        └── DocsPage (page component)
              ├── DocsTitle
              ├── DocsDescription
              └── DocsBody (MDX content)
```

**Key Components for Embedding:**

From `fumadocs-ui/page`:
- `DocsPage` - Main page wrapper component (props: `toc`, `full`, `lastUpdate`, `tableOfContent`, `footer`)
- `DocsBody` - Content body with typography styles

From `fumadocs-ui/layouts/docs`:
- `DocsLayout` - Layout with sidebar and navbar (props: `tree`, `sidebar`, `nav`, `links`, `githubUrl`)

From `fumadocs-ui/provider/next`:
- `RootProvider` - Context provider for theme and search (props: `search`, `theme`)

**Source Configuration Pattern:**

```typescript
// packages/docs/lib/source.ts
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx/runtime/next';
import { docs } from '../source.config';

export const source = loader({
  baseUrl: '/docs', // Configurable base path
  source: createMDXSource(docs),
});
```

**generateStaticParams Implementation:**
```typescript
export function generateStaticParams() {
  return source.generateParams();
}
```

**generateMetadata Implementation:**
```typescript
import type { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
```

### Decision

**Export Strategy**: Export Fumadocs source and let consuming app (apps/web) import Fumadocs UI components directly from fumadocs-ui packages.

**Recommended Exports from packages/docs:**

```typescript
// packages/docs/lib/index.ts
export { source } from './source';

// packages/docs/package.json
{
  "exports": {
    ".": "./lib/index.ts",
    "./source": "./lib/source.ts"
  }
}
```

**Apps/web imports Fumadocs UI directly:**
```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import { source } from 'docs';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>{page.data.body}</DocsBody>
    </DocsPage>
  );
}
```

### Rationale

- **Separation of Concerns**: packages/docs exports content (source), apps/web handles rendering
- **Component Flexibility**: apps/web can customize Fumadocs UI components without modifying packages/docs
- **Self-Contained Source**: Source configuration (basePath, MDX processing) lives in packages/docs
- **Type Safety**: TypeScript interfaces from fumadocs-core ensure type-safe source usage
- **Future-Proof**: Fumadocs UI updates can be consumed directly by apps/web without package/docs changes

### Alternatives Considered

**Alternative 1: Export Wrapped Components from packages/docs**
- packages/docs exports `<DocsComponent>` that wraps DocsPage + DocsLayout
- More encapsulation but less flexibility
- **Rejected**: Reduces apps/web's ability to customize layout integration

**Alternative 2: Re-export Fumadocs UI from packages/docs**
- packages/docs re-exports fumadocs-ui components
- Simpler imports but adds dependency management complexity
- **Rejected**: Violates "minimal exports" principle, creates unnecessary abstraction layer

---

## Next Phase

All research tasks complete, including version-specific analysis for Next.js 16.0, Fumadocs 16.0.5, Bun 1.3.0, and Turborepo 2.5.8.

Proceed to **Phase 1: Design & Contracts** to define:
- Data models (configuration interfaces) - Updated with Next.js 16 async params types
- API contracts (export signatures) - Updated with Fumadocs 16.0.5 source API
- Routing contracts (URL mappings) - Updated with async route handler patterns
- Quickstart guide (developer workflow) - Updated with Next.js 16 migration steps
