FROM node:20-alpine AS builder
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy monorepo configuration
COPY package*.json turbo.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Install dependencies and build
RUN npm install
RUN turbo run build --filter=backend

FROM node:20-alpine AS runner
WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
EXPOSE 3000

CMD ["npm", "start"]
