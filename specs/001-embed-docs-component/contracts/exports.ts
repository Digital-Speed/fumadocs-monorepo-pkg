/**
 * Public API Contract for packages/docs (Fumadocs 16.0.5 + Next.js 16)
 *
 * This file defines the TypeScript interfaces that packages/docs exports
 * for consumption by apps/web. Based on actual Fumadocs 16.0.5 API and
 * Next.js 16 async params requirements.
 *
 * **Key Architectural Decision (from research.md):**
 * - packages/docs exports ONLY the Fumadocs source object
 * - apps/web imports Fumadocs UI components directly from fumadocs-ui
 * - This pattern provides maximum flexibility and follows Fumadocs best practices
 *
 * @packageDocumentation
 */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// =============================================================================
// Next.js 16 Page Props (⚠️ BREAKING CHANGE)
// =============================================================================

/**
 * Props for pages in Next.js 16 App Router.
 * **BREAKING CHANGE**: params and searchParams are now Promise types that MUST be awaited.
 *
 * @see https://nextjs.org/docs/app/guides/upgrading/version-16
 */
export interface PageProps {
  /**
   * Route parameters from Next.js App Router (Promise in Next.js 16)
   * Must be awaited before accessing properties
   */
  params: Promise<{
    /**
     * Path segments for the documentation page.
     * - undefined: Root documentation page (/docs)
     * - ['getting-started']: Single segment (/docs/getting-started)
     * - ['api', 'reference']: Nested segments (/docs/api/reference)
     */
    slug?: string[]
  }>

