# Developer Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16
- Docker (optional)

## Setup

See README.md for quick start.

## Development Workflow

1. Start PostgreSQL: `docker compose -f docker-compose.dev.yml up -d`
2. Start dev servers: `pnpm dev` (starts both server and client with hot reload)
3. Server runs on http://localhost:4000
4. Client runs on http://localhost:5173

## Code Conventions

- **TypeScript** — Strict mode enabled, avoid `any` types
- **Naming** — camelCase for variables/functions, PascalCase for classes/types, kebab-case for files
- **Modules** — Each feature is a self-contained module under `server/src/modules/`
- **Error Handling** — Use `AppError` class with try/catch + `next(error)` pattern in controllers
- **Validation** — All input validated via Zod schemas in `*.validation.ts`
- **Database** — Prisma for all queries, migrations via `prisma db push`
- **API Responses** — Always return `{ status: 'success', data: ..., meta?: ... }`

## Adding a New Module

1. Create `server/src/modules/<name>/` directory
2. Create route, controller, service, and validation files
3. Register routes in `server/src/routes/index.ts`
4. Update Prisma schema if needed
5. Add OpenAPI annotations to route file

## Testing

Run tests with `pnpm --filter server test`. Write new tests in `server/src/tests/`.

## Building for Production

```bash
pnpm build
```

This builds shared package, server, and client.
