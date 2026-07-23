# Kapda POS

A complete Point of Sale system for clothing (Kapda) stores. Built with React, Node.js, PostgreSQL, and TypeScript.

## Features

- **Authentication & RBAC** — JWT-based auth with Admin, Manager, and Cashier roles
- **Product Catalog** — Categories, brands, products with variants (size/color), and images
- **Inventory Management** — Purchase orders, stock adjustments, low-stock alerts
- **Barcode Management** — Generate and print barcodes (CODE128)
- **POS Billing** — Cart management, split payments (Cash/Card/UPI/Store Credit), GST/Non-GST
- **GST Billing** — Invoice generation (HTML + PDF) with tax breakdown
- **Dashboard & Reports** — Sales analytics, profit tracking, export to CSV/Excel
- **Returns, Exchanges & Refunds** — Full/partial returns, exchanges with price difference, credit notes
- **System Settings** — Configurable store, invoice, GST, barcode, and printer settings
- **Audit Trail** — Track all critical actions
- **Notifications** — In-app notifications with per-user settings
- **Backup & Restore** — PostgreSQL dump management

## Tech Stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| Backend   | Node.js, Express, TypeScript                                  |
| Database  | PostgreSQL 16, Prisma ORM                                     |
| Auth      | JWT (access + refresh tokens), bcrypt                         |
| Payments  | Cash, Card, UPI, Store Credit                                 |
| Barcodes  | bwip-js                                                       |
| Invoices  | PDFKit                                                        |
| Container | Docker, Docker Compose                                        |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd kapda-pos
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Build shared package
pnpm --filter @kapda/shared build

# 4. Push database schema
pnpm --filter server prisma db push

# 5. Seed the database
pnpm --filter server prisma db seed

# 6. Start development servers
pnpm dev
```

### Default Credentials

| Role    | Email             | Password   |
| ------- | ----------------- | ---------- |
| Admin   | admin@kapda.com   | admin123   |
| Manager | manager@kapda.com | manager123 |
| Cashier | cashier@kapda.com | cashier123 |

## Project Structure

```
kapda-pos/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components, layouts, pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client and services
│   │   └── types/          # TypeScript type definitions
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── modules/        # Feature modules (auth, products, sales, etc.)
│   │   ├── routes/         # Route aggregation
│   │   ├── utils/          # Utilities (jwt, password, prisma, logger)
│   │   └── index.ts        # App entry point
│   ├── prisma/             # Schema and migrations
│   └── uploads/            # Uploaded files
├── packages/
│   └── shared/             # Shared types and utilities
├── .github/workflows/      # CI/CD pipelines
└── docker-compose.yml      # Docker configuration
```

## API Documentation

When the server is running, visit `/api-docs` for interactive Swagger documentation.

## Docker

```bash
# Development (PostgreSQL only)
docker compose -f docker-compose.dev.yml up -d

# Production (full stack)
docker compose up -d
```

## Testing

```bash
# Server tests
pnpm --filter server test

# Client tests (if configured)
pnpm --filter client test
```

## License

MIT
