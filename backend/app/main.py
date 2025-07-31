from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import List, Dict
from .pii_detector import PIIDetector
from .models import PIIResult, ColumnAnalysis

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
        
        # Analyze each column for PII
        results = []
        for column in df.columns:
            sample_values = df[column].dropna().astype(str).sample(min(5, len(df))).tolist()
            
            pii_result = pii_detector.analyze_column(column, sample_values)
            
            results.append(ColumnAnalysis(
                column_name=column,
                sample_values=sample_values,
                is_pii=pii_result.is_pii,
                confidence=pii_result.confidence,
                reasoning=pii_result.reasoning
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
        result = pii_detector.analyze_column(column_name, sample_values)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing column: {str(e)}")