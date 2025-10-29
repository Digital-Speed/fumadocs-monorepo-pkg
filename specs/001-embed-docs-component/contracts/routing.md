# Routing Contract: Embedded Documentation

**Date**: 2025-10-29
**Purpose**: Define the routing architecture for embedding Fumadocs (packages/docs) into apps/web

---

## Overview

This contract specifies how apps/web routes documentation requests to the embedded Fumadocs components from packages/docs. The routing strategy uses Next.js App Router's optional catch-all segments to handle all `/docs/*` paths.

---

## Route Structure

### Base Path

**Documentation Base**: `/docs`

All documentation content is namespaced under the `/docs` path in apps/web. This prevents conflicts with other application routes.

### Catch-All Pattern

**Route Pattern**: `/docs/[[...slug]]`

The optional catch-all route (`[[...slug]]`) handles:
- Root documentation page: `/docs` (slug = undefined)
- Single-segment pages: `/docs/getting-started` (slug = ['getting-started'])
- Multi-segment pages: `/docs/api/reference` (slug = ['api', 'reference'])

---

## Route Mapping

### Documentation Routes → Fumadocs Pages

| URL Path | Slug Parameter | Fumadocs Target | Description |
|----------|---------------|-----------------|-------------|
| `/docs` | `undefined` or `[]` | Root page | Documentation home/index |
| `/docs/getting-started` | `['getting-started']` | getting-started.mdx | Getting started guide |
| `/docs/api/reference` | `['api', 'reference']` | api/reference.mdx | API reference page |
| `/docs/guides/deployment` | `['guides', 'deployment']` | guides/deployment.mdx | Deployment guide |

### Fumadocs File Structure

Fumadocs expects MDX files in the `packages/docs/content/` directory:

```
packages/docs/content/
├── index.mdx                  # Root page (/docs)
├── getting-started.mdx        # /docs/getting-started
├── api/
│   ├── reference.mdx          # /docs/api/reference
│   └── examples.mdx           # /docs/api/examples
└── guides/
    ├── deployment.mdx         # /docs/guides/deployment
    └── configuration.mdx      # /docs/guides/configuration
```

---

## Implementation

### apps/web Route Handler

**File**: `apps/web/app/docs/[[...slug]]/page.tsx`

```typescript
import { DocsPage, generateStaticParams, generateMetadata } from 'docs'
import type { PageProps } from 'docs'

// Re-export static generation functions
export { generateStaticParams, generateMetadata }

/**
 * Embedded documentation page handler.
 * Renders Fumadocs content within apps/web layout.
 */
export default function EmbeddedDocsPage({ params }: PageProps) {
  return <DocsPage params={params} />
}
```

### Layout Wrapping

**File**: `apps/web/app/layout.tsx`

The root layout wraps all routes, including `/docs/*`, with the application header and footer:

```typescript
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**Visual Structure**:
```
┌─────────────────────────────┐
│        Header               │  ← apps/web layout
├─────────────────────────────┤
│                             │
│   [Fumadocs Content]        │  ← packages/docs embedded
│   - Sidebar                 │
│   - MDX Body                │
│   - Search                  │
│                             │
├─────────────────────────────┤
│        Footer               │  ← apps/web layout
└─────────────────────────────┘
```

---

## Route Generation

### Static Generation at Build Time

Fumadocs provides `generateStaticParams()` to enumerate all documentation routes:

```typescript
// packages/docs exports this function
export async function generateStaticParams(): Promise<StaticParam[]> {
  // Scan content/ directory for MDX files
  // Return array of slug combinations

  return [
    { slug: [] },                         // /docs
    { slug: ['getting-started'] },        // /docs/getting-started
    { slug: ['api', 'reference'] },       // /docs/api/reference
    { slug: ['guides', 'deployment'] },   // /docs/guides/deployment
  ]
}
```

Apps/web re-exports this function so Next.js generates static pages at build time:

```bash
bun build
# → Next.js calls generateStaticParams()
# → Generates HTML for all documentation pages
# → Output: .next/server/app/docs/[slug]/page.html
```

### Dynamic Fallback

If a route is not statically generated, Next.js falls back to on-demand rendering:
- User requests `/docs/new-page`
- Not in static params → render on-demand
- Fumadocs checks if `content/new-page.mdx` exists
- Returns 404 if not found

---

## Metadata Handling

### SEO and Open Graph

Each documentation page should have proper metadata for SEO:

```typescript
// packages/docs exports generateMetadata
export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const { slug } = params
  const page = await getDocumentationPage(slug)

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'article',
    },
  }
}
```

Apps/web can enhance or override metadata:

```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import { generateMetadata as docsGenerateMetadata } from 'docs'

