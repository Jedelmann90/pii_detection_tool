from pydantic import BaseModel
from typing import List, Optional

class PIIResult(BaseModel):
    is_pii: bool
    confidence: float
    reasoning: str

class ColumnAnalysis(BaseModel):
    column_name: str
    sample_values: List[str]
    is_pii: bool
    confidence: float
    reasoning: str