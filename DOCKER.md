# Docker Deployment Guide

This guide explains how to run the Fin Health application using Docker containers.

## Overview

The application consists of three main services:
- **API**: tRPC server (Node.js)
- **Web**: Remix web application
- **Database**: PostgreSQL (optional, use if not using Supabase)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Supabase account (or local PostgreSQL)

## Quick Start

### 1. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.docker.example .env
```

Edit `.env` and configure:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET` (generate a strong random string)
- `DATABASE_URL` (if using Supabase, update with your connection string)

### 2. Build and Start Services

```bash
# Build images and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will:
- Build the API and Web Docker images
- Start PostgreSQL (optional local database)
- Start the API server on port 3001
- Start the Web app on port 3000

### 3. Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Docker Services

### API Service

Built from `apps/api/Dockerfile`:
- Multi-stage build (builder + runner)
- Installs and builds domain, db, and api packages
- Runs production build with minimal dependencies
- Exposes port 3001
- Includes health check endpoint

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`
- `PORT=3001`

### Web Service

Built from `apps/web/Dockerfile`:
- Multi-stage build (builder + runner)
- Installs and builds domain, api, and web packages
- Serves Remix app with production build
- Exposes port 3000
- Server-side rendering with cookie-based sessions

**Environment Variables**:
- `API_URL`: API endpoint (use `http://api:3001` for Docker network)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `SESSION_SECRET`: Secret for cookie encryption
- `NODE_ENV=production`

### PostgreSQL Service (Optional)

Only needed if not using Supabase:
- PostgreSQL 15 Alpine
- Exposes port 5432
- Data persisted in Docker volume `postgres_data`
- Default credentials: `finhealth` / `finhealth_dev_password`

**For production, use Supabase** instead of this service.

## Database Setup

### Option 1: Using Supabase (Recommended)

1. Create a Supabase project at https://supabase.com
2. Get your credentials from Project Settings > API
3. Get your database connection string from Project Settings > Database
4. Update `.env` with your Supabase credentials
5. Run migrations:
   ```bash
   # Connect to API container
   docker-compose exec api sh

   # Run migrations
   cd packages/db
   pnpm db:migrate
   exit
   ```

### Option 2: Using Local PostgreSQL

1. Keep the `postgres` service in `docker-compose.yml`
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://finhealth:finhealth_dev_password@postgres:5432/finhealth
   ```
3. Run migrations:
   ```bash
   docker-compose exec api sh
   cd packages/db
   pnpm db:migrate
   exit
   ```

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart web
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up --build -d

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Containers

```bash
# Access API container shell
docker-compose exec api sh

# Access Web container shell
docker-compose exec web sh

# Run pnpm command in API container
docker-compose exec api pnpm --filter @fin-health/api build
```

## Development vs Production

### Development Setup

For development, it's recommended to run services locally (not in Docker):

```bash
# Terminal 1: Start API
pnpm dev:api

# Terminal 2: Start Web
pnpm --filter @fin-health/web dev
```

This provides:
- Faster rebuild times
- Better debugging experience
- Hot module replacement
- Direct access to source code

### Production Setup

Docker is ideal for production deployment:
- Consistent environment
- Easy scaling
- Container orchestration (Kubernetes, ECS, etc.)
- Isolated services

## Docker Image Optimization

Both Dockerfiles use multi-stage builds for optimization:

1. **Builder Stage**:
   - Full Node.js with build tools
   - Installs all dependencies (including devDependencies)
   - Builds TypeScript to JavaScript
   - Generates type declarations

2. **Runner Stage**:
   - Minimal Node.js Alpine image
   - Production dependencies only
   - Compiled JavaScript files
   - No source code or build tools

**Image Sizes** (approximate):
- API: ~250MB (compressed)
- Web: ~280MB (compressed)

## Networking

Services communicate via Docker's internal network:
- Web → API: `http://api:3001`
- API → PostgreSQL: `postgres:5432`

External access:
- Web: `http://localhost:3000` (host → container)
- API: `http://localhost:3001` (host → container)

## Health Checks

All services include health checks:

**API**:
```bash
curl http://localhost:3001/health
```

