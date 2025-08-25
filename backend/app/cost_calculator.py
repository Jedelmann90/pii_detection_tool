import re
from typing import Dict, List

class CostCalculator:
    """Calculate costs for AWS Bedrock Titan Text Express v1 model"""
    
    # AWS Bedrock Titan Text Express v1 pricing (as of 2025)
    INPUT_TOKEN_COST_PER_1K = 0.0008  # $0.0008 per 1K input tokens
    OUTPUT_TOKEN_COST_PER_1K = 0.0016  # $0.0016 per 1K output tokens
    
    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Estimate token count for text.
        Uses a simple heuristic: ~4.7 characters per token for English text.
        This is an approximation since we don't have access to Titan's exact tokenizer.
        """
        if not text:
            return 0
        
        # Remove extra whitespace and normalize
        cleaned_text = re.sub(r'\s+', ' ', text.strip())
        
        # Estimate tokens using character count / 4.7 (AWS's stated average)
        estimated_tokens = len(cleaned_text) / 4.7
        
        # Round up to be conservative with cost estimates
        return max(1, int(estimated_tokens) + 1)
    
    @staticmethod
    def calculate_cost(input_tokens: int, output_tokens: int) -> Dict[str, float]:
        """Calculate costs based on token counts"""
        input_cost = (input_tokens / 1000) * CostCalculator.INPUT_TOKEN_COST_PER_1K
        output_cost = (output_tokens / 1000) * CostCalculator.OUTPUT_TOKEN_COST_PER_1K
        total_cost = input_cost + output_cost
        
        return {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'total_tokens': input_tokens + output_tokens,
            'input_cost_usd': round(input_cost, 6),
            'output_cost_usd': round(output_cost, 6),
            'total_cost_usd': round(total_cost, 6)
        }
    
    @staticmethod
    def estimate_csv_analysis_cost(column_count: int, avg_samples_per_column: int = 5, 
                                 avg_sample_length: int = 20) -> Dict[str, float]:
        """
        Estimate cost for analyzing a CSV file
        
        Args:
            column_count: Number of columns in CSV
            avg_samples_per_column: Average number of sample values per column
            avg_sample_length: Average length of sample values in characters
        """
        # Base prompt template length (approximately)
        base_prompt_chars = 200  # The template prompt text
        
        total_input_tokens = 0
        estimated_output_tokens = 0
        
        for _ in range(column_count):
            # Input: base prompt + column name (avg 15 chars) + sample values
            column_input_chars = base_prompt_chars + 15 + (avg_samples_per_column * avg_sample_length)
            column_input_tokens = CostCalculator.estimate_tokens(str('x' * column_input_chars))
            total_input_tokens += column_input_tokens
            
            # Output: estimated response length (avg 50 characters)
            column_output_tokens = CostCalculator.estimate_tokens('x' * 50)
            estimated_output_tokens += column_output_tokens
        
        return CostCalculator.calculate_cost(total_input_tokens, estimated_output_tokens)
    
    @staticmethod
    def format_cost_display(cost_data: Dict[str, float]) -> str:
        """Format cost data for display"""
        return f"${cost_data['total_cost_usd']:.4f} ({cost_data['total_tokens']} tokens)"