FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application to nginx
COPY --from=base /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S uptime -u 1001

# Change ownership
RUN chown -R uptime:nodejs /usr/share/nginx/html
RUN chown -R uptime:nodejs /var/cache/nginx
RUN chown -R uptime:nodejs /var/log/nginx
RUN chown -R uptime:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R uptime:nodejs /var/run/nginx.pid

USER uptime

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
