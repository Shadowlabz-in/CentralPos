# Deployment Guide

## Prerequisites

- Docker & Docker Compose (recommended)
- OR Node.js 20+, pnpm, PostgreSQL 16
- Domain name (for production)
- SSL certificate (for production)

## Environment Variables

### Server (.env)

Create a `.env` file in the project root:

```env
# Server
SERVER_PORT=4000
SERVER_NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://central_one:YOUR_STRONG_PASSWORD@localhost:5432/central_one

# JWT
JWT_ACCESS_SECRET=generate-a-strong-random-secret
JWT_REFRESH_SECRET=generate-another-strong-random-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Upload
UPLOAD_DIR=./uploads
UPLOAD_MAX_FILE_SIZE=5242880
```

### Client (no .env needed)

The client uses Vite proxy in development. In production, the API URL is determined by the nginx proxy configuration.

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# 1. Set environment variables
export POSTGRES_PASSWORD=your_strong_password
export JWT_ACCESS_SECRET=your_access_secret
export JWT_REFRESH_SECRET=your_refresh_secret
export CORS_ORIGIN=https://yourdomain.com

# 2. Build and start
docker compose up -d --build

# 3. Run database migration
docker compose exec server sh -c "npx prisma db push"

# 4. Seed database (first time only)
docker compose exec server sh -c "npx prisma db seed"

# 5. Verify
curl http://localhost:4000/api/health
```

### Option 2: Manual Deployment

#### Build

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build shared package
pnpm --filter @central-one/shared build

# Generate Prisma client
pnpm --filter server prisma generate

# Build server
pnpm --filter server build

# Build client
pnpm --filter client build
```

#### Run

```bash
# Start server
cd server
NODE_ENV=production node dist/index.js

# Serve client files via nginx (see nginx config below)
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /path/to/client/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://localhost:4000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Database Migration

```bash
# Push schema (development)
npx prisma db push

# Create migration (for version control)
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## Backup Strategy

### Automatic Backups

Backups are managed through the application's backup module:

- Admin users can create backups via the settings UI
- Backups are stored in `server/uploads/backups/`
- Each backup is a complete PostgreSQL dump

### Manual Backup

```bash
# Create backup
pg_dump "postgresql://central_one:password@localhost:5432/central_one" > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql "postgresql://central_one:password@localhost:5432/central_one" < backup_file.sql
```

### Cron Job (Recommended)

```bash
# Daily backup at 2 AM
0 2 * * * pg_dump "postgresql://central_one:password@localhost:5432/central_one" > /backups/central_one_$(date +\%Y\%m\%d).sql
# Keep only last 30 days
0 3 * * * find /backups -name "central_one_*.sql" -mtime +30 -delete
```

## Rollback Strategy

### Code Rollback

```bash
# Docker
git checkout <previous-tag>
docker compose up -d --build

# Manual
git checkout <previous-tag>
pnpm install
pnpm build
```

### Database Rollback

```bash
# If using migrations
npx prisma migrate reset

# If using db push
# Restore from backup
psql "postgresql://central_one:password@localhost:5432/central_one" < backup_file.sql
```

## Monitoring

### Health Checks

- `GET /api/health` — Basic health check (returns 200 OK)
- The server listens on the configured port

### Logs

```bash
# Docker logs
docker compose logs -f server
docker compose logs -f client

# Application logs (manual deploy)
tail -f server/logs/combined.log
tail -f server/logs/error.log
```

### Monitoring Recommendations

- **Uptime Monitoring**: UptimeRobot, Pingdom, or Healthchecks.io
- **Application Monitoring**: Sentry for error tracking
- **Server Monitoring**: Prometheus + Grafana or Netdata
- **Log Management**: Papertrail, Logtail, or ELK stack
- **Database Monitoring**: pgAdmin or DataGrip

## Security Checklist

- [ ] Strong JWT secrets (generate with `openssl rand -hex 64`)
- [ ] Strong database password (generate with `openssl rand -hex 32`)
- [ ] HTTPS enabled
- [ ] CORS origin limited to your domain
- [ ] Rate limiting enabled (default)
- [ ] Helmet security headers enabled
- [ ] File upload validation active
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker compose ps postgres
# Check logs
docker compose logs postgres
# Verify connection string
docker compose exec server env | grep DATABASE_URL
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
docker compose exec server npx prisma generate
```

### Permission Issues

```bash
# Check upload directory permissions
docker compose exec server ls -la /app/server/uploads
# Fix if needed
docker compose exec server chmod 755 /app/server/uploads
```

### Application Errors

```bash
# Check server logs
docker compose logs --tail=100 server
# Check error log inside container
docker compose exec server cat /app/server/logs/error.log
```
