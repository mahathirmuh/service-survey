# Docker Deployment Guide

This guide explains how to deploy the Service Survey application using Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git (for cloning the repository)

## 🚀 Quick Start

### Production Deployment

```bash
# Windows
docker-build.bat production

# Linux/Mac
./docker-build.sh production
```

The application will be available at: http://localhost:3000

### Development Mode

```bash
# Windows
docker-build.bat development

# Linux/Mac
./docker-build.sh development
```

The application will be available at: http://localhost:8080 with hot reloading.

## 📁 Docker Files Overview

- **`Dockerfile`** - Multi-stage production build
- **`Dockerfile.dev`** - Development environment with hot reloading
- **`docker-compose.yml`** - Production deployment configuration
- **`docker-compose.dev.yml`** - Development deployment configuration
- **`nginx.conf`** - Nginx configuration for serving the React SPA
- **`.dockerignore`** - Files to exclude from Docker build context
- **`docker-build.sh`** - Build script for Linux/Mac
- **`docker-build.bat`** - Build script for Windows

## 🛠️ Manual Commands

### Build Images

```bash
# Production image
docker build -t service-survey-app:prod .

# Development image
docker build -f Dockerfile.dev -t service-survey-app:dev .
```

### Run Containers

```bash
# Production (using docker-compose)
docker-compose up -d

# Development (using docker-compose)
docker-compose -f docker-compose.dev.yml up -d

# Production (manual)
docker run -d -p 3000:80 --name service-survey service-survey-app:prod

# Development (manual)
docker run -d -p 8080:8080 -v $(pwd):/app -v /app/node_modules --name service-survey-dev service-survey-app:dev
```

### Stop and Clean Up

```bash
# Stop containers
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Remove containers
docker rm service-survey service-survey-dev

# Remove images
docker rmi service-survey-app:prod service-survey-app:dev

# Clean up system
docker system prune -f
```

## 🔧 Configuration

### Environment Variables

You can customize the deployment by setting environment variables:

```bash
# In docker-compose.yml
environment:
  - NODE_ENV=production
  - REACT_APP_API_URL=https://your-api.com
  - REACT_APP_SUPABASE_URL=your-supabase-url
  - REACT_APP_SUPABASE_ANON_KEY=your-supabase-key
```

### Port Configuration

- **Production**: Port 3000 (mapped from container port 80)
- **Development**: Port 8080 (matches Vite dev server)

To change ports, modify the `ports` section in the docker-compose files:

```yaml
ports:
  - "8080:80"  # host:container
```

### Volume Mounts (Development)

The development setup includes volume mounts for hot reloading:

```yaml
volumes:
  - .:/app                # Mount source code
  - /app/node_modules     # Preserve node_modules
```

## 🏗️ Build Process

### Production Build

1. **Stage 1 (Builder)**:
   - Uses Node.js 18 Alpine
   - Installs dependencies
   - Builds the React application

2. **Stage 2 (Production)**:
   - Uses Nginx Alpine
   - Copies built files from builder stage
   - Serves static files with optimized Nginx config

### Development Build

- Uses Node.js 18 Alpine
- Installs all dependencies (including dev)
- Runs Vite dev server with hot reloading

## 🔍 Health Checks

Both production and development containers include health checks:

- **Production**: `curl -f http://localhost/health`
- **Development**: `curl -f http://localhost:8080/`

## 🌐 Nginx Configuration

The production build uses a custom Nginx configuration that includes:

- **SPA Routing**: Handles React Router routes
- **Static Asset Caching**: 1-year cache for static files
- **Gzip Compression**: Reduces file sizes
- **Security Headers**: Basic security headers
- **Health Check Endpoint**: `/health` endpoint

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   
   # Kill the process or use a different port
   ```

2. **Build Fails**:
   ```bash
   # Clean Docker cache
   docker builder prune -f
   
   # Rebuild without cache
   docker build --no-cache -t service-survey-app:prod .
   ```

3. **Container Won't Start**:
   ```bash
   # Check logs
   docker logs service-survey-app
   
   # Check container status
   docker ps -a
   ```

4. **Hot Reloading Not Working (Development)**:
   - Ensure volume mounts are correct
   - Check that `CHOKIDAR_USEPOLLING=true` is set
   - Verify file permissions

### Debugging Commands

```bash
# View container logs
docker logs service-survey-app

# Execute commands in running container
docker exec -it service-survey-app sh

# Inspect container
docker inspect service-survey-app

# View resource usage
docker stats service-survey-app
```

## 📊 Performance Optimization

### Production Optimizations

- Multi-stage build reduces final image size
- Nginx serves static files efficiently
- Gzip compression enabled
- Static asset caching configured
- Health checks for container orchestration

### Development Optimizations

- Volume mounts for fast file changes
- Hot reloading enabled
- Polling enabled for file watching in containers

## 🔒 Security Considerations

- Non-root user in containers (Alpine default)
- Security headers in Nginx configuration
- No sensitive data in Docker images
- `.dockerignore` excludes unnecessary files
- Health checks for monitoring

## 📈 Scaling and Production Deployment

For production deployment, consider:

1. **Load Balancer**: Use nginx-proxy or Traefik
2. **SSL/TLS**: Add SSL certificates
3. **Environment Variables**: Use Docker secrets or external config
4. **Monitoring**: Add logging and monitoring solutions
5. **Backup**: Implement backup strategies for persistent data

### Example with Reverse Proxy

Uncomment the nginx-proxy service in `docker-compose.yml` and create a `proxy.conf`:

```nginx
upstream app {
    server service-survey:80;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📝 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)