**Web**:
```bash
curl http://localhost:3000/
```

**PostgreSQL**:
```bash
docker-compose exec postgres pg_isready -U finhealth
```

## Troubleshooting

### API Container Fails to Start

Check logs:
```bash
docker-compose logs api
```

Common issues:
- Database connection failed: Verify `DATABASE_URL` is correct
- Supabase auth failed: Check Supabase credentials
- Port already in use: Stop other services on port 3001

### Web Container Fails to Start

Check logs:
```bash
docker-compose logs web
```

Common issues:
- Cannot connect to API: Ensure API service is healthy
- Invalid session secret: Set `SESSION_SECRET` in `.env`
- Build errors: Check that API built successfully first

### Database Connection Issues

1. Verify database is running:
   ```bash
   docker-compose ps postgres
   ```

2. Test connection:
   ```bash
   docker-compose exec postgres psql -U finhealth -d finhealth -c "SELECT 1;"
   ```

3. Check API can connect:
   ```bash
   docker-compose exec api sh -c "node -e \"console.log(process.env.DATABASE_URL)\""
   ```

### Container Keeps Restarting

Check health check status:
```bash
docker-compose ps
```

Inspect specific container:
```bash
docker inspect fin-health-api
docker inspect fin-health-web
```

## Deployment to Cloud Providers

### AWS ECS/Fargate

1. Push images to Amazon ECR:
   ```bash
   docker tag fin-health-api:latest <account>.dkr.ecr.<region>.amazonaws.com/fin-health-api:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/fin-health-api:latest
   ```

2. Create ECS task definitions using the images
3. Set environment variables in task definition
4. Create ECS service with desired count

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/<project>/fin-health-api apps/api
gcloud builds submit --tag gcr.io/<project>/fin-health-web apps/web

# Deploy
gcloud run deploy fin-health-api --image gcr.io/<project>/fin-health-api --platform managed
gcloud run deploy fin-health-web --image gcr.io/<project>/fin-health-web --platform managed
```

### DigitalOcean App Platform

1. Connect repository to App Platform
2. Configure build settings:
   - Dockerfile path: `apps/api/Dockerfile`
   - Context directory: `.` (root)
3. Set environment variables in dashboard
4. Deploy

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set:
   - Docker build context: `.`
   - Dockerfile path: `apps/api/Dockerfile`
4. Add environment variables
5. Deploy

## Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong random strings for `SESSION_SECRET` (min 32 characters)
- Rotate secrets regularly in production
- Use Docker secrets or environment managers (AWS Secrets Manager, etc.)

### Container Security

- Images are based on Alpine Linux (minimal attack surface)
- No unnecessary tools in production images
- Non-root user for running services (can be added)
- Regular security updates via base image updates

### Network Security

- Use reverse proxy (Nginx, Traefik) in production
- Enable HTTPS/TLS
- Configure CORS appropriately in API
- Use firewall rules to limit container access

## Monitoring

### Container Metrics

```bash
# Resource usage
docker stats

# Specific container
docker stats fin-health-api
```

### Logs

```bash
# Stream logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > logs.txt
```

### Health Monitoring

Set up monitoring tools:
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Uptime monitoring (UptimeRobot, Pingdom)

## Scaling

### Horizontal Scaling

Scale specific services:
```bash
docker-compose up -d --scale api=3 --scale web=2
```

Note: Requires load balancer configuration.

### With Docker Swarm

```bash
docker stack deploy -c docker-compose.yml fin-health
docker service scale fin-health_api=3
```

### With Kubernetes

Convert docker-compose.yml to Kubernetes manifests:
```bash
kompose convert -f docker-compose.yml
kubectl apply -f .
```

## Backup and Restore

### PostgreSQL Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U finhealth finhealth > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U finhealth finhealth
```

### Volume Backup

```bash
# Stop containers
docker-compose stop

# Backup volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

## Further Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Supabase Documentation](https://supabase.com/docs)
- [Remix Deployment Guide](https://remix.run/docs/en/main/guides/deployment)

## Support

For issues specific to this application, check:
- API README: `apps/api/README.md`
- Web README: `apps/web/README.md`
- GitHub Issues: (your repository)
