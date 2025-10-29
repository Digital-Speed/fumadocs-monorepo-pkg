# Fumadocs Export Pattern

This directory exports the Fumadocs source for consumption by apps/web.

**Export:** `source` object from fumadocs-core/source
**Pattern:** Apps import source, not components
**UI Components:** Apps import directly from fumadocs-ui packages

## Usage

```typescript
// In consuming app (e.g., apps/web)
import { source } from 'docs';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
```

## For Transfer to Larger Monorepo

Copy this export pattern exactly when transferring to a larger monorepo. The key principle is:
- **Data layer**: Export only the source object (content, metadata)
- **UI layer**: Let consuming apps handle UI rendering with their own fumadocs-ui installation
