# Feature Specification: Embed Documentation as Component

**Feature Branch**: `001-embed-docs-component`
**Created**: 2025-10-29
**Status**: Draft
**Input**: User description: "Refactor monorepo to export packages/docs Next.js app as embeddable component into apps/web. The goal is to embed the Fumadocs package (packages/docs) as the body content within the apps/web layout (header and footer)."

## Clarifications

### Session 2025-10-29

- Q: Given that this solution will be copied to a larger monorepo, how comprehensive should the migration/transfer documentation be? → A: Minimal - Code comments and basic README only
- Q: For easy transfer to the larger monorepo, should the embedding logic be isolated into reusable utilities/helpers, or kept inline in the route files? → A: Fully inline - Standard monorepo pattern: build packages/docs, export via package.json, import single component in apps/web
- Q: For maximum simplicity and easy transfer, should the exported documentation component accept configuration props (theme, basePath, etc.), or be completely self-contained with all configuration internal to packages/docs? → A: Self-contained - All configuration lives inside packages/docs, component has no props or only minimal params prop for routing
- Q: If packages/docs fails to build or has runtime errors, how should apps/web handle it to keep the solution simple for transfer? → A: Fail-fast - Build failures propagate to apps/web build (standard dependency chain), no special error handling
- Q: For easy transfer to other monorepos (which may have different Next.js versions or package managers), should the solution enforce strict version alignment or support flexible versioning? → A: Strict alignment using Bun's catalog feature - Pin versions in root package.json workspaces catalog, reference via "react": "catalog:" in workspace package.json files

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Documentation with Unified Layout (Priority: P1)

As an end user visiting the web application, I want to access documentation that appears seamlessly integrated with the main application's header and footer, so that I have a consistent navigation and branding experience throughout the site.

**Why this priority**: This is the core MVP - users must be able to view documentation within the unified layout. Without this, the feature provides no value.

**Independent Test**: Navigate to the documentation section of the web app and verify that the Fumadocs content displays within the web app's header and footer layout. The documentation should be fully functional (navigation, search, content rendering) while appearing as part of the main application.

**Acceptance Scenarios**:

1. **Given** a user navigates to the documentation route in apps/web, **When** the page loads, **Then** the Fumadocs content renders within the web app's layout (header above, footer below, docs content in body)
2. **Given** the documentation is displayed, **When** the user interacts with Fumadocs navigation (sidebar, search), **Then** navigation works correctly without breaking the parent layout
3. **Given** the user is viewing documentation, **When** they click the header navigation links, **Then** they can navigate to other parts of the web app without issues

---

### User Story 2 - Hot Reload During Development (Priority: P2)

As a developer working on either the documentation or the web application, I want changes to automatically reflect in my browser during development, so that I can iterate quickly without manual rebuilds.

**Why this priority**: Developer experience is critical for maintaining the monorepo. Without hot reload, development velocity drops significantly.

**Independent Test**: Run `bun dev` at the monorepo root, make a change to packages/docs content or apps/web layout, and verify the browser automatically updates without manual intervention.

**Acceptance Scenarios**:

1. **Given** the development server is running, **When** a developer modifies content in packages/docs, **Then** the changes appear in the browser automatically
2. **Given** the development server is running, **When** a developer modifies the apps/web layout (header/footer), **Then** the documentation view updates to reflect the new layout
3. **Given** both packages are being developed simultaneously, **When** changes are made to either, **Then** hot reload works for both without conflicts

---

### User Story 3 - Build and Deploy Unified Application (Priority: P3)

As a DevOps engineer, I want to build and deploy a single production artifact that includes both the web application and embedded documentation, so that deployment is simplified and both components share the same hosting infrastructure.

**Why this priority**: Production deployment is essential but can be validated after development experience is proven. The MVP can work in dev mode first.

**Independent Test**: Run `bun build` at the monorepo root, verify that apps/web produces a production build that includes the embedded documentation, and test that the production build serves correctly.

**Acceptance Scenarios**:

1. **Given** the monorepo is ready for production, **When** `bun build` is executed, **Then** apps/web builds successfully with embedded documentation included
2. **Given** a production build is created, **When** the application is deployed and accessed, **Then** documentation functions identically to the development environment
3. **Given** a production deployment, **When** users navigate between documentation and other app sections, **Then** routing works correctly and maintains the unified layout

