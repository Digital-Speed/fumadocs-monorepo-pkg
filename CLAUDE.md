# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo containing Next.js applications and shared packages. The repository uses Bun as the package manager and Turbo for build orchestration and caching.

**Key Technologies:**
- Turborepo for monorepo management and task orchestration
- Next.js 15 with App Router and Turbopack for applications
- React 19 and TypeScript throughout
- Bun as package manager (v1.3.0)
- Shared packages for UI components, ESLint configs, and TypeScript configs

## Commands

### Development
```bash
# Run all apps in dev mode
bun dev

# Run specific app with filter
bun dev --filter=web        # web app on port 3000
bun dev --filter=docs       # docs app on port 3001
```

### Building
```bash
# Build all apps and packages
bun build

# Build specific workspace with filter
bun build --filter=web
bun build --filter=docs
```

### Code Quality
```bash
# Lint all workspaces
bun lint

# Type checking across all workspaces
bun run check-types

# Format code with Prettier
bun run format
```

### Package Management
```bash
# Install dependencies (uses Bun)
bun install

# Add dependency to specific workspace
bun add <package> --filter=web
```

### Component Generation
```bash
# Generate new React component in @repo/ui package
cd packages/ui
bun run generate:component
```

## Architecture

### Monorepo Structure

**Apps** (`apps/`):
- `web`: Next.js application running on port 3000
- `docs`: Next.js documentation site running on port 3001

**Packages** (`packages/`):
- `@repo/ui`: Shared React component library with button, card, and code components
- `@repo/eslint-config`: ESLint configurations with presets for base, Next.js, and React internal packages
- `@repo/typescript-config`: Shared TypeScript configurations (base, Next.js, react-library)
- `docsy`: Third-party Redoc package (OpenAPI documentation tool)

### Workspace Dependencies

Both Next.js apps (`web` and `docs`) depend on:
- `@repo/ui` - shared components
- `@repo/eslint-config` - linting rules
- `@repo/typescript-config` - TypeScript settings

This dependency structure is defined in the root `package.json` workspaces field and managed by Turbo's build pipeline.

### Turbo Pipeline Configuration

The `turbo.json` defines task dependencies and caching:

- **build**: Depends on upstream package builds (`^build`), caches Next.js output (`.next/**`), includes `.env*` files in inputs
- **lint**: Depends on upstream package lints (`^lint`)
- **check-types**: Depends on upstream type checks (`^check-types`)
- **dev**: Not cached, runs persistently

The `^` prefix means the task waits for the same task in dependency packages to complete first.

### Next.js Apps Configuration

Both apps use:
- App Router (files in `app/` directory)
- Turbopack for fast dev mode (`--turbopack` flag)
- TypeScript with strict type checking
- ESLint with `--max-warnings 0` (zero tolerance for warnings)
- Separate dev ports (3000 for web, 3001 for docs)

### Shared UI Package

`@repo/ui` exports components via path-based exports:
```typescript
// package.json exports
"./*": "./src/*.tsx"
```

This means components are imported like:
```typescript
import { Button } from "@repo/ui/button"
import { Card } from "@repo/ui/card"
```

The package includes a Turbo generator (`turbo gen react-component`) for scaffolding new components.

### ESLint Configuration

The `@repo/eslint-config` package provides three configurations:
- `base.js`: Core ESLint rules for TypeScript
- `next.js`: Next.js-specific rules extending base config
- `react-internal.js`: Rules for internal React libraries/packages

### TypeScript Configuration

The `@repo/typescript-config` package provides base configurations that workspaces extend:
- `base.json`: Strict mode, ES2022 target, NodeNext module resolution
- `nextjs.json`: Configuration optimized for Next.js apps
- `react-library.json`: Configuration for React component libraries

## Development Workflow

When making changes:

1. **Local packages are rebuilt automatically**: Turbo watches for changes in dependency packages and rebuilds them when needed
2. **Type checking**: Run `bun run check-types` before committing to catch type errors across all workspaces
3. **Linting**: Ensure `bun lint` passes with zero warnings (enforced by `--max-warnings 0`)
4. **Testing changes**: Use `--filter` flag to work on specific packages without running all tasks

## Important Notes

- **Package Manager**: This repo uses Bun, not npm/yarn/pnpm. Always use `bun` commands
- **Node Version**: Requires Node.js >= 18
- **Port Conflicts**: Web runs on 3000, docs on 3001. Ensure these ports are available
- **Turbo Caching**: Turbo caches build outputs. Use `turbo build --force` to bypass cache if needed
- **ESLint Strictness**: Zero warnings policy is enforced. Fix all warnings, don't ignore them
- **Workspace Protocol**: Internal dependencies use `"*"` version (workspace protocol) to always reference local packages

## Active Technologies
- TypeScript 5.9.2-5.9.3 with Next.js 15.5 (apps/web) and Next.js 16.0 (packages/docs), React 19.1-19.2 + Next.js App Router, React 19, Turborepo 2.5.8, Bun 1.3.0, Fumadocs (fumadocs-core 16.0.5, fumadocs-ui 16.0.5, fumadocs-mdx 13.0.2) (001-embed-docs-component)
- N/A (documentation content in MDX files, no database) (001-embed-docs-component)

## Recent Changes
- 001-embed-docs-component: Added TypeScript 5.9.2-5.9.3 with Next.js 15.5 (apps/web) and Next.js 16.0 (packages/docs), React 19.1-19.2 + Next.js App Router, React 19, Turborepo 2.5.8, Bun 1.3.0, Fumadocs (fumadocs-core 16.0.5, fumadocs-ui 16.0.5, fumadocs-mdx 13.0.2)
