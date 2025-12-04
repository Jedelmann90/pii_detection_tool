# PII Detection Backend - Node.js

Node.js/TypeScript implementation of the PII Detection API, equivalent to the Python FastAPI backend.

## Features

- 🚀 **Express.js** server with TypeScript
- 🔒 **AWS Bedrock** integration with Titan Text Express v1
- 📊 **Cost tracking** for AWS usage
- 🐳 **Docker** support with hot reload for development
- 🔍 **PII Detection** for 8 types: SSN, EMAIL, PHONE, ADDRESS, DOB, NAME, HASHED_PII, NO_PII
- ⚡ **Performance optimized** for I/O operations

## Quick Start

### Development with Docker (Recommended)

```bash
# Start with hot reload
cd backend-nodejs
docker-compose -f docker-compose.dev.yml up

# Server runs on http://localhost:8001
```

### Local Development

```bash
cd backend-nodejs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your AWS credentials

# Development mode (with hot reload)
npm run dev

# Build and run production
npm run build
npm start
```

## API Endpoints

All endpoints are identical to the Python backend:

- `GET /` - Health check
- `GET /health` - Detailed health status  
- `GET /test-model` - Test AWS Bedrock connection
- `POST /estimate-cost` - Estimate analysis cost
- `POST /analyze-csv` - Analyze CSV file for PII
- `POST /analyze-column` - Analyze single column

## Docker Development Workflow

### Hot Reload Development
```bash
# Start development container with volume mapping
docker-compose -f docker-compose.dev.yml up

# Make code changes in src/ → automatic server restart
# Edit package.json → container rebuilds
```

### Run Both Backends
```bash
# From project root
docker-compose up backend-python backend-nodejs

# Python: http://localhost:8000
# Node.js: http://localhost:8001
```

## Environment Configuration

Same AWS configuration as Python backend:

```env
# AWS Setup
AWS_REGION=us-east-1
USE_AWS_PROFILE=false

# Option 1: AWS Profile
AWS_PROFILE=your-profile-name

# Option 2: Direct credentials
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Development Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # TypeScript compilation  
npm run build:watch  # Watch mode compilation
npm start            # Production server
npm run lint         # ESLint check
npm run test         # Jest tests
```

## Performance Benefits

- ⚡ **Better I/O**: Node.js excels at file operations and HTTP
- 📦 **Smaller memory footprint** compared to Python
- 🔄 **Hot reload** in development containers
- 🚀 **Fast startup time**

## Migration Notes

This Node.js implementation provides:
- ✅ **API compatibility** with existing frontend
- ✅ **Same AWS Bedrock integration**
- ✅ **Identical cost calculation**
- ✅ **Same PII classification logic**
- ✅ **Docker development workflow**
- ✅ **TypeScript type safety**