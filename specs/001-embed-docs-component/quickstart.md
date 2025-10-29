# Quickstart: Embedded Documentation

**Date**: 2025-10-29
**Purpose**: Developer guide for working with the embedded Fumadocs documentation in apps/web

---

## Overview

This guide explains how to develop, build, and verify the embedded documentation feature. The documentation from `packages/docs` (Fumadocs) is embedded into `apps/web` and accessible at `/docs`.

---

## Architecture Pattern

**Key Design Decision** (from [research.md Section 8](./research.md#8-fumadocs-1605-component-architecture)):

```
packages/docs          apps/web
─────────────          ────────
exports source    ──►  imports source + fumadocs-ui components

source object          import { source } from 'docs'
(data + API)           import { DocsPage } from 'fumadocs-ui/page'
```

**Why this pattern?**
- **Maximum Flexibility**: Apps/web can customize Fumadocs UI components directly
- **No Wrapper Complexity**: Avoid abstraction layers that hide Fumadocs features
- **Type Safety**: Direct imports provide full TypeScript support
- **Best Practice**: Follows Fumadocs 16.0.5 recommended architecture

**What packages/docs exports**:
```typescript
// packages/docs/lib/index.ts
export { source } from './source';  // Fumadocs source object ONLY
```

**What apps/web imports**:
```typescript
// Source from packages/docs
import { source } from 'docs';

// UI components directly from fumadocs-ui
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
```

**Next.js 16 Breaking Change**:
```typescript
// ⚠️ params is now a Promise that MUST be awaited
export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // Must await before accessing slug
  const page = source.getPage(slug);
  // ...
}
```

**See also**:
- [contracts/exports.ts](./contracts/exports.ts) - Complete API contract
- [data-model.md Section 4](./data-model.md#4-fumadocs-source-interface-actual-api-from-fumadocs-core-1605) - FumadocsSource interface
- [research.md Section 7](./research.md#7-nextjs-160-breaking-changes-and-migration) - Next.js 16 async params

---

## Prerequisites

- **Bun**: v1.3.0 (package manager)
- **Node.js**: >= 18
- **TypeScript**: 5.9.2+
- **Next.js**: 16.0 (both apps/web and packages/docs)

---

## Development Workflow

### 1. Start Development Server

From the monorepo root:

```bash
bun dev
```

**What happens**:
- Turborepo starts `dev` task for all workspaces
- apps/web runs on `http://localhost:3000`
- packages/docs runs in background (port auto-assigned)
- Hot reload enabled for both workspaces

**Expected output**:
```
turbo dev
• Running dev in 2 packages
web:dev: ▲ Next.js 16.0.0
web:dev: - Local: http://localhost:3000
docs:dev: ▲ Next.js 16.0.0
docs:dev: - Local: http://localhost:3001
```

### 2. Access Documentation

Open your browser and navigate to:

```
http://localhost:3000/docs
```

**What you'll see**:
- apps/web header (site-wide navigation)
- Fumadocs content (sidebar, search, MDX documentation)
- apps/web footer

### 3. Edit Documentation Content

**Modify MDX files**:

```bash
# Edit any documentation file
packages/docs/content/getting-started.mdx
```

**Result**:
- Changes detected by Fumadocs dev server
- packages/docs rebuilds MDX
- apps/web Fast Refresh triggers
- Browser auto-reloads (< 3 seconds)

**Verify hot reload**:
1. Open `/docs/getting-started` in browser
2. Edit `packages/docs/content/getting-started.mdx`
3. Save file
4. Browser should update automatically

### 4. Modify apps/web Layout

**Edit header or footer**:

```bash
# Edit site header
apps/web/components/Header.tsx

# Edit site footer
apps/web/components/Footer.tsx

# Or modify root layout
apps/web/app/layout.tsx
```

**Result**:
- apps/web dev server detects changes
- Fast Refresh updates browser
- Changes apply to all routes including `/docs`

---

## Build for Production

### 1. Run Production Build

From the monorepo root:

```bash
bun build
```

**What happens**:
1. Turborepo builds `packages/docs` first (dependency of apps/web)
2. Fumadocs generates static pages from MDX
3. apps/web builds, transpiling packages/docs components
4. Unified production build in `apps/web/.next/`

**Expected output**:
```
turbo build
• Running build in 2 packages
docs:build: ✓ Compiled successfully
docs:build: ✓ Generated static pages
web:build: ✓ Compiled successfully
web:build: ✓ Collecting page data
web:build: ✓ Generating static pages (42/42)
```

### 2. Test Production Build Locally

```bash
# From apps/web directory
cd apps/web
bun start
```

Navigate to `http://localhost:3000/docs` to verify production build.

---

## Verification

After making changes, run all verification gates:

### Type Checking

```bash
bun run check-types
```

**What it checks**:
- TypeScript compilation across all workspaces
- Type safety for packages/docs exports
- Type safety for apps/web imports
- Zero tolerance for type errors

**Expected output**:
```
turbo run check-types
• Running check-types in 2 packages
docs:check-types: ✓ No type errors
web:check-types: ✓ No type errors
```

### Linting

```bash
bun lint
```

**What it checks**:
- ESLint rules across all workspaces
- Zero warnings policy (`--max-warnings 0`)
- Code style consistency

**Expected output**:
```
turbo run lint
• Running lint in 2 packages
docs:lint: ✓ No ESLint warnings
web:lint: ✓ No ESLint warnings
```

### Full Build Verification

```bash
bun build
```

**What it checks**:
- All workspaces compile successfully
- No build-time errors
- Static page generation completes

---

## Troubleshooting

### Hot Reload Not Working

**Symptom**: Changes to packages/docs don't appear in apps/web browser

**Solutions**:
1. Check Turborepo is running both dev servers:
   ```bash
   # Should show both web:dev and docs:dev
   bun dev
   ```

2. Verify `transpilePackages` in apps/web:
   ```javascript
   // apps/web/next.config.js
   module.exports = {
     transpilePackages: ['docs'],
   }
   ```

3. Clear Next.js cache and restart:
   ```bash
   rm -rf apps/web/.next packages/docs/.next
   bun dev
   ```

### Styles Conflict

**Symptom**: Documentation styles look broken or conflict with apps/web styles

**Solutions**:
1. Check Tailwind configuration isolation:
   ```javascript
   // packages/docs/tailwind.config.js
   module.exports = {
     content: [
       './app/**/*.{ts,tsx}',
       './components/**/*.{ts,tsx}',
       './content/**/*.{md,mdx}',
     ],
   }
   ```

2. Ensure CSS import order in apps/web:
   ```typescript
   // apps/web/app/layout.tsx
   import './globals.css'  // Apps/web styles first
   ```

3. Use CSS modules or scoped styles for conflicts

### Routes Not Found (404)

**Symptom**: Navigating to `/docs` shows 404

**Solutions**:
1. Verify catch-all route exists:
   ```bash
   ls apps/web/app/docs/[[...slug]]/page.tsx
   ```

2. Check route file syntax (Next.js 16 pattern):
   ```typescript
   // apps/web/app/docs/[[...slug]]/page.tsx
   import { source } from 'docs';
   import { DocsPage, DocsBody } from 'fumadocs-ui/page';
   import { notFound } from 'next/navigation';

   interface PageProps {
     params: Promise<{ slug?: string[] }>;  // ⚠️ Promise in Next.js 16
   }

   export function generateStaticParams() {
     return source.generateParams();
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

3. Verify packages/docs is listed in apps/web dependencies:
   ```json
   // apps/web/package.json
   {
     "dependencies": {
       "docs": "*"
     }
   }
   ```

4. Run install to link workspaces:
   ```bash
   bun install
   ```

### TypeScript Errors

**Symptom**: `Cannot find module 'docs'` or type errors

**Solutions**:
1. Verify packages/docs exports field:
   ```json
   // packages/docs/package.json
   {
     "exports": {
       ".": "./lib/index.ts"
     }
   }
   ```

2. Check apps/web tsconfig extends shared config:
   ```json
   // apps/web/tsconfig.json
   {
     "extends": "@repo/typescript-config/nextjs.json"
   }
   ```

3. Run type check for detailed error:
   ```bash
   cd apps/web
   bun run check-types
   ```

### Build Failures

**Symptom**: `bun build` fails with errors

**Solutions**:
1. Check turbo.json dependency chain:
   ```json
   {
     "tasks": {
       "build": {
         "dependsOn": ["^build"]
       }
     }
   }
   ```

2. Build workspaces individually to isolate issue:
   ```bash
   # Build docs first
   cd packages/docs
   bun run build

   # Then build web
   cd ../../apps/web
   bun run build
   ```

3. Check for MDX compilation errors:
   ```bash
   # Fumadocs MDX processing
   cd packages/docs
   bun run postinstall  # Runs fumadocs-mdx
   ```

---

## Development Tips

### Workspace Filtering

Use Turbo filters to work on specific workspaces:

```bash
# Run dev only for apps/web
bun dev --filter=web

# Run type check only for packages/docs
bun run check-types --filter=docs

# Build only affected workspaces
bun build --filter=web...
```

### Viewing Build Output

Analyze production bundle size:

```bash
cd apps/web
bun run build

# Next.js outputs bundle analysis
# Look for packages/docs components in output
```

### Adding New Documentation Pages

1. Create MDX file in packages/docs:
   ```bash
   echo "# New Page" > packages/docs/content/new-page.mdx
   ```

2. Fumadocs auto-discovers the file (via `fumadocs-mdx`)

3. Route automatically available: `/docs/new-page`

4. No restart required (dev mode hot reloads)

### Working with the Source Export Pattern

**Key Architecture**: packages/docs exports the Fumadocs source object. Apps/web imports source and UI components separately.

```typescript
// apps/web/app/docs/[[...slug]]/page.tsx
import { source } from 'docs';  // ⭐ Source object from packages/docs
import { DocsPage, DocsBody } from 'fumadocs-ui/page';  // ⭐ UI from fumadocs-ui
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// ⚠️ Next.js 16: params is a Promise
interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

// Static generation at build time
export function generateStaticParams() {
  return source.generateParams();  // Returns all documentation routes
}

// Metadata generation for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;  // ⚠️ Must await in Next.js 16
  const page = source.getPage(slug);  // Get page data from source

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

// Page component
export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // ⚠️ Must await in Next.js 16
  const page = source.getPage(slug);  // Get page data from source

  if (!page) notFound();  // 404 if page not found

  return (
    <DocsPage toc={page.data.toc}>  {/* Table of contents */}
      <DocsBody>{page.data.body}</DocsBody>  {/* Rendered MDX */}
    </DocsPage>
  );
}
```

**Customizing Fumadocs UI Components**:

```typescript
// apps/web/app/docs/layout.tsx
import { source } from 'docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}  // Navigation tree from source
      nav={{
        title: 'My Documentation',
        transparentMode: true,
      }}
      sidebar={{
        enabled: true,
        prefetch: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}
```

**See also**:
- [contracts/exports.ts](./contracts/exports.ts) - Complete API contract
- [data-model.md](./data-model.md) - More code examples
- [Fumadocs UI docs](https://fumadocs.vercel.app) - Component customization

---

## Verification Checklist

Before committing changes:

- [ ] `bun dev` starts both workspaces without errors
- [ ] Navigate to `http://localhost:3000/docs` - documentation renders
- [ ] Edit MDX content - changes appear in browser < 3 seconds
- [ ] Edit apps/web layout - documentation reflects layout changes
- [ ] `bun run check-types` passes with zero errors
- [ ] `bun lint` passes with zero warnings
- [ ] `bun build` completes successfully
- [ ] Production build serves correctly via `bun start`
- [ ] All documentation routes accessible (test several pages)
- [ ] Search works in embedded documentation
- [ ] Navigation between docs pages preserves layout

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Verify

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.3.0

      - run: bun install

      - name: Type Check
        run: bun run check-types

      - name: Lint
        run: bun lint

      - name: Build
        run: bun build
```

---

## Getting Help

**Documentation Issues**:
- Check Fumadocs docs: https://fumadocs.vercel.app
- Review packages/docs configuration

**Build Issues**:
- Check Turborepo docs: https://turborepo.com
- Review turbo.json configuration

**Next.js Issues**:
- Check Next.js docs: https://nextjs.org/docs
- Review apps/web next.config.js

**Monorepo Issues**:
- Check Bun workspace docs: https://bun.sh/docs/install/workspaces
- Review root package.json workspaces field

---

## Next Steps

After verifying the embedded documentation works:

1. Customize apps/web header/footer with site branding
2. Add navigation links to documentation in header
3. Customize Fumadocs theme to match brand colors
4. Add more documentation content to packages/docs/content/
5. Configure deployment (Vercel, Netlify, etc.)

For implementation details, see:
- [Data Model](./data-model.md) - TypeScript interfaces
- [API Contracts](./contracts/exports.ts) - Export signatures
- [Routing Contract](./contracts/routing.md) - URL structure
