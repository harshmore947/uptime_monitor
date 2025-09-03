# Docker Setup

This directory contains Docker configuration for containerizing the Uptime Monitor application.

## Quick Start

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Services

### Backend Service

- **Port**: 3000
- **Environment**: Production-ready configuration
- **Health Check**: `/health` endpoint

### Frontend Service

- **Port**: 80
- **Build**: Multi-stage build for optimization
- **Nginx**: Serves static files and proxies API calls

### Database Service

- **MongoDB**: Latest stable version
- **Persistent Storage**: Data persists across container restarts
- **Authentication**: Configured with default credentials

### Redis Service (Optional)

- **Port**: 6379
- **Use**: Caching and session storage
- **Persistence**: Configurable data persistence

## Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
# Database
MONGO_URL=mongodb://mongo:27017/uptime_monitor
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password

# Redis (optional)
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
SECRET=your-strong-secret-here
PORT=3000

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Geographic Monitoring
MONITORING_REGION=us-east-1
MONITORING_CITY=New York
MONITORING_COUNTRY=USA
MONITORING_LATITUDE=40.7128
MONITORING_LONGITUDE=-74.0060

# Frontend
FRONTEND_URL=http://localhost
```

### Docker Compose Override

For development overrides, create `docker-compose.override.yml`:

```yaml
version: "3.8"

services:
  backend:
    environment:
      NODE_ENV: development
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
```

## Building Images

### Backend Image

```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### Frontend Image

```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=base /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Docker Compose Files

### Development (`docker-compose.yml`)

```yaml
version: "3.8"

services:
  mongo:
    image: mongo:latest
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV}
      MONGO_URL: ${MONGO_URL}
      SECRET: ${SECRET}
      EMAIL_SERVICE: ${EMAIL_SERVICE}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      EMAIL_FROM: ${EMAIL_FROM}
      MONITORING_REGION: ${MONITORING_REGION}
      MONITORING_CITY: ${MONITORING_CITY}
      MONITORING_COUNTRY: ${MONITORING_COUNTRY}
      MONITORING_LATITUDE: ${MONITORING_LATITUDE}
      MONITORING_LONGITUDE: ${MONITORING_LONGITUDE}
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "3000:3000"
    depends_on:
      - mongo
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
  redis_data:
```

### Production (`docker-compose.prod.yml`)

```yaml
version: "3.8"

services:
  mongo:
    image: mongo:latest
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
    volumes:
      - mongo_data:/data/db
    networks:
      - uptime_network

  redis:
    image: redis:alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - uptime_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGO_URL: ${MONGO_URL}
      SECRET: ${SECRET}
      EMAIL_SERVICE: ${EMAIL_SERVICE}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      EMAIL_FROM: ${EMAIL_FROM}
      MONITORING_REGION: ${MONITORING_REGION}
      MONITORING_CITY: ${MONITORING_CITY}
      MONITORING_COUNTRY: ${MONITORING_COUNTRY}
      MONITORING_LATITUDE: ${MONITORING_LATITUDE}
      MONITORING_LONGITUDE: ${MONITORING_LONGITUDE}
      FRONTEND_URL: ${FRONTEND_URL}
    networks:
      - uptime_network
    depends_on:
      - mongo
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    ports:
      - "80:80"
    networks:
      - uptime_network
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - uptime_network
    depends_on:
      - backend
      - frontend

volumes:
  mongo_data:
  redis_data:

networks:
  uptime_network:
    driver: bridge
```

## Monitoring

### Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logging

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Security

### Docker Security Best Practices

1. **Use non-root users**
2. **Minimal base images**
3. **Multi-stage builds**
4. **No secrets in images**
5. **Regular updates**
6. **Resource limits**

### Security Configuration

```yaml
security_opt:
  - no-new-privileges:true
```

## Troubleshooting

### Common Issues

1. **Port conflicts**

   - Change host ports in docker-compose.yml

2. **Permission issues**

   - Check file permissions
   - Use correct user in Dockerfile

3. **Memory issues**

   - Increase Docker memory limit
   - Add resource limits to services

4. **Network issues**
   - Check service names
   - Verify network configuration

### Debugging

```bash
# View container logs
docker-compose logs [service_name]

# Access container shell
docker-compose exec [service_name] sh

# View running containers
docker-compose ps

# Stop and remove containers
docker-compose down -v
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push backend
        uses: docker/build-push-action@v2
        with:
          context: ./backend
          push: true
          tags: yourusername/uptime-monitor-backend:latest

      - name: Build and push frontend
        uses: docker/build-push-action@v2
        with:
          context: ./frontend
          push: true
          tags: yourusername/uptime-monitor-frontend:latest
```
