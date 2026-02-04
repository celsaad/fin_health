# Web Dockerfile - Multi-stage build for Remix production

# Stage 1: Build dependencies and app
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files first (for better caching)
COPY packages/domain/package.json ./packages/domain/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/domain ./packages/domain
COPY packages/tsconfig ./packages/tsconfig
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Build packages (domain must be built first, then API for types)
RUN pnpm --filter @fin-health/domain build
RUN pnpm --filter @fin-health/api build
RUN pnpm --filter @fin-health/web build

# Stage 2: Production runtime
FROM node:18-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY packages/domain/package.json ./packages/domain/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/packages/domain/dist ./packages/domain/dist
COPY --from=builder /app/packages/domain/package.json ./packages/domain/
COPY --from=builder /app/packages/tsconfig ./packages/tsconfig
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/web/build ./apps/web/build
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the web server
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
