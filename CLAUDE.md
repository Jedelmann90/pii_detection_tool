# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PII (Personally Identifiable Information) detection tool designed for defensive security purposes. It analyzes CSV files to identify potential PII using AWS Bedrock's Titan model. The application consists of a FastAPI backend and a Next.js/React frontend.

## Development Commands

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test imports
python test_imports.py
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linting
npm run lint
```

### Docker Operations

```bash
# Start both services with Docker Compose
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Check service health
./check_servers.sh
```

## Architecture

### Backend (FastAPI + AWS Bedrock)
- **Entry Point**: `backend/app/main.py` - FastAPI application with CORS configuration
- **PII Detection Logic**: `backend/app/pii_detector.py` - Core detection using AWS Bedrock Titan model
- **Data Models**: `backend/app/models.py` - Pydantic models for API responses
- **Configuration**: Supports AWS credentials via environment variables, AWS CLI, or AWS profiles

### Frontend (Next.js + shadcn/ui)
- **Main Page**: `frontend/src/app/page.tsx` - CSV upload interface
- **Components**: 
  - `FileUpload.tsx` - Drag-and-drop file upload
  - `ResultsTable.tsx` - PII detection results display
- **UI Components**: Located in `frontend/src/components/ui/` using shadcn/ui library

### API Endpoints
- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /analyze-csv` - Main endpoint for CSV analysis
- `POST /analyze-column` - Analyze individual column
- `GET /test-model` - Test direct model invocation

## AWS Configuration

The application requires AWS Bedrock access. Configure credentials using one of these methods:

1. **Environment Variables (.env file)**:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   USE_AWS_PROFILE=false
   ```

2. **AWS Profile**:
   ```
   USE_AWS_PROFILE=true
   AWS_PROFILE=your-profile-name
   ```

3. **AWS CLI**: Run `aws configure`

## PII Classification Types

The system detects the following PII types:
- SSN (Social Security Numbers)
- EMAIL (Email addresses)
- PHONE (Phone numbers)
- ADDRESS (Physical addresses)
- DOB (Date of Birth)
- NAME (Personal names)
- HASHED_PII (Hashed/encrypted PII)
- NO_PII (Not PII)

## Key Implementation Details

- **CORS Configuration**: Currently allows all origins (`*`) for development. Update for production.
- **Model**: Uses Amazon Titan Text Express v1 via Bedrock
- **Data Processing**: Pandas for CSV handling, max 5 sample values per column for analysis
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Docker**: Pre-built images available as `joshuaedelmann/export-review-backend` and `joshuaedelmann/export-review-frontend`

## Testing Approach

- Backend: Use `python test_imports.py` to verify dependencies
- Manual testing via endpoints (no automated test suite currently)
- Frontend: No test suite currently configured

## Security Considerations

This is a defensive security tool. When working with this codebase:
- Never expose AWS credentials in code
- Maintain secure handling of uploaded CSV data
- This tool is for identifying PII, not for malicious purposes
- Review all PII classifications before taking action on data