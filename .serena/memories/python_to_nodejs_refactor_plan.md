# Python to Node.js Refactor Plan

## Current Python Backend Analysis
- **FastAPI** → **Express.js**
- **boto3** → **@aws-sdk/client-bedrock-runtime**
- **pandas** → **csv-parser** + custom logic
- **pydantic** → **TypeScript interfaces** + **joi/zod validation**
- **uvicorn** → **Express server**

## Key Components to Migrate

### 1. main.py → server.js/app.js
- FastAPI app → Express app
- CORS middleware → cors package
- Route handlers for: /, /health, /test-model, /estimate-cost, /analyze-csv, /analyze-column
- File upload handling with multer

### 2. pii_detector.py → piiDetector.js
- AWS Bedrock client setup
- Titan model invocation
- CSV analysis logic
- PII classification parsing

### 3. cost_calculator.py → costCalculator.js
- Token estimation logic
- Cost calculation functions
- CSV analysis cost estimation

### 4. models.py → types.ts
- Pydantic models → TypeScript interfaces
- API request/response types

## Node.js Dependencies Needed
- express, cors, multer (web framework)
- @aws-sdk/client-bedrock-runtime (AWS Bedrock)
- csv-parser, csv-stringify (CSV handling)
- dotenv (environment variables)
- joi or zod (validation)
- typescript, @types/* (development)

## Directory Structure
```
backend-nodejs/
├── src/
│   ├── app.ts (main server)
│   ├── piiDetector.ts
│   ├── costCalculator.ts
│   ├── types.ts
│   ├── routes/
│   └── utils/
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```