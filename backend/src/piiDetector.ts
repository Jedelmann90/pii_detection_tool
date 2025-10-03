// PII Detector equivalent to Python pii_detector.py

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { fromEnv, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AWSConfigManager } from './utils/awsConfig';
import { CostCalculator } from './costCalculator';
import { PIIClassificationResult, PIIType, CostInfo, BedrockModelConfig } from './types';

export class PIIDetector {
  private client: BedrockRuntimeClient;
  private modelConfig: BedrockModelConfig;

  constructor() {
    const awsConfig = AWSConfigManager.getConfig();
    
    if (!AWSConfigManager.validateConfig(awsConfig)) {
      throw new Error('Invalid AWS configuration. Please check your credentials.');
    }

    // Configure AWS SDK client
    const clientConfig: any = {
      region: awsConfig.region
    };

    if (awsConfig.useProfile) {
      // Use profile or default credential chain
      clientConfig.credentials = fromNodeProviderChain({
        profile: awsConfig.profile
      });
    } else {
      // Use explicit credentials
      clientConfig.credentials = fromEnv();
    }

    this.client = new BedrockRuntimeClient(clientConfig);
    
    this.modelConfig = {
      modelId: 'amazon.titan-text-express-v1',
      maxTokenCount: 1000,
      temperature: 0.1,
      topP: 0.9
    };
  }

  /**
   * Call Titan model directly via AWS Bedrock and return response with cost info
   */
  private async callTitanModel(prompt: string): Promise<[string, CostInfo]> {
    try {
      // Calculate input tokens
      const inputTokens = CostCalculator.estimateTokens(prompt);

      const command = new InvokeModelCommand({
        modelId: this.modelConfig.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: prompt,
          textGenerationConfig: {
            maxTokenCount: this.modelConfig.maxTokenCount,
            temperature: this.modelConfig.temperature,
            topP: this.modelConfig.topP
          }
        })
      });

      const response = await this.client.send(command);
      
      if (!response.body) {
        throw new Error('No response body from Bedrock');
      }

      // Parse response
      const responseData = JSON.parse(new TextDecoder().decode(response.body));
      const outputText = responseData.results?.[0]?.outputText?.trim() || '';

      // Calculate output tokens
      const outputTokens = CostCalculator.estimateTokens(outputText);

      // Calculate cost
      const costInfo = CostCalculator.calculateCost(inputTokens, outputTokens);

      return [outputText, costInfo];
    } catch (error) {
      throw new Error(`Error calling Titan model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze CSV data for PII content
   */
  public async analyzeCsv(
    csvData: Record<string, any[]>,
    maxSamples: number = 5
  ): Promise<PIIClassificationResult[]> {
    const results: PIIClassificationResult[] = [];
    const columns = Object.keys(csvData);

    for (const column of columns) {
      // Get sample values (non-null, unique) and convert to strings
      const columnData = csvData[column] || [];
      const sampleValues = Array.from(new Set(
        columnData
          .filter(val => val !== null && val !== undefined && val !== '')
          .map(val => String(val))
      )).slice(0, maxSamples);

      if (sampleValues.length === 0) {
        results.push({
          column,
          classification: 'NO_DATA',
          confidence: 0.0,
          reasoning: 'Column contains no data',
          samples: [],
          costInfo: {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            inputCostUsd: 0.0,
            outputCostUsd: 0.0,
            totalCostUsd: 0.0
          }
        });
        continue;
      }

      try {
        // Create prompt for PII detection - simplified for Titan
        const prompt = `Analyze this data for PII (Personally Identifiable Information):

Column: ${column}
Values: ${JSON.stringify(sampleValues)}

Is this PII? What type?
- SSN (Social Security Numbers)
- EMAIL (Email addresses)  
- PHONE (Phone numbers)
- ADDRESS (Physical addresses)
- DOB (Date of Birth)
- NAME (Personal names)
- HASHED_PII (Hashed/encrypted PII)
- NO_PII (Not PII)

Answer with just the category (like "EMAIL" or "NO_PII") and a brief reason.`;

        // Call Titan model directly
        const [response, costInfo] = await this.callTitanModel(prompt);

        // Parse Titan's text response and extract PII classification
        const { classification, confidence } = this.parseClassificationResponse(response);

        results.push({
          column,
          classification,
          confidence,
          reasoning: response.trim(),
          samples: sampleValues,
          costInfo
        });

      } catch (error) {
        results.push({
          column,
          classification: 'ERROR',
          confidence: 0.0,
          reasoning: `Error analyzing column: ${error instanceof Error ? error.message : String(error)}`,
          samples: sampleValues,
          costInfo: {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            inputCostUsd: 0.0,
            outputCostUsd: 0.0,
            totalCostUsd: 0.0
          }
        });
      }
    }

    return results;
  }

  /**
   * Parse classification response from Titan model
   */
  private parseClassificationResponse(response: string): { classification: PIIType; confidence: number } {
    const responseUpper = response.toUpperCase();
    let classification: PIIType = 'UNKNOWN';
    let confidence = 0.5; // Default confidence

    // Check for NO_PII first to avoid false positives from examples in text
    if (
      responseUpper.includes('NO_PII') ||
      responseUpper.includes('NOT PII') ||
      responseUpper.includes('NO PII') ||
      responseUpper.includes('NOT CONSIDERED PII') ||
      responseUpper.includes('IS NOT CONSIDERED PII')
    ) {
      classification = 'NO_PII';
      confidence = 0.8;
    }
    // Check for PII types in the response
    else if (responseUpper.includes('EMAIL')) {
      classification = 'EMAIL';
      confidence = 0.9;
    } else if (responseUpper.includes('SSN') || responseUpper.includes('SOCIAL SECURITY')) {
      classification = 'SSN';
      confidence = 0.95;
    } else if (responseUpper.includes('PHONE')) {
      classification = 'PHONE';
      confidence = 0.85;
    } else if (responseUpper.includes('ADDRESS')) {
      classification = 'ADDRESS';
      confidence = 0.8;
    } else if (responseUpper.includes('DOB') || responseUpper.includes('DATE OF BIRTH')) {
      classification = 'DOB';
      confidence = 0.75;
    } else if (responseUpper.includes('NAME')) {
      classification = 'NAME';
      confidence = 0.8;
    } else if (responseUpper.includes('HASHED')) {
      classification = 'HASHED_PII';
      confidence = 0.7;
    }

    return { classification, confidence };
  }
}