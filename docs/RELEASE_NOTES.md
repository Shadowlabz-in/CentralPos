# Release Notes

## v1.0.0 (Initial Release)

### Features

- Complete Point of Sale system for clothing stores
- Product catalog with categories, brands, variants, and images
- Inventory management with purchase orders and stock adjustments
- Barcode generation and printing
- POS billing with cart management and split payments
- GST-compliant invoicing with HTML and PDF generation
- Dashboard with sales analytics and profit tracking
- Reports with CSV/Excel export
- Returns, exchanges, and refunds management
- Credit notes with redemption
- System settings (store, invoice, GST, barcode, printer)
- User preferences and notifications
- Audit trail for all critical actions
- Backup and restore functionality

### Security

- JWT authentication with access/refresh tokens
- Role-based access control (Admin, Manager, Cashier)
- Rate limiting on all API endpoints
- Input validation via Zod schemas
- Helmet security headers

### Infrastructure

- Docker Compose for local and production deployment
- CI/CD pipeline with GitHub Actions
- Winston logging with file rotation
- PostgreSQL 16 with Prisma ORM
