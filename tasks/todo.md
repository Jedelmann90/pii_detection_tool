# Python to Node.js Backend Refactor Plan

## Overview
Refactor the FastAPI Python backend to a Node.js/Express backend while maintaining all functionality and API compatibility with the existing React frontend.

## Current Python Backend Structure
- **main.py**: FastAPI app with CORS, endpoints for CSV analysis, health checks, cost estimation
- **pii_detector.py**: Core PII detection logic using AWS Bedrock Titan model via boto3
- **models.py**: Pydantic data models for request/response validation
- **cost_calculator.py**: Token and cost calculation utilities

## Key Dependencies to Replace
- **FastAPI** → **Express.js**
- **boto3** (AWS SDK for Python) → **@aws-sdk/client-bedrock-runtime** (AWS SDK for JavaScript)
- **Pydantic** → **Zod** or **joi** for validation
- **pandas** → **papaparse** or **csv-parser** for CSV handling
- **python-dotenv** → **dotenv** (Node.js version)

## Todo Items

### Phase 1: Setup Node.js Project Structure
- [ ] Create new `backend-node/` directory
- [ ] Initialize npm project (`package.json`)
- [ ] Install core dependencies (Express, AWS SDK, dotenv, csv-parser)
- [ ] Install TypeScript and type definitions
- [ ] Setup TypeScript configuration (`tsconfig.json`)
- [ ] Create basic folder structure (`src/`, `src/routes/`, `src/services/`, `src/models/`, `src/utils/`)

### Phase 2: Port Core Functionality
- [ ] Port `models.py` → `src/models/` (using TypeScript interfaces or Zod schemas)
- [ ] Port `cost_calculator.py` → `src/utils/costCalculator.ts`
- [ ] Port `pii_detector.py` → `src/services/piiDetector.ts` (AWS Bedrock client with @aws-sdk)
- [ ] Implement AWS credential handling (profile vs explicit credentials)
- [ ] Port CSV parsing logic (pandas → csv-parser/papaparse)

### Phase 3: Build API Endpoints
- [ ] Create Express app with CORS middleware
- [ ] Implement `GET /` - root/health check
- [ ] Implement `GET /health` - health status
- [ ] Implement `GET /test-model` - test Bedrock model invocation
- [ ] Implement `POST /estimate-cost` - cost estimation endpoint
- [ ] Implement `POST /analyze-csv` - main CSV analysis endpoint
- [ ] Implement `POST /analyze-column` - single column analysis
- [ ] Add request validation middleware (Zod/joi)
- [ ] Add error handling middleware

### Phase 4: Testing & Validation
- [ ] Test AWS Bedrock connection with both credential methods
- [ ] Test CSV upload and parsing
- [ ] Test PII detection on sample data
- [ ] Verify cost calculation accuracy
- [ ] Test all API endpoints with Postman/curl
- [ ] Verify frontend compatibility (same response format)

### Phase 5: Documentation & Deployment
- [ ] Update README with Node.js setup instructions
- [ ] Create new Dockerfile for Node.js backend
- [ ] Update docker-compose.yml to use Node.js backend
- [ ] Update CLAUDE.md with new architecture details
- [ ] Test full deployment with Docker
- [ ] Archive or remove Python backend (backup first)

## Technical Considerations

### AWS SDK Migration
- Python `boto3.client('bedrock-runtime')` → JS `BedrockRuntimeClient`
- Python `invoke_model()` → JS `InvokeModelCommand`
- JSON serialization slightly different between languages

### CSV Parsing
- pandas DataFrames → JavaScript arrays of objects
- Need to handle file upload as buffer/stream
- Sample extraction logic needs to be reimplemented

### Type Safety
- Use TypeScript for better type safety (similar to Pydantic)
- Define interfaces for all data models
- Strict typing for AWS SDK responses

### Error Handling
- FastAPI's HTTPException → Express error middleware
- Try/catch blocks for async operations
- Proper HTTP status codes

## Review Section
*To be completed after implementation*

---

**Created**: 2025-10-03
**Status**: Planning Phase - Awaiting approval
