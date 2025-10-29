import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Turbopack is now the default bundler in Next.js 16
	// No webpack configuration needed

	// Transpile packages/docs for hot reload in monorepo
	transpilePackages: ['docs'],
};

export default withMDX(nextConfig);
