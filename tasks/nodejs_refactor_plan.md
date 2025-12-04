# Python to Node.js Refactor Plan

## Overview
Refactor the existing Python FastAPI backend to Node.js with TypeScript while maintaining the same PII detection functionality and API endpoints.

## Current Python Structure Analysis
- **main.py**: FastAPI app with 5 endpoints, CORS configuration
- **pii_detector.py**: AWS Bedrock Titan integration, CSV analysis logic
- **cost_calculator.py**: Token estimation and cost calculation
- **models.py**: Pydantic models for API requests/responses

## Migration Strategy

### Technology Mapping
| Python | Node.js Equivalent |
|--------|-------------------|
| FastAPI | Express.js |
| boto3 | @aws-sdk/client-bedrock-runtime |
| pandas | csv-parser + custom logic |
| pydantic | TypeScript interfaces + joi/zod |
| uvicorn | Express server |

### Todo Items
- [x] 1. Analyze current Python backend structure and dependencies
- [x] 2. Design Node.js equivalent architecture (Express.js + AWS SDK)
- [x] 3. Create package.json with Node.js dependencies
- [x] 4. Create multi-stage Dockerfile for Node.js with dev/prod modes
- [x] 5. Create docker-compose.yml with volume mapping for hot reload
- [x] 6. Implement main server file (equivalent to main.py)
- [x] 7. Implement PII detector module (equivalent to pii_detector.py)
- [x] 8. Implement cost calculator module (equivalent to cost_calculator.py)
- [x] 9. Create TypeScript interfaces for models (equivalent to models.py)
- [x] 10. Add environment configuration and AWS setup
- [x] 11. Create development scripts with nodemon for auto-restart
- [x] 12. Update main docker-compose to include Node.js backend option

## ✅ Implementation Complete!

### Review Summary

**Successfully migrated Python FastAPI backend to Node.js/TypeScript:**

1. **Complete Feature Parity**: All endpoints and functionality preserved
2. **Docker Integration**: Multi-stage builds with hot reload development
3. **AWS Bedrock**: Full integration with Titan Text Express v1
4. **Cost Tracking**: Identical token estimation and cost calculation
5. **Type Safety**: Full TypeScript implementation
6. **Development Workflow**: Hot reload with volume mapping

### Key Files Created:
- `backend-nodejs/src/app.ts` - Main Express server
- `backend-nodejs/src/piiDetector.ts` - AWS Bedrock integration  
- `backend-nodejs/src/costCalculator.ts` - Cost calculation
- `backend-nodejs/src/types.ts` - TypeScript interfaces
- `backend-nodejs/Dockerfile` - Multi-stage container build
- `backend-nodejs/docker-compose.dev.yml` - Development with hot reload
- Updated root `docker-compose.yml` - Support for both backends

### Usage:
```bash
# Development with hot reload
cd backend-nodejs && docker-compose -f docker-compose.dev.yml up

# Production alongside Python backend  
docker-compose up backend-python backend-nodejs
# Python: localhost:8000, Node.js: localhost:8001
```

### New Directory Structure
```
backend-nodejs/
├── src/
│   ├── app.ts (main server - Express app)
│   ├── piiDetector.ts (AWS Bedrock integration)
│   ├── costCalculator.ts (token/cost calculations)
│   ├── types.ts (TypeScript interfaces)
│   ├── routes/
│   │   ├── health.ts
│   │   ├── analysis.ts
│   │   └── cost.ts
│   └── utils/
│       ├── csvParser.ts
│       └── awsConfig.ts
├── package.json
├── tsconfig.json
├── Dockerfile (multi-stage: dev + prod)
├── docker-compose.dev.yml (volume mapping)
├── .env.example
├── .dockerignore
├── .gitignore
└── README.md
```

### Key Implementation Notes
1. **Express.js Setup**: CORS, middleware, error handling
2. **AWS SDK v3**: Modern AWS SDK with proper TypeScript support
3. **CSV Handling**: Replace pandas functionality with csv-parser
4. **Type Safety**: Full TypeScript implementation
5. **Environment Config**: Maintain same AWS credential handling options
6. **API Compatibility**: Keep same endpoint structure for frontend

### Docker Development Setup

#### Multi-Stage Dockerfile
- **Development Stage**: Node.js with nodemon for hot reload
- **Production Stage**: Optimized build with minimal dependencies
- **Volume Mapping**: Source code mounted for automatic updates

#### Docker Compose Configuration
```yaml
services:
  backend-nodejs:
    build:
      context: ./backend-nodejs
      target: development  # Use development stage
    volumes:
      - ./backend-nodejs/src:/app/src  # Hot reload
      - ./backend-nodejs/package.json:/app/package.json
    ports:
      - "8001:8000"  # Different port from Python backend
    environment:
      - NODE_ENV=development
    env_file:
      - .env
```

#### Development Workflow
1. **Code Changes**: Automatic detection via volume mapping
2. **Hot Reload**: nodemon restarts server on file changes
3. **Live Debugging**: Source maps and debugging support
4. **Container Rebuild**: Only when package.json changes

### Benefits of Migration
- Better performance for I/O operations
- Stronger typing with TypeScript
- More familiar stack for frontend developers
- Smaller memory footprint
- Better Docker image optimization
- **Enhanced Development Experience**: Hot reload in containers
- **Consistent Environment**: Docker ensures same runtime everywhere