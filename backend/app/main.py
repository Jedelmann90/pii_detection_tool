from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import List, Dict
from dotenv import load_dotenv
from .pii_detector import PIIDetector
from .models import PIIResult, ColumnAnalysis

# Load environment variables at startup
load_dotenv()

app = FastAPI(title="PII Detection API", version="1.0.0")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Set to False when using "*" for origins
    allow_methods=["*"],
    allow_headers=["*"],
)

pii_detector = PIIDetector()

@app.get("/")
async def root():
    return {"message": "PII Detection API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test-model")
async def test_model():
    """Test direct model invocation"""
    try:
        response = pii_detector._call_titan_model("Is this PII: john@email.com? Answer yes or no.")
        return {"success": True, "response": response}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/analyze-csv", response_model=List[ColumnAnalysis])
async def analyze_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file and analyze columns for PII content
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        # Read CSV file
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Analyze the CSV for PII
        analysis_results = pii_detector.analyze_csv(df)
        
        results = []
        for result in analysis_results:
            results.append(ColumnAnalysis(
                column_name=result['column'],
                sample_values=result['samples'],
                is_pii=result['classification'] != 'NO_PII',
                confidence=result['confidence'],
                reasoning=result['reasoning']
            ))
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@app.post("/analyze-column", response_model=PIIResult)
async def analyze_single_column(column_name: str, sample_values: List[str]):
    """
    Analyze a single column for PII content
    """
    try:
        # Create a simple DataFrame for the single column
        import pandas as pd
        df = pd.DataFrame({column_name: sample_values})
        analysis_results = pii_detector.analyze_csv(df)
        
        if analysis_results:
            result = analysis_results[0]
            return PIIResult(
                is_pii=result['classification'] != 'NO_PII',
                confidence=result['confidence'],
                reasoning=result['reasoning']
            )
        else:
            return PIIResult(is_pii=False, confidence=0.0, reasoning="No analysis results")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing column: {str(e)}")