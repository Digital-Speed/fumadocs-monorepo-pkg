# Data Model: Embed Documentation as Component

**Date**: 2025-10-29
**Purpose**: Define TypeScript interfaces and configuration structures for embedding Fumadocs into apps/web

---

## Overview

This document defines the data structures, interfaces, and configuration objects required to embed packages/docs into apps/web. The model focuses on type-safe component exports, routing parameters, and metadata handling.

---

## 1. Component Export Interfaces

### PageProps (Next.js 16)

The props interface for embedded documentation pages, matching Next.js 16 App Router conventions with async params.

**⚠️ BREAKING CHANGE in Next.js 16**: `params` and `searchParams` are now `Promise` types that MUST be awaited.

```typescript
export interface PageProps {
  params: Promise<{
    slug?: string[];  // Optional array of path segments (e.g., ['getting-started'] or ['api', 'reference'])
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;  // Query parameters
  }>;
}
```

**Purpose**: Type-safe props for catch-all route in apps/web (Next.js 16 compatible)

**Usage**:
```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
export default async function EmbeddedDocsPage(props: PageProps) {
  const params = await props.params;  // ✅ Must await in Next.js 16
  const searchParams = await props.searchParams;

  return <DocsPage params={params} searchParams={searchParams} />
}
```

**Validation**:
- `slug` is optional (undefined for `/docs` root route)
- `slug` is array to support nested paths (`/docs/api/reference` → `['api', 'reference']`)
- **Next.js 16 Requirement**: Page component must be `async` to await params

---

## 2. Metadata Generation

### MetadataParams (Next.js 16)

Parameters passed to `generateMetadata` for SEO and page metadata.

**⚠️ BREAKING CHANGE in Next.js 16**: `params` and `searchParams` are now `Promise` types.

```typescript
export interface MetadataParams {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export type GenerateMetadataFunction = (props: MetadataParams) => Promise<Metadata>;
```

**Purpose**: Enable apps/web to generate proper metadata (title, description, og:image) for documentation pages

**Usage**:
```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import type { Metadata } from 'next';
import type { MetadataParams } from 'docs';

export async function generateMetadata(props: MetadataParams): Promise<Metadata> {
  const params = await props.params;  // ✅ Must await in Next.js 16
  const { slug } = params;

  // Get page data from Fumadocs source
  const page = await getPageData(slug);

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: 'My Application'
    }
  };
}
```

**Validation**:
- Returns Next.js `Metadata` object
- Function must be async and return `Promise<Metadata>`
- Must await params before accessing slug

---

## 3. Static Generation

### StaticParams

Parameters for static page generation at build time.

```typescript
export interface StaticParam {
  slug: string[];  // Path segments for a documentation page
}

export type GenerateStaticParamsFunction = () => Promise<StaticParam[]> | StaticParam[];
```

**Purpose**: Generate all documentation routes at build time for optimal performance

**Usage**:
```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import { generateStaticParams as docsGenerateStaticParams } from 'docs'

export async function generateStaticParams() {
  // Re-export Fumadocs static param generation
  return docsGenerateStaticParams()
}
```

**Example Output**:
```javascript
[
  { slug: [] },                     // /docs
  { slug: ['getting-started'] },    // /docs/getting-started
  { slug: ['api', 'reference'] },   // /docs/api/reference
  { slug: ['guides', 'deployment'] } // /docs/guides/deployment
]
```

**Validation**:
- Each slug is an array (even for single-segment paths)
- Empty array represents root documentation page

---

## 4. Fumadocs Source Interface (Actual API from fumadocs-core 16.0.5)

### FumadocsSource

The actual interface exported from packages/docs based on Fumadocs 16.0.5 API.

**Decision from Research**: Export Fumadocs source object, NOT wrapped components. Apps/web imports Fumadocs UI components directly.

```typescript
import { loader } from 'fumadocs-core/source';

// Source object created by loader()
export interface FumadocsSource {
  /**
   * Retrieve a single documentation page by slug
   * @param slugs - Array of path segments
   * @param locale - Optional i18n locale
   * @returns Page object or undefined if not found
   */
  getPage(slugs?: string[], locale?: string): Page | undefined;

  /**
   * Retrieve all documentation pages
   * @param locale - Optional i18n locale
   * @returns Array of all pages
   */
  getPages(locale?: string): Page[];

  /**
   * Generate static params for Next.js generateStaticParams()
   * @returns Array of param objects for static generation
   */
  generateParams(): Array<{ slug: string[] }>;

  /**
   * Navigation tree for sidebar/menu
   */
  pageTree: PageTree;
}

// Page data structure
export interface Page {
  url: string;
  slugs: string[];
  data: {
    title: string;
    description?: string;
    toc: TOCItem[];
    body: React.ReactNode;  // Rendered MDX content
    structuredData: StructuredData;
    lastModified?: Date;
    [key: string]: any;  // Custom frontmatter fields
  };
}

// Table of contents item
export interface TOCItem {
  title: string;
  url: string;
  depth: number;
}
```

**Purpose**: Type-safe interface for Fumadocs source exported from packages/docs

**Usage**:
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

