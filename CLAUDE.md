# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PII (Personally Identifiable Information) detection system with a separated backend/frontend architecture. The backend uses FastAPI and AWS Bedrock, while the frontend is built with React/Next.js and shadcn/ui components.

## Architecture

- **backend/**: Python FastAPI server with AWS Bedrock integration
  - **app/main.py**: FastAPI application with CORS and API endpoints
  - **app/pii_detector.py**: Core PII detection logic using Claude via Bedrock
  - **app/models.py**: Pydantic data models for API requests/responses
  - **data/**: Contains training/testing CSV files with labeled PII examples
- **frontend/**: React/Next.js application with modern UI
  - **src/app/**: Next.js 13+ app directory structure
  - **src/components/**: React components including shadcn/ui components
  - Built with TypeScript, Tailwind CSS, and shadcn/ui

## Key Dependencies

### Backend
- **fastapi**: Modern Python web framework
- **uvicorn**: ASGI server for FastAPI
- **langchain**: LLM orchestration framework
- **boto3**: AWS SDK for Bedrock integration
- **pandas**: CSV data processing

### Frontend
- **next.js**: React framework with app directory
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **lucide-react**: Icon library

## Common Commands

### Running the Application

#### Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Full Development Setup
```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### AWS Configuration

### Work Account Setup (Okta SSO + IAM Role)
The application is configured to use work AWS accounts through Okta SSO:

1. **Configure AWS CLI with work profile:**
   ```bash
   # Configure your work AWS profile (replace 'work-profile' with your profile name)
   aws configure sso --profile work-profile
   # Follow prompts to authenticate via Okta
   ```

2. **Set environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and set your work profile name
   AWS_PROFILE=work-profile
   AWS_REGION=us-east-1
   ```

3. **Login to work account:**
   ```bash
   aws sso login --profile work-profile
   ```

### Requirements
- AWS profile configured with Okta SSO integration
- IAM role with Bedrock access permissions
- The application uses the `anthropic.claude-instant-v1` model from Bedrock
- Bedrock must be enabled in your work AWS account

## Application Flow

1. User uploads a CSV file via the React frontend interface
2. Frontend sends the file to the FastAPI backend via REST API
3. Backend processes the CSV and extracts column samples (up to 5 values per column)
4. For each column, samples are sent to Claude Instant via Bedrock for PII classification
5. Backend returns structured results with PII status, confidence scores, and reasoning
6. Frontend displays results in a modern table with visual indicators and sample data

## Data Files

- **pii_training_data.csv**: Contains examples of various PII types (SSN, EMAIL, DOB, ADDRESS, PHONE, HASHED_PII)
- **fake_pii.csv** and **no_pii.csv**: Additional test datasets

## Security Considerations

This is a defensive security tool designed to detect PII in datasets. The system processes potentially sensitive data, so ensure proper AWS IAM permissions and secure deployment practices when using in production.