# Docker Development Strategy for Node.js Backend

## Multi-Stage Dockerfile Approach
- **Development Stage**: Full Node.js environment with nodemon
- **Production Stage**: Minimal production build
- **Hot Reload**: Volume mapping for instant code updates

## Volume Mapping Strategy
```yaml
volumes:
  - ./backend-nodejs/src:/app/src           # Source code hot reload
  - ./backend-nodejs/package.json:/app/package.json  # Dependency tracking
  - /app/node_modules                       # Anonymous volume for performance
```

## Development Workflow
1. Code changes detected via volume mapping
2. nodemon automatically restarts server
3. TypeScript compilation happens in container
4. AWS credentials passed via environment
5. Same port mapping as Python backend (option to run both)

## Performance Optimizations
- Multi-stage build for smaller production images
- Anonymous volume for node_modules (faster I/O)
- .dockerignore to exclude unnecessary files
- Development vs production environment separation