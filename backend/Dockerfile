# Backend Dockerfile
FROM node:18-alpine AS backend-base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS backend-production

WORKDIR /app

# Install system dependencies for production
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=backend-base /app/dist ./dist
COPY --from=backend-base /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Create logs directory
RUN mkdir -p logs && chown -R backend:nodejs logs

# Change ownership of the app directory
RUN chown -R backend:nodejs /app
USER backend

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
