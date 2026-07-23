# Architecture Guide

## Overview

Kapda POS follows a modular monolith architecture with a clear separation between frontend (React SPA) and backend (Express REST API).

## System Design

```
┌─────────────┐     ┌─────────────┐     ┌────────────┐
│   Browser   │────▶│  Nginx      │────▶│  Express   │
│  (React)    │◀────│  (reverse   │◀────│  API       │
│             │     │   proxy)    │     │  Server    │
└─────────────┘     └─────────────┘     └─────┬──────┘
                                              │
                                              ▼
                                       ┌────────────┐
                                       │ PostgreSQL  │
                                       │ (Database)  │
                                       └────────────┘
```

## Backend Architecture

### Modular Structure

Each module follows a consistent pattern:

- `*.routes.ts` — Route definitions with middleware
- `*.controller.ts` — Request/response handling
- `*.service.ts` — Business logic
- `*.repository.ts` — Database queries (where applicable)
- `*.validation.ts` — Zod schemas

### Middleware Pipeline

Request → Rate Limiter → Helmet → CORS → Body Parser → Auth → RBAC → Validation → Controller → Service → Response

## Database Schema

30 models covering: Store, Users, Roles, Categories, Brands, Products, Variants, Inventory, Suppliers, Purchases, Customers, Sales, Returns, Credit Notes, Settings, Audit Logs, Notifications, Backups.

## Authentication Flow

1. User logs in → server validates credentials → returns JWT access + refresh tokens
2. Client stores tokens (localStorage) and sends access token in Authorization header
3. Access token expires after 15 minutes → client uses refresh token to get new access token
4. Refresh token expires after 7 days → user must re-authenticate

## Key Design Decisions

- **Prisma ORM** — Type-safe database access, auto-generated client
- **Zod** — Runtime schema validation on every API input
- **Repository Pattern** — Database logic isolated from business logic
- **In-memory Cart** — Cart state managed in server memory (Redis recommended for production)
- **Winston Logging** — Structured JSON logs to files, console in dev
