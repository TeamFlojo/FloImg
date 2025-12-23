# FloImg Studio Dockerfile
# Build from monorepo root: docker build -f apps/studio/Dockerfile -t floimg-studio .
#
# Pre-built images available at: ghcr.io/teamflojo/floimg-studio

# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files for dependency resolution
COPY packages/floimg/package.json ./packages/floimg/
COPY packages/floimg-mermaid/package.json ./packages/floimg-mermaid/
COPY packages/floimg-qr/package.json ./packages/floimg-qr/
COPY packages/floimg-quickchart/package.json ./packages/floimg-quickchart/
COPY apps/studio/shared/package.json ./apps/studio/shared/
COPY apps/studio/backend/package.json ./apps/studio/backend/
COPY apps/studio/frontend/package.json ./apps/studio/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY packages/floimg ./packages/floimg
COPY packages/floimg-mermaid ./packages/floimg-mermaid
COPY packages/floimg-qr ./packages/floimg-qr
COPY packages/floimg-quickchart ./packages/floimg-quickchart
COPY apps/studio ./apps/studio

# Build packages in dependency order
RUN pnpm --filter @teamflojo/floimg build
RUN pnpm --filter @teamflojo/floimg-mermaid build
RUN pnpm --filter @teamflojo/floimg-qr build
RUN pnpm --filter @teamflojo/floimg-quickchart build
RUN pnpm --filter @teamflojo/floimg-studio-shared build
RUN pnpm --filter @teamflojo/floimg-studio-backend build
RUN pnpm --filter @teamflojo/floimg-studio-ui build

# Stage 2: Production
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package.json files for prod install
COPY packages/floimg/package.json ./packages/floimg/
COPY packages/floimg-mermaid/package.json ./packages/floimg-mermaid/
COPY packages/floimg-qr/package.json ./packages/floimg-qr/
COPY packages/floimg-quickchart/package.json ./packages/floimg-quickchart/
COPY apps/studio/shared/package.json ./apps/studio/shared/
COPY apps/studio/backend/package.json ./apps/studio/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built packages
COPY --from=builder /app/packages/floimg/dist ./packages/floimg/dist
COPY --from=builder /app/packages/floimg-mermaid/dist ./packages/floimg-mermaid/dist
COPY --from=builder /app/packages/floimg-qr/dist ./packages/floimg-qr/dist
COPY --from=builder /app/packages/floimg-quickchart/dist ./packages/floimg-quickchart/dist
COPY --from=builder /app/apps/studio/shared/dist ./apps/studio/shared/dist
COPY --from=builder /app/apps/studio/backend/dist ./apps/studio/backend/dist
COPY --from=builder /app/apps/studio/frontend/dist ./apps/studio/frontend/dist

ENV NODE_ENV=production
ENV PORT=5100

EXPOSE 5100

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5100/api/health || exit 1

WORKDIR /app/apps/studio/backend
CMD ["node", "dist/index.js"]