  /**
   * Query string parameters (Promise in Next.js 16)
   * Must be awaited before accessing properties
   */
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

/**
 * Parameters for metadata generation function (Next.js 16)
 * Matches PageProps structure with Promise types
 */
export interface MetadataParams {
  params: Promise<{
    slug?: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

/**
 * Function signature for generating page metadata.
 * Must be async and return Promise<Metadata> in Next.js 16.
 */
export type GenerateMetadataFunction = (
  props: MetadataParams
) => Promise<Metadata>

// =============================================================================
// Static Generation
// =============================================================================

/**
 * Single static route parameter for build-time generation
 */
export interface StaticParam {
  /**
   * Path segments for a documentation page.
   * Empty array represents the root page.
   *
   * @example
   * { slug: [] }                     // /docs
   * { slug: ['getting-started'] }    // /docs/getting-started
   * { slug: ['api', 'reference'] }   // /docs/api/reference
   */
  slug: string[]
}

/**
 * Function signature for generating all documentation routes at build time.
 * Returns an array of all possible slug combinations.
 */
export type GenerateStaticParamsFunction = () => StaticParam[]

// =============================================================================
// Fumadocs Source API (fumadocs-core 16.0.5)
// =============================================================================

/**
 * Table of contents item from Fumadocs
 */
export interface TOCItem {
  title: string
  url: string
  depth: number
}

/**
 * Structured data for search indexing
 */
export interface StructuredData {
  headings: Array<{
    id: string
    content: string
  }>
  contents: Array<{
    heading: string
    content: string
  }>
}

/**
 * A single documentation page from Fumadocs source
 */
export interface Page {
  /** Full URL path for the page */
  url: string

  /** Path segments array (matches params.slug) */
  slugs: string[]

  /** Page data and content */
  data: {
    /** Page title from frontmatter */
    title: string

    /** Page description from frontmatter */
    description?: string

    /** Table of contents extracted from headings */
    toc: TOCItem[]

    /** Rendered MDX content as React nodes */
    body: ReactNode

    /** Structured data for search */
    structuredData: StructuredData

    /** Last modified timestamp */
    lastModified?: Date

    /** Custom frontmatter fields */
    [key: string]: any
  }
}

/**
 * Navigation tree node for sidebar rendering
 */
export interface PageTreeNode {
  name: string
  url?: string
  children?: PageTreeNode[]
}

/**
 * Complete page tree for navigation
 */
export type PageTree = PageTreeNode[]

/**
 * Fumadocs source object interface (from fumadocs-core/source loader)
 * This is the primary export from packages/docs
 */
export interface FumadocsSource {
  /**
   * Retrieve a single documentation page by slug
   *
   * @param slugs - Array of path segments (e.g., ['api', 'reference'])
   * @param locale - Optional i18n locale
   * @returns Page object or undefined if not found
   *
   * @example
   * ```tsx
   * const page = source.getPage(['getting-started'])
   * if (page) {
   *   return <DocsPage toc={page.data.toc}>
   *     <DocsBody>{page.data.body}</DocsBody>
   *   </DocsPage>
   * }
   * ```
   */
  getPage(slugs?: string[], locale?: string): Page | undefined

  /**
   * Retrieve all documentation pages
   *
   * @param locale - Optional i18n locale
   * @returns Array of all pages
   */
  getPages(locale?: string): Page[]

  /**
   * Generate static params for Next.js generateStaticParams()
   * Returns array of all route parameter combinations
   *
   * @returns Array of { slug: string[] } objects
   *
   * @example
   * ```tsx
   * export function generateStaticParams() {
   *   return source.generateParams()
   * }
   * ```
   */
  generateParams(): StaticParam[]

  /**
   * Navigation tree for sidebar/menu rendering
   * Used by DocsLayout component from fumadocs-ui
   */
  pageTree: PageTree
}

// =============================================================================
// Public API Surface (What packages/docs exports)
// =============================================================================

/**
 * Complete public API exported from packages/docs/lib/index.ts
 *
 * **Key Pattern**: Export source only, NOT components.
 * Apps/web imports Fumadocs UI components directly from fumadocs-ui packages.
 *
 * @example
 * ```typescript
 * // packages/docs/lib/index.ts
 * export { source } from './source'
 *
 * // apps/web/app/docs/[[...slug]]/page.tsx
 * import { source } from 'docs'
 * import { DocsPage, DocsBody } from 'fumadocs-ui/page'
 *
 * export function generateStaticParams() {
 *   return source.generateParams()
 * }
 *
 * export default async function Page({ params }: PageProps) {
 *   const { slug } = await params  // ✅ Await in Next.js 16
 *   const page = source.getPage(slug)
 *
 *   return (
 *     <DocsPage toc={page.data.toc}>
 *       <DocsBody>{page.data.body}</DocsBody>
 *     </DocsPage>
 *   )
 * }
 * ```
 */
export interface DocsPackageExports {
  /**
   * Fumadocs source object for accessing documentation content
   * Primary export from packages/docs
   */
  source: FumadocsSource

  // Type exports (via `import type` from apps/web)
  Page: Page
  TOCItem: TOCItem
  PageTree: PageTree
  FumadocsSource: FumadocsSource
}

// =============================================================================
// Fumadocs UI Component Types (Imported directly from fumadocs-ui in apps/web)
// =============================================================================

/**
 * Props for DocsPage component from fumadocs-ui/page
 * Apps/web imports this component directly, NOT from packages/docs
 *
 * @see fumadocs-ui/page
 */
export interface DocsPageProps {
  /** Table of contents for the page */
  toc: TOCItem[]

  /** Full width layout mode */
  full?: boolean

  /** Last update timestamp */
  lastUpdate?: Date

  /** Table of contents configuration */
  tableOfContent?: {
    /** Style variant: 'clerk' or 'normal' */
    style?: 'clerk' | 'normal'
    /** Enable TOC */
    enabled?: boolean
    /** Single-column mode */
    single?: boolean
  }

  /** Footer configuration */
  footer?: {
    /** Enable next/prev navigation */
    enabled?: boolean
    /** Custom footer component */
    component?: ReactNode
  }

  /** Page content (children) */
  children: ReactNode
}

/**
 * Props for DocsLayout component from fumadocs-ui/layouts/docs
 * Apps/web imports this component directly, NOT from packages/docs
 *
 * @see fumadocs-ui/layouts/docs
 */
export interface DocsLayoutProps {
  /** Navigation tree from source.pageTree */
  tree: PageTree

  /** Sidebar configuration */
  sidebar?: {
    enabled?: boolean
    banner?: ReactNode
    prefetch?: boolean
    tabs?: any  // Complex tabs configuration
  }

  /** Navigation bar configuration */
  nav?: {
    title?: string
    transparentMode?: boolean
  }

  /** Navigation links */
  links?: Array<{
    text: string
    url: string
    icon?: ReactNode
  }>

  /** GitHub repository URL */
  githubUrl?: string

  /** Layout content (children) */
  children: ReactNode
}

/**
 * Example usage demonstrating the complete integration pattern
 *
 * @example
 * ```typescript
 * // ==================================================
 * // packages/docs/lib/source.ts
 * // ==================================================
 * import { loader } from 'fumadocs-core/source'
 * import { createMDXSource } from 'fumadocs-mdx/runtime/next'
 * import { docs } from '../source.config'
 *
 * export const source = loader({
 *   baseUrl: '/docs',
 *   source: createMDXSource(docs),
 * })
 *
 * // ==================================================
 * // packages/docs/lib/index.ts
 * // ==================================================
 * export { source } from './source'
 *
 * // ==================================================
 * // packages/docs/package.json
 * // ==================================================
 * {
 *   "exports": {
 *     ".": "./lib/index.ts"
 *   }
 * }
 *
 * // ==================================================
 * // apps/web/app/docs/[[...slug]]/page.tsx
 * // ==================================================
 * import { source } from 'docs'
 * import { DocsPage, DocsBody } from 'fumadocs-ui/page'
 * import { notFound } from 'next/navigation'
 * import type { Metadata } from 'next'
 * import type { PageProps } from 'docs'
 *
 * export function generateStaticParams() {
 *   return source.generateParams()
 * }
 *
 * export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
 *   const { slug } = await params
 *   const page = source.getPage(slug)
 *
 *   if (!page) return {}
 *
 *   return {
 *     title: page.data.title,
 *     description: page.data.description,
 *   }
 * }
 *
 * export default async function Page({ params }: PageProps) {
 *   const { slug } = await params
 *   const page = source.getPage(slug)
 *
 *   if (!page) notFound()
 *
 *   return (
 *     <DocsPage toc={page.data.toc}>
 *       <DocsBody>{page.data.body}</DocsBody>
 *     </DocsPage>
 *   )
 * }
 * ```
 */
