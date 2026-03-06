FROM node:20-alpine AS base
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspace=@fin-health/backend --workspace=@fin-health/shared --include-workspace-root

# --- Build ---
FROM deps AS build
COPY packages/shared/ packages/shared/
COPY backend/ backend/
RUN npm run build -w @fin-health/shared && \
    npm run build -w @fin-health/backend
RUN cd backend && npx prisma generate

# --- Production ---
FROM base AS production
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

USER app
EXPOSE 3001
CMD ["node", "backend/dist/index.js"]
