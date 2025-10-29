import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

/**
 * MDX components for apps/web.
 * Provides Fumadocs UI components (Card, Cards, etc.) to MDX content
 * imported from the 'docs' workspace package.
 */
export function useMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		...components,
	};
}
