# PII Detection System

A modern web application for detecting Personally Identifiable Information (PII) in CSV files using AWS Bedrock and Claude AI.

## Architecture

This application uses a clean separation between backend and frontend:

- **Backend**: Python FastAPI server with AWS Bedrock integration
- **Frontend**: React/Next.js with shadcn/ui components
- **AI Model**: Claude Instant via AWS Bedrock for PII classification

## Project Structure

```
PII_detection/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Pydantic data models
│   │   └── pii_detector.py      # Core PII detection logic
│   ├── data/                    # Test CSV files
│   ├── requirements.txt         # Python dependencies
│   ├── tests/                   # Backend tests
│   └── venv/                    # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app directory
│   │   ├── components/          # React components
│   │   └── lib/                 # Utility functions
│   ├── package.json             # Node.js dependencies
│   └── tailwind.config.ts       # Tailwind CSS config
└── CLAUDE.md                    # Development instructions
```

## Setup & Installation

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure AWS credentials** (choose one method):
   
   **Option A: AWS CLI (Recommended)**
   ```bash
   aws configure
   ```
   
   **Option B: Environment Variables**
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```
   
   **Option C: AWS Profile**
   ```bash
   export AWS_PROFILE=your-profile-name
   ```

5. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Usage

1. **Start both servers:**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Access the web application** at `http://localhost:3000`

3. **Upload a CSV file** using the drag-and-drop interface

4. **View results** showing PII classification for each column with:
   - PII detection status
   - Confidence scores
   - Sample values
   - AI reasoning

## API Endpoints

### Backend API (Port 8000)

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /analyze-csv` - Upload and analyze CSV file
- `POST /analyze-column` - Analyze individual column

### Example API Usage

```bash
# Upload CSV for analysis
curl -X POST "http://localhost:8001/analyze-csv" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your-file.csv"
```

## AWS Requirements

- **AWS Account** with Bedrock access
- **IAM permissions** for Bedrock model invocation
- **Bedrock model access** to `anthropic.claude-instant-v1`
- **Regional availability**: Ensure Bedrock is available in your selected region

## Security Considerations

This is a **defensive security tool** designed to help identify PII in datasets. Key security practices:

- Never commit AWS credentials to version control
- Use IAM roles with minimal required permissions
- Process sensitive data in secure environments
- Review detected PII classifications before taking action

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Adding New Features

1. **Backend**: Add new endpoints in `app/main.py`
2. **Frontend**: Create new components in `src/components/`
3. **UI Components**: Use shadcn/ui for consistent styling

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
- Deploy as Docker container or serverless function
- Ensure AWS credentials are configured in production environment

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or static hosting

## Troubleshooting

### Common Issues

1. **AWS Authentication Error**: Verify AWS credentials and region
2. **CORS Issues**: Ensure backend allows frontend origin
3. **Port Conflicts**: Change ports in configuration if needed
4. **Model Access**: Verify Bedrock model permissions in AWS console

### Backend Logs
Check FastAPI logs for detailed error information:
```bash
uvicorn app.main:app --log-level debug
```

### Frontend Logs
Check browser console for frontend errors and network issues.