# Copilot Instructions for Workout Tracker Monorepo

## Architecture Overview

This is an Nx monorepo with a React frontend + Node.js backend architecture:

- **`apps/ui`** - React 19 SPA using Vite and React Router (port 4200)
- **`apps/bff`** - Express backend serving API endpoints (port 3333)

The UI app declares a task dependency: `ui:serve` depends on `bff:serve`, so they run together.

## Critical Workflows

### Development
- **Start both UI + BFF**: `npm run ui:serve` (automatically starts bff)
- **Start just BFF**: `npm run bff:serve` (port 3333, CORS enabled)

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

#### Structure
- `assets/` – Static Files & Media
- `components/` – Shared UI Components
- `pages/` – Route-Level Components
- `routes/` – Routing Configuration
- `hooks/` – Custom Hooks
- `services/` – External API Logic
- `utils/` – Utility Functions
- `styles/` - Global Styling & Theme Config

### Backend (BFF)
- Express server with CORS middleware enabled for all origins
- JSON request/response body handling

### Task Caching
- `nx.json` defines `production` namedInput (excludes test/spec files)
- Outputs are cached; use `nx run <target>` to leverage distributed caching

## Files to Know

- `nx.json` - Workspace config (plugins, task definitions, caching rules)
- `tsconfig.base.json` - TypeScript paths and strict compiler options
- `apps/ui/package.json` - Declares ui:serve depends on bff:serve
- `apps/bff/src/main.ts` - Express entry point with CORS setup
- `apps/ui/src/routes/App.tsx` - React router configuration

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