// apps/web/app/docs/[[...slug]]/page.tsx
import { source } from 'docs';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';

export function generateStaticParams() {
  return source.generateParams();
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>{page.data.body}</DocsBody>
    </DocsPage>
  );
}
```

**Validation**:
- Source configuration (basePath) defined in packages/docs
- Apps/web does NOT pass configuration to components (self-contained pattern)
- Fumadocs UI components imported directly from fumadocs-ui in apps/web

---

## 5. Package Exports Structure (Fumadocs 16.0.5 Pattern)

### Exported API from packages/docs

The public API surface exported from packages/docs based on Fumadocs 16.0.5 architecture.

**Decision from Research**: Export source only, NOT components. Apps/web imports Fumadocs UI directly.

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

// Export types if needed
export type { FumadocsSource, Page, TOCItem } from 'fumadocs-core/source';
```

**Purpose**: Single entry point for apps/web to access documentation content via Fumadocs source API

**Package.json Configuration**:
```json
{
  "name": "docs",
  "exports": {
    ".": "./lib/index.ts",
    "./source": "./lib/source.ts"
  }
}
```

**Apps/web imports**:
```typescript
// Import source from packages/docs
import { source } from 'docs';

// Import UI components directly from fumadocs-ui
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────┐
│              apps/web                           │
│                                                 │
│  app/docs/[[...slug]]/page.tsx                  │
│  ├─ imports: DocsPage                           │
│  ├─ imports: generateStaticParams               │
│  ├─ imports: generateMetadata                   │
│  └─ provides: DocsConfig (optional)             │
│                                                 │
│                   │                             │
│                   │ imports from                │
│                   ▼                             │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│            packages/docs                        │
│                                                 │
│  lib/index.ts (public API)                      │
│  ├─ exports: DocsPage component                 │
│  ├─ exports: generateStaticParams function      │
│  ├─ exports: generateMetadata function          │
│  └─ exports: types (PageProps, DocsConfig, etc) │
│                                                 │
│  app/docs/[...slug]/page.tsx (Fumadocs)         │
│  └─ renders: MDX content from content/          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## State Transitions

### Build-Time States

1. **Development Mode**:
   - Fumadocs runs in dev mode (hot reload enabled)
   - Apps/web transpiles packages/docs components
   - Fast Refresh updates both workspaces

2. **Build-Time Generation**:
   - generateStaticParams() called → list of all doc routes
   - For each route: generateMetadata() → page metadata
   - DocsPage rendered with params → static HTML

3. **Production Runtime**:
   - Static pages served from `.next/` output
   - Client-side navigation uses Next.js router
   - Search and interactive features hydrate on client

---

## Validation Rules

### Type Safety

- All interfaces must be exported from packages/docs/lib/types.ts
- Apps/web imports must use type-only imports where possible: `import type { PageProps } from 'docs'`
- TypeScript strict mode enforced via `bun run check-types`

### Configuration Validation

- DocsConfig optional fields have sensible defaults
- Invalid basePath (not starting with `/`) logs warning, falls back to `/docs`
- Theme colors validated as hex codes or CSS color names

### Route Validation

- slug arrays cannot contain empty strings
- slug segments match Fumadocs file structure
- 404 handling for invalid slugs delegated to Fumadocs

---

## Dependencies

**Required Types**:
- `Metadata` from `next` (Next.js metadata type)
- `ReactNode` from `react` (for children props)

**Optional Dependencies**:
- None - all configuration optional with Fumadocs defaults

---

## Constraints

- **Immutability**: Configuration objects (DocsConfig) should be treated as immutable
- **Serialization**: All interfaces must be JSON-serializable (no functions in config objects)
- **Backward Compatibility**: Adding new optional fields to DocsConfig is safe; removing fields is breaking change

---

## Examples

### Basic Embedding (Minimal Configuration - Next.js 16 + Fumadocs 16.0.5)

```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
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

### Advanced Embedding (With Custom Layout - Next.js 16 + Fumadocs 16.0.5)

```typescript
// apps/web/app/docs/layout.tsx
import { source } from 'docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { HomeIcon } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: 'My Documentation',
        transparentMode: true,
      }}
      links={[
        { text: 'Home', url: '/', icon: <HomeIcon /> },
        { text: 'API', url: '/api-docs' },
      ]}
      githubUrl="https://github.com/user/repo"
      sidebar={{
        enabled: true,
        prefetch: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}

// apps/web/app/docs/[[...slug]]/page.tsx
import { source } from 'docs';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams() {
  return source.generateParams();
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  return (
    <DocsPage
      toc={page.data.toc}
      lastUpdate={page.data.lastModified}
      tableOfContent={{
        style: 'clerk',
        enabled: true,
      }}
    >
      <DocsBody>{page.data.body}</DocsBody>
    </DocsPage>
  );
}
```

---

## Validation Checklist

- [ ] All interfaces exported from `packages/docs/lib/types.ts`
- [ ] TypeScript strict mode passes (`bun run check-types`)
- [ ] No circular dependencies between packages/docs and apps/web
- [ ] All optional fields have documented defaults
- [ ] Examples compile without TypeScript errors
