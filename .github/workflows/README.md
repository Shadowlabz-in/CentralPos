# CI/CD Pipeline

## CI (`ci.yml`)

Triggers on pushes to `main`/`develop` and pull requests targeting `main`.

| Job                  | Description                                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lint & TypeCheck** | Installs dependencies, builds shared package, generates Prisma client, runs linter, and type-checks both server and client. A PostgreSQL 16 service is provided for Prisma generation. |
| **Tests**            | After linting passes, pushes the Prisma schema to a test database and runs server tests.                                                                                               |
| **Docker Build**     | On push to `main`, builds Docker images for both server and client targets using BuildKit caching.                                                                                     |

## Deploy (`deploy.yml`)

Triggers on version tags (`v*`). Builds the project and deploys via SSH using `docker compose` on the production server.

**Required secrets:**

| Secret           | Purpose                               |
| ---------------- | ------------------------------------- |
| `DATABASE_URL`   | Production database connection string |
| `VITE_API_URL`   | Client-side API base URL              |
| `DEPLOY_HOST`    | Production server hostname            |
| `DEPLOY_USER`    | SSH user                              |
| `DEPLOY_SSH_KEY` | SSH private key                       |