export async function generateMetadata(props: MetadataParams) {
  const metadata = await docsGenerateMetadata(props)

  // Add site-specific branding
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      siteName: 'My Application',
      images: ['/og-image.png'],
    },
  }
}
```

---

## Navigation Behavior

### Internal Documentation Links

Links within documentation (e.g., `[Getting Started](/getting-started)`) should:
- Use relative paths from `/docs` base
- Be handled by Next.js client-side router
- Preserve apps/web layout during navigation

**Example**:
```markdown
<!-- In content/index.mdx -->
Check out our [API Reference](/api/reference).
```

Fumadocs transforms this to:
```html
<Link href="/docs/api/reference">API Reference</Link>
```

### External Navigation

Links from apps/web header/footer to documentation:
```tsx
// apps/web/components/Header.tsx
<Link href="/docs">Documentation</Link>
```

### Back Navigation

Users can navigate from documentation back to apps/web routes:
```tsx
// apps/web/components/Header.tsx
<Link href="/">Home</Link>
<Link href="/about">About</Link>
<Link href="/docs">Docs</Link>
```

---

## Error Handling

### 404 Not Found

If a documentation page doesn't exist:

1. User navigates to `/docs/nonexistent`
2. Fumadocs checks `content/nonexistent.mdx`
3. File not found → return Next.js 404
4. Rendered with apps/web layout (header + footer + 404 message)

**Implementation**:
```typescript
// packages/docs handles 404 internally
export default function DocsPage({ params }: PageProps) {
  const page = await getDocumentationPage(params.slug)

  if (!page) {
    notFound() // Next.js 404 helper
  }

  return <DocsLayout page={page} />
}
```

### Build Errors

If Fumadocs MDX compilation fails during build:
- Build error with clear message
- Identify problematic MDX file
- Fail fast to prevent broken deployment

---

## Routing Constraints

### Must

- All documentation routes MUST be prefixed with `/docs`
- Apps/web layout (header/footer) MUST wrap all `/docs/*` routes
- Navigation within `/docs` MUST preserve layout
- Route parameters MUST match Fumadocs file structure

### Must Not

- Documentation routes MUST NOT conflict with apps/web routes
- Fumadocs MUST NOT override apps/web layout
- Internal doc links MUST NOT break out of `/docs` namespace (unless intentional)

### Should

- Documentation routes SHOULD be statically generated at build time
- Metadata SHOULD be complete for SEO
- 404 pages SHOULD maintain apps/web branding

---

## Testing Scenarios

### Route Resolution

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| Root docs page | Navigate to `/docs` | Fumadocs home page with apps/web layout |
| Single-segment | Navigate to `/docs/getting-started` | Getting started page with apps/web layout |
| Multi-segment | Navigate to `/docs/api/reference` | API reference page with apps/web layout |
| 404 handling | Navigate to `/docs/nonexistent` | 404 page with apps/web layout |
| Internal navigation | Click link in docs to another doc page | Client-side navigation, layout preserved |
| External navigation | Click header link to `/about` | Navigate away from docs, different layout |

### Build-Time Generation

| Test Case | Expected Outcome |
|-----------|------------------|
| Run `bun build` | All doc pages generated in `.next/` output |
| Modify MDX content | Rebuild generates updated pages |
| Add new MDX file | New route included in generateStaticParams |
| Remove MDX file | Route removed from static params, 404 if accessed |

---

## Diagram: Route Flow

```
User Request: /docs/getting-started
         │
         ▼
┌─────────────────────────────────────┐
│   apps/web Next.js Router           │
│   Matches: /docs/[[...slug]]        │
│   Params: { slug: ['getting-start  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   apps/web/app/layout.tsx           │
│   Renders: <Header /> + children    │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   apps/web/app/docs/[[...slug]]/    │
│   page.tsx                          │
│   Imports: DocsPage from 'docs'     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   packages/docs DocsPage component  │
│   Reads: content/getting-started.m  │
│   Renders: Fumadocs UI + MDX        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   apps/web/app/layout.tsx           │
│   Renders: </main> + <Footer />     │
└─────────────────────────────────────┘
         │
         ▼
     HTML Response
```

---

## Verification Checklist

- [ ] Route `/docs` renders Fumadocs home page with apps/web layout
- [ ] Route `/docs/getting-started` renders getting-started page
- [ ] Route `/docs/api/reference` renders nested reference page
- [ ] Non-existent route `/docs/invalid` shows 404 with layout
- [ ] Internal doc links navigate without page reload
- [ ] Header/footer visible on all `/docs/*` routes
- [ ] generateStaticParams produces all expected routes
- [ ] Metadata correct for each documentation page
- [ ] Build completes without routing errors
- [ ] Type checking passes with `bun run check-types`
