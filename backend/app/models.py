from pydantic import BaseModel
from typing import List, Optional

class CostInfo(BaseModel):
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost_usd: float
    output_cost_usd: float
    total_cost_usd: float

class PIIResult(BaseModel):
    is_pii: bool
    confidence: float
    reasoning: str
    cost_info: Optional[CostInfo] = None

class ColumnAnalysis(BaseModel):
    column_name: str
    sample_values: List[str]
    is_pii: bool
    confidence: float
    reasoning: str
    cost_info: Optional[CostInfo] = None

class AnalysisResponse(BaseModel):
    columns: List[ColumnAnalysis]
    total_cost_info: CostInfo

class CostEstimateRequest(BaseModel):
    column_count: int
    avg_samples_per_column: int = 5
    avg_sample_length: int = 20

class CostEstimateResponse(BaseModel):
    estimated_cost: CostInfo