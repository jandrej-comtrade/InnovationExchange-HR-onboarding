# Frontend Dockerfile
FROM node:18-alpine AS frontend-base

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY public ./public

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS frontend-production

WORKDIR /app

# Copy built application
COPY --from=frontend-base /app/.next ./.next
COPY --from=frontend-base /app/public ./public
COPY --from=frontend-base /app/package*.json ./
COPY --from=frontend-base /app/next.config.js ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
