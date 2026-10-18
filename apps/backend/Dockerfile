# Stage 1: Build Medusa 2 server
FROM node:22.23.3-bookworm-slim AS builder

WORKDIR /app

# Copy root manifests and workspace manifests required by npm ci
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages

# Install dependencies strictly with clean install
RUN npm ci

# Copy backend source files
COPY apps/backend ./apps/backend

# Build the Medusa 2 backend (generates apps/backend/.medusa/server)
RUN npm run build --workspace apps/backend

# Stage 2: Production runtime image
FROM node:22.23.3-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Install curl for container healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the compiled server from builder stage
COPY --chown=node:node --from=builder /app/apps/backend/.medusa/server /app/.medusa/server

WORKDIR /app/.medusa/server

# Install production dependencies inside .medusa/server as required by Medusa 2
RUN npm install --omit=dev && chown -R node:node /app/.medusa/server

# Add local node_modules/.bin to PATH for npx and medusa CLI execution
ENV PATH="/app/.medusa/server/node_modules/.bin:${PATH}"

# Run as non-root node user
USER node

EXPOSE 9000

CMD ["npm", "run", "start"]
