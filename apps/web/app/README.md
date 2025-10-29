# Embedded Documentation Route

This route embeds Fumadocs from packages/docs within the apps/web application.

**Pattern:** Import source from 'docs' workspace package
**UI:** Import DocsPage, DocsBody from 'fumadocs-ui/page'
**Next.js 16:** Async params pattern required

## Route Structure

- `/docs/layout.tsx` - Provides DocsLayout with page tree from source
- `/docs/[[...slug]]/page.tsx` - Catch-all route rendering documentation pages

## Implementation Notes

- The `source` object comes from `packages/docs/lib/index.ts`
- Fumadocs UI components (`DocsPage`, `DocsBody`, `DocsLayout`) are imported from `fumadocs-ui`
- Next.js 16 requires awaiting `params` in async server components
- MDX components are imported from `fumadocs-ui/mdx` for Card, Cards, etc.

## For Transfer to Larger Monorepo

Replicate this file structure when transferring to a larger monorepo:
1. Create `/docs/layout.tsx` with DocsLayout and page tree
2. Create `/docs/[[...slug]]/page.tsx` with async params pattern
3. Import source from the docs workspace package
4. Import UI components from fumadocs-ui
