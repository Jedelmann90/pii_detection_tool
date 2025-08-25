from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import List, Dict
from dotenv import load_dotenv
from .pii_detector import PIIDetector
from .models import PIIResult, ColumnAnalysis, AnalysisResponse, CostEstimateRequest, CostEstimateResponse, CostInfo
from .cost_calculator import CostCalculator

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
        response, cost_info = pii_detector._call_titan_model("Is this PII: john@email.com? Answer yes or no.")
        return {"success": True, "response": response, "cost_info": cost_info}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/estimate-cost", response_model=CostEstimateResponse)
async def estimate_cost(request: CostEstimateRequest):
    """
    Estimate the cost of analyzing a CSV file
    """
    try:
        estimated_cost_data = CostCalculator.estimate_csv_analysis_cost(
            column_count=request.column_count,
            avg_samples_per_column=request.avg_samples_per_column,
            avg_sample_length=request.avg_sample_length
        )
        
        return CostEstimateResponse(
            estimated_cost=CostInfo(**estimated_cost_data)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error estimating cost: {str(e)}")

@app.post("/analyze-csv", response_model=AnalysisResponse)
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
        total_input_tokens = 0
        total_output_tokens = 0
        total_cost_usd = 0.0
        
        for result in analysis_results:
            cost_info = result.get('cost_info', {})
            cost_obj = CostInfo(**cost_info) if cost_info else None
            
            if cost_info:
                total_input_tokens += cost_info.get('input_tokens', 0)
                total_output_tokens += cost_info.get('output_tokens', 0)
                total_cost_usd += cost_info.get('total_cost_usd', 0.0)
            
            results.append(ColumnAnalysis(
                column_name=result['column'],
                sample_values=result['samples'],
                is_pii=result['classification'] != 'NO_PII',
                confidence=result['confidence'],
                reasoning=result['reasoning'],
                cost_info=cost_obj
            ))
        
        total_cost_info = CostInfo(
            input_tokens=total_input_tokens,
            output_tokens=total_output_tokens,
            total_tokens=total_input_tokens + total_output_tokens,
            input_cost_usd=round((total_input_tokens / 1000) * CostCalculator.INPUT_TOKEN_COST_PER_1K, 6),
            output_cost_usd=round((total_output_tokens / 1000) * CostCalculator.OUTPUT_TOKEN_COST_PER_1K, 6),
            total_cost_usd=round(total_cost_usd, 6)
        )
        
        return AnalysisResponse(
            columns=results,
            total_cost_info=total_cost_info
        )
        
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
            cost_info = result.get('cost_info', {})
            cost_obj = CostInfo(**cost_info) if cost_info else None
            
            return PIIResult(
                is_pii=result['classification'] != 'NO_PII',
                confidence=result['confidence'],
                reasoning=result['reasoning'],
                cost_info=cost_obj
            )
        else:
            return PIIResult(is_pii=False, confidence=0.0, reasoning="No analysis results", cost_info=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing column: {str(e)}")