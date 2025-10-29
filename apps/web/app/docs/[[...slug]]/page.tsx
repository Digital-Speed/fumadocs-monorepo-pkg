/**
 * Fumadocs documentation embedded in apps/web.
 *
 * Import pattern for monorepo embedding:
 * 1. Import source from 'docs' workspace package (packages/docs/lib/index.ts)
 * 2. Import UI components directly from 'fumadocs-ui' (installed in apps/web)
 *
 * This pattern ensures:
 * - Documentation content (MDX, source) comes from the docs workspace
 * - UI rendering happens with fumadocs-ui installed in the consuming app
 * - Clean separation: docs exports data, apps handle presentation
 */

import { source } from "docs";
import defaultMdxComponents from "fumadocs-ui/mdx";
// UI components from fumadocs-ui (installed in apps/web)
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Source from workspace package
import Footer from "@/components/Footer";

/**
 * Next.js 16: params is now a Promise that must be awaited
 */
interface PageProps {
	params: Promise<{ slug?: string[] }>;
}

/**
 * Generate static paths for all documentation pages at build time
 */
export function generateStaticParams() {
	return source.generateParams();
}

/**
 * Generate metadata for each documentation page
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);

	if (!page) return {};

	return {
		title: page.data.title,
		description: page.data.description,
	};
}

/**
 * Render documentation page using Fumadocs UI components
 */
export default async function Page(props: PageProps) {
	const params = await props.params;

	// Get page from source (imported from 'docs' workspace)
	const page = source.getPage(params.slug);

	if (!page) {
		notFound();
	}

	// Render using fumadocs-ui components with full layout
	const MDXContent = page.data.body;

	return (
		<DocsPage footer={{ enabled: false }} toc={page.data.toc} full={false}>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
			<DocsBody>
				<MDXContent components={defaultMdxComponents} />
			</DocsBody>
		</DocsPage>
	);
}
