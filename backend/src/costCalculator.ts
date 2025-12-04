// Cost calculator equivalent to Python cost_calculator.py

import { CostInfo } from './types';

export class CostCalculator {
  // AWS Bedrock Titan Text Express v1 pricing (as of 2025)
  private static readonly INPUT_TOKEN_COST_PER_1K = 0.0008; // $0.0008 per 1K input tokens
  private static readonly OUTPUT_TOKEN_COST_PER_1K = 0.0016; // $0.0016 per 1K output tokens

  /**
   * Estimate token count for text.
   * Uses a simple heuristic: ~4.7 characters per token for English text.
   * This is an approximation since we don't have access to Titan's exact tokenizer.
   */
  public static estimateTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }

    // Remove extra whitespace and normalize
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    // Estimate tokens using character count / 4.7 (AWS's stated average)
    const estimatedTokens = cleanedText.length / 4.7;

    // Round up to be conservative with cost estimates
    return Math.max(1, Math.floor(estimatedTokens) + 1);
  }

  /**
   * Calculate costs based on token counts
   */
  public static calculateCost(inputTokens: number, outputTokens: number): CostInfo {
    const inputCost = (inputTokens / 1000) * CostCalculator.INPUT_TOKEN_COST_PER_1K;
    const outputCost = (outputTokens / 1000) * CostCalculator.OUTPUT_TOKEN_COST_PER_1K;
    const totalCost = inputCost + outputCost;

    return {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      input_cost_usd: Math.round(inputCost * 1000000) / 1000000, // Round to 6 decimal places
      output_cost_usd: Math.round(outputCost * 1000000) / 1000000,
      total_cost_usd: Math.round(totalCost * 1000000) / 1000000
    };
  }

  /**
   * Estimate cost for analyzing a CSV file
   */
  public static estimateCsvAnalysisCost(
    columnCount: number,
    avgSamplesPerColumn: number = 5,
    avgSampleLength: number = 20
  ): CostInfo {
    // Base prompt template length (approximately)
    const basePromptChars = 200; // The template prompt text

    let totalInputTokens = 0;
    let estimatedOutputTokens = 0;

    for (let i = 0; i < columnCount; i++) {
      // Input: base prompt + column name (avg 15 chars) + sample values
      const columnInputChars = basePromptChars + 15 + (avgSamplesPerColumn * avgSampleLength);
      const columnInputTokens = CostCalculator.estimateTokens('x'.repeat(columnInputChars));
      totalInputTokens += columnInputTokens;

      // Output: estimated response length (avg 50 characters)
      const columnOutputTokens = CostCalculator.estimateTokens('x'.repeat(50));
      estimatedOutputTokens += columnOutputTokens;
    }

    return CostCalculator.calculateCost(totalInputTokens, estimatedOutputTokens);
  }

  /**
   * Format cost data for display
   */
  public static formatCostDisplay(costData: CostInfo): string {
    return `$${costData.totalCostUsd.toFixed(4)} (${costData.totalTokens} tokens)`;
  }
}