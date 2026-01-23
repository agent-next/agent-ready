# Agent Ready API - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Install git for cloning during build
RUN apk add --no-cache git

# Copy package files for both root and api
COPY package.json package-lock.json ./
COPY api/package.json api/package-lock.json ./api/

# Install dependencies for both
RUN npm ci --ignore-scripts
RUN cd api && npm ci

# Copy source code
COPY api/src ./api/src
COPY api/tsconfig.json ./api/
COPY src ./src
COPY profiles ./profiles

# Build the API
RUN cd api && npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install git for cloning repos
RUN apk add --no-cache git

# Copy built files (includes both api and parent src)
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./api_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api/package.json ./

# Copy profiles (needed for scanning)
COPY --from=builder /app/profiles ./profiles

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/api/src/index.js"]