---

### Edge Cases

- **Build failures**: packages/docs build failures propagate to apps/web build (fail-fast, standard dependency chain)
- **Routing conflicts**: Documentation routes namespaced under `/docs/*` to prevent conflicts with apps/web routes
- **Style conflicts**: packages/docs styles are self-contained; any conflicts handled via CSS specificity or scoping
- **Deep linking**: Direct navigation to `/docs/path/to/page` supported via Next.js routing
- **Independent updates**: packages/docs updates require rebuilding apps/web (standard Turborepo dependency chain via `^build`)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The monorepo MUST allow packages/docs to be imported as a single React component via standard package.json exports (standard monorepo component library pattern)
- **FR-002**: Apps/web MUST render the documentation content within its own layout structure (header and footer wrapping the docs body) by importing and rendering the exported component inline
- **FR-003**: Documentation navigation (sidebar, search, page routing) MUST function correctly when embedded in apps/web
- **FR-004**: The development workflow MUST support running both apps/web and packages/docs simultaneously with hot reload
- **FR-005**: The Turborepo build pipeline MUST correctly sequence the build of packages/docs before apps/web when dependencies change
- **FR-006**: Routing MUST correctly handle navigation between documentation pages and other web app pages
- **FR-007**: The solution MUST preserve Fumadocs functionality (MDX rendering, search, navigation, themes) when embedded
- **FR-008**: Build outputs MUST be optimized to avoid duplication of shared dependencies between packages/docs and apps/web
- **FR-009**: The refactored structure MUST pass all existing verification gates: type checking, linting, and builds with zero warnings
- **FR-010**: The exported documentation component MUST be self-contained with all configuration (theme, search, navigation) internal to packages/docs, accepting only minimal routing parameters

### Key Entities

- **Documentation Package (packages/docs)**: A Next.js application using Fumadocs that contains MDX documentation content, search functionality, navigation sidebar, and theme configuration. Currently exists as a standalone app, needs to be exportable as a component.

- **Web Application (apps/web)**: The main Next.js application that provides the site-wide layout (header, footer, navigation). Will import and embed the documentation package as part of its page structure.

- **Shared Layout**: The visual and structural wrapper provided by apps/web that contains branding, navigation header, and footer. The documentation content from packages/docs will render within this layout's body area.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can navigate to the documentation section of apps/web and view Fumadocs content within the unified layout without visual or functional issues
- **SC-002**: Development hot reload completes in under 3 seconds for changes to either packages/docs or apps/web
- **SC-003**: Production builds of apps/web successfully include embedded documentation and pass all verification gates (type checking, linting, build) with zero warnings
- **SC-004**: Documentation search and navigation features work identically when embedded compared to the standalone packages/docs app
- **SC-005**: The refactored structure maintains or improves build times compared to the current separate app setup
- **SC-006**: All existing documentation content remains accessible and functional after the refactoring without content migration

## Assumptions

- Fumadocs supports being embedded or can be configured for embedding (standard React/Next.js component patterns)
- Both apps/web and packages/docs use strict version alignment enforced via Bun's catalog feature (Next.js 16.0, React 19)
- The monorepo's Turborepo configuration can be extended to support the new dependency relationship
- URL routing can be configured so documentation routes are namespaced (e.g., `/docs/*`) without conflicting with apps/web routes
- The packages/docs app does not have critical dependencies on running as a standalone server (all functionality can work when embedded)

## Dependencies

- Turborepo build pipeline configuration (turbo.json)
- Next.js App Router configuration in both apps/web and packages/docs
- Fumadocs component architecture and configuration
- Shared TypeScript and ESLint configurations from @repo/typescript-config and @repo/eslint-config
- Bun workspaces catalog for version pinning (root package.json defines catalog, workspaces reference via "dependency": "catalog:" syntax)

## Constraints

- Must maintain existing Fumadocs functionality (search, navigation, MDX rendering, theme)
- Must not require rewriting documentation content
- Must pass zero-warning policy for type checking and linting
- Must work with existing Bun package manager and Turborepo setup
- Changes must be incremental and preserve existing functionality during refactoring
- Documentation must be minimal: code comments and basic README only (solution will be transferred to larger monorepo)
- Must use Bun's catalog feature for strict version alignment (Next.js 16.0, React 19) across all workspaces
