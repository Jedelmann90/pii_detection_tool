// Main Express application equivalent to Python main.py

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import dotenv from 'dotenv';
import { PIIDetector } from './piiDetector';
import { CostCalculator } from './costCalculator';
import { CSVParser } from './utils/csvParser';
import {
  AnalysisResponse,
  ColumnAnalysis,
  CostEstimateRequest,
  CostEstimateResponse,
  PIIResult,
  CostInfo,
  AnalyzeColumnRequest,
  APIError
} from './types';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

const app = express();
const port = parseInt(process.env.PORT || '8000', 10);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration for React frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins for development
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Initialize PII detector
const piiDetector = new PIIDetector();

// Error handling middleware
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({ message: 'PII Detection API is running' });
});

/**
 * Detailed health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'PII Detection Backend (Node.js)'
  });
});

/**
 * Test model endpoint
 */
app.get('/test-model', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const testCsvData = {
      'test_email': ['john@email.com']
    };
    
    const response = await piiDetector.analyzeCsv(testCsvData);
    
    res.json({
      success: true,
      response: response[0],
      message: 'Model test completed successfully'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}));

/**
 * Estimate cost endpoint
 */
app.post('/estimate-cost', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { column_count, avg_samples_per_column = 5, avg_sample_length = 20 } = req.body;

  if (!column_count || column_count <= 0) {
    return res.status(400).json({
      error: 'Invalid column count. Must be a positive number.'
    });
  }

  try {
    const estimatedCostData = CostCalculator.estimateCsvAnalysisCost(
      column_count,
      avg_samples_per_column,
      avg_sample_length
    );

    const response = {
      estimated_cost: estimatedCostData
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: `Error estimating cost: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}));

/**
 * Analyze CSV endpoint
 */
app.post('/analyze-csv', upload.single('file'), asyncHandler(async (req: express.Request, res: express.Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file provided' });
  }

  if (!req.file.originalname.endsWith('.csv')) {
    return res.status(400).json({ error: 'Only CSV files are supported' });
  }

  try {
    // Validate CSV
    const validation = CSVParser.validateCSV(req.file.buffer);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Parse CSV file
    const csvData = await CSVParser.parseCSV(req.file.buffer);

    // Analyze the CSV for PII
    const analysisResults = await piiDetector.analyzeCsv(csvData);

    const results: ColumnAnalysis[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCostUsd = 0.0;

    for (const result of analysisResults) {
      const costInfo = result.costInfo;

      totalInputTokens += costInfo.inputTokens;
      totalOutputTokens += costInfo.outputTokens;
      totalCostUsd += costInfo.totalCostUsd;

      results.push({
        column_name: result.column,
        sample_values: result.samples,
        is_pii: result.classification !== 'NO_PII',
        confidence: result.confidence,
        reasoning: result.reasoning,
        cost_info: costInfo
      });
    }

    const totalCostInfo = {
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      total_tokens: totalInputTokens + totalOutputTokens,
      input_cost_usd: Math.round((totalInputTokens / 1000) * 0.0008 * 1000000) / 1000000,
      output_cost_usd: Math.round((totalOutputTokens / 1000) * 0.0016 * 1000000) / 1000000,
      total_cost_usd: Math.round(totalCostUsd * 1000000) / 1000000
    };

    const response = {
      columns: results,
      total_cost_info: totalCostInfo
    };

    res.json(response);

  } catch (error) {
    res.status(500).json({
      error: `Error processing CSV: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}));

/**
 * Analyze single column endpoint
 */
app.post('/analyze-column', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { columnName, sampleValues }: AnalyzeColumnRequest = req.body;

  if (!columnName || !sampleValues || !Array.isArray(sampleValues)) {
    return res.status(400).json({
      error: 'Invalid request. columnName and sampleValues array are required.'
    });
  }

  try {
    // Create a simple CSV data structure for the single column
    const csvData = { [columnName]: sampleValues };
    const analysisResults = await piiDetector.analyzeCsv(csvData);

    if (analysisResults.length > 0) {
      const result = analysisResults[0];
      const response = {
        is_pii: result.classification !== 'NO_PII',
        confidence: result.confidence,
        reasoning: result.reasoning,
        cost_info: result.costInfo
      };

      res.json(response);
    } else {
      const response = {
        is_pii: false,
        confidence: 0.0,
        reasoning: 'No analysis results',
        cost_info: null
      };

      res.json(response);
    }
  } catch (error) {
    res.status(500).json({
      error: `Error analyzing column: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}));

// Global error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  const apiError: APIError = {
    message: error.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  };

  res.status(500).json({ error: apiError.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 PII Detection API (Node.js) running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔍 API docs: http://localhost:${port}/`);
});

export default app;