# Agent Ready Backend - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Install git for cloning repos and for agent-ready dependency
RUN apk add --no-cache git

# Copy package files
COPY package.json package-lock.json ./

# Clone agent-ready dependency (since we can't use file: reference in Docker)
RUN git clone --depth 1 https://github.com/robotlearning123/agent-ready.git /tmp/agent-ready && \
    cd /tmp/agent-ready && npm ci && npm run build

# Update package.json to use local path for agent-ready
RUN sed -i 's|"agent-ready": "file:../agent-ready"|"agent-ready": "file:/tmp/agent-ready"|' package.json

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the backend
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install git for cloning repos during scans
RUN apk add --no-cache git

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy agent-ready profiles (needed for scanning)
COPY --from=builder /tmp/agent-ready/profiles ./node_modules/agent-ready/profiles
COPY --from=builder /tmp/agent-ready/templates ./node_modules/agent-ready/templates

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create temp directory for cloning repos
RUN mkdir -p /tmp/agent-ready-clones && chown appuser:appgroup /tmp/agent-ready-clones

USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV CLONE_BASE_PATH=/tmp/agent-ready-clones

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
