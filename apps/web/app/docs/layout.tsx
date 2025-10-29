/**
 * Layout for embedded Fumadocs documentation.
 * Wraps DocsLayout with site Header and Footer for consistent branding.
 */

import { source } from "docs";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			themeSwitch={{
				enabled: false,
				mode: "light-dark",
			}}
			tree={source.pageTree}
		>
			{children}
		</DocsLayout>
	);
}
