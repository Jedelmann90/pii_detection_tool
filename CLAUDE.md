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

The application supports two methods for AWS authentication:

#### Method 1: Direct AWS Credentials (.env file) - Current Setup
For temporary development, use direct AWS credentials:

1. **Copy and configure environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file with your AWS credentials:**
   ```bash
   # Method 1: Direct AWS Credentials (temporary setup)
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=us-east-1
   ```

#### Method 2: Work Account Setup (Okta SSO + IAM Role) - Future Use
For production/long-term use with work accounts through Okta SSO:

1. **Configure AWS CLI with work profile:**
   ```bash
   # Configure your work AWS profile (replace 'work-profile' with your profile name)
   aws configure sso --profile work-profile
   # Follow prompts to authenticate via Okta
   ```

2. **Set environment variables in .env:**
   ```bash
   # Method 2: AWS Profile (recommended for long-term)
   AWS_PROFILE=work-profile
   USE_AWS_PROFILE=true
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


## 7 Claude rules
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.