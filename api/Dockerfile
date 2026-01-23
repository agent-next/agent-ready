# Agent Ready API - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY api/package.json ./api/

# Install dependencies
RUN cd api && npm install

# Copy source code
COPY api/src ./api/src
COPY api/tsconfig.json ./api/
COPY src ./src

# Build
RUN cd api && npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install git for cloning repos
RUN apk add --no-cache git

# Copy built files
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/package.json ./

# Copy profiles (needed for scanning)
COPY src/profiles ./src/profiles

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

CMD ["node", "dist/index.js"]
