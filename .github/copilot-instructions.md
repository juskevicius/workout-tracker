# Copilot Instructions for Workout Tracker Monorepo

## Architecture Overview

This is an Nx monorepo with a React frontend + Node.js backend architecture:

- **`apps/ui`** - React 19 SPA using Vite and React Router (port 4200)
- **`apps/bff`** - Express backend serving API endpoints (port 3333)
- **`apps/ui-e2e`** - Playwright e2e tests
- **`libs/shared/models`** - Shared TypeScript data models and interfaces

The UI app declares a task dependency: `ui:serve` depends on `bff:serve`, so they run together.

## Critical Workflows

### Development
- **Start both UI + BFF**: `npm run ui:serve` (automatically starts bff)
- **Start just BFF**: `npm run bff:serve` (port 3333, CORS enabled)
- **Run tests**: `nx test` (Vitest configured via `vitest.workspace.ts`)
- **Run e2e**: `nx e2e ui-e2e` (Playwright)
- **Lint**: `nx lint` (ESLint configured project-wide)

**Key point**: Always use `nx` commands instead of direct tool invocation (e.g., `nx test` not `vitest`).

### Build & Production
- **Build single app**: `nx build ui` or `nx build bff`
- **Build all**: `nx run-many -t build`
- BFF builds with esbuild to CommonJS (sourcemaps enabled, see `apps/bff/package.json`)

## Conventions & Patterns

### TypeScript & Imports
- Strict mode enabled (`tsconfig.base.json`)
- Path aliases: `@workout-tracker/*` maps to `libs/shared/*`
- No unused imports/variables allowed (`noUnusedLocals: true`)
- Must use `bundler` module resolution for monorepo

### React/UI
- Uses React Router 6 with BrowserRouter (see `apps/ui/src/main.tsx`)
- Component CSS modules pattern: `component.module.css` (e.g., `loading-spinner.module.css`)
- Test setup: `test-setup.ts` in UI root for Testing Library config
- Vite serves on localhost:4200

### Backend (BFF)
- Express server with CORS middleware enabled for all origins
- JSON request/response body handling
- Custom condition: `@workout-tracker/source` in tsconfig (production build exclusion)

### Testing
- Vitest + Testing Library for unit/component tests (React)
- Playwright for e2e (already has basic navigation test)
- Test files use `.spec.ts(x)` suffix
- Coverage: `@vitest/coverage-v8` available

### Task Caching
- `nx.json` defines `production` namedInput (excludes test/spec files)
- Outputs are cached; use `nx run <target>` to leverage distributed caching

## Data Flow & Integration

1. **UI → BFF**: React app makes HTTP requests to Express backend (localhost:3333)
2. **Shared Models**: Both UI and BFF import types from `libs/shared/models`
3. **CORS**: BFF permits all origins via middleware—safe for local dev

**Example shared model** (`libs/shared/models/src/lib/data.model.ts`):
```typescript
export interface Data {
  id: string;
}
```

Both apps reference via `import { Data } from '@workout-tracker/models'`.

## Files to Know

- `nx.json` - Workspace config (plugins, task definitions, caching rules)
- `tsconfig.base.json` - TypeScript paths and strict compiler options
- `apps/ui/package.json` - Declares ui:serve depends on bff:serve
- `apps/bff/src/main.ts` - Express entry point with CORS setup
- `apps/ui/src/routes/App.tsx` - React router configuration
- `vitest.workspace.ts` - Vitest discovery pattern (vite.config.ts files)

## Common Gotchas

1. **UI without BFF fails**: The UI's serve target depends on BFF running—don't skip the BFF
2. **TypeScript strict mode**: All files must pass strict checks; no implicit `any`
3. **Nx plugin exclusions**: `libs/shared/models` is excluded from `@nx/js/typescript` plugin—it handles targets manually
4. **Test file exclusion**: Tests/specs excluded from production builds via `namedInputs.production`

## When to Use Nx Tools

- Use `nx_workspace` tool to understand project dependencies and architecture
- Use `nx_project_details` to drill into individual app/lib configuration
- Use `nx_docs` for Nx-specific configuration questions (versions, plugins, etc.)
- Always prefer `nx run`, `nx run-many`, or `nx affected` for executing tasks
