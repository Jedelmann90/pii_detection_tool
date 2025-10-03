// TypeScript interfaces equivalent to Python models.py

export interface CostInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

export interface PIIResult {
  isPii: boolean;
  confidence: number;
  reasoning: string;
  costInfo?: CostInfo;
}

export interface ColumnAnalysis {
  columnName: string;
  sampleValues: string[];
  isPii: boolean;
  confidence: number;
  reasoning: string;
  costInfo?: CostInfo;
}

export interface AnalysisResponse {
  columns: ColumnAnalysis[];
  totalCostInfo: CostInfo;
}

export interface CostEstimateRequest {
  columnCount: number;
  avgSamplesPerColumn?: number;
  avgSampleLength?: number;
}

export interface CostEstimateResponse {
  estimatedCost: CostInfo;
}

// Additional types for internal use
export interface PIIClassificationResult {
  column: string;
  classification: PIIType;
  confidence: number;
  reasoning: string;
  samples: string[];
  costInfo: CostInfo;
}

export type PIIType = 
  | 'SSN'
  | 'EMAIL'
  | 'PHONE'
  | 'ADDRESS'
  | 'DOB'
  | 'NAME'
  | 'HASHED_PII'
  | 'NO_PII'
  | 'NO_DATA'
  | 'ERROR'
  | 'UNKNOWN';

export interface AWSConfig {
  region: string;
  useProfile: boolean;
  profile?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface BedrockModelConfig {
  modelId: string;
  maxTokenCount: number;
  temperature: number;
  topP: number;
}

// Error types
export interface APIError {
  message: string;
  code: string;
  statusCode: number;
}

// Request validation schemas
export interface AnalyzeColumnRequest {
  columnName: string;
  sampleValues: string[];
}