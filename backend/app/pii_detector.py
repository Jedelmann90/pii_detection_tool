import os
import boto3
import pandas as pd
import json
from typing import List, Dict, Any
from dotenv import load_dotenv
from .cost_calculator import CostCalculator

load_dotenv()

class PIIDetector:
    def __init__(self):
        # Check if we should use AWS profile or explicit credentials
        use_profile = os.getenv('USE_AWS_PROFILE', 'false').lower() == 'true'
        
        if use_profile:
            # Use AWS profile (existing behavior)
            aws_profile = os.getenv('AWS_PROFILE')
            if aws_profile:
                self.session = boto3.Session(profile_name=aws_profile)
            else:
                self.session = boto3.Session()
        else:
            # Use explicit credentials from .env
            aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            
            if aws_access_key and aws_secret_key:
                self.session = boto3.Session(
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key
                )
            else:
                # Fallback to default credential chain
                self.session = boto3.Session()
        
        self.bedrock_client = self.session.client(
            service_name='bedrock-runtime',
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.model_id = 'amazon.titan-text-express-v1'
    
    def _call_titan_model(self, prompt: str) -> tuple[str, Dict[str, float]]:
        """Call Titan model directly via boto3 and return response with cost info"""
        try:
            # Calculate input tokens
            input_tokens = CostCalculator.estimate_tokens(prompt)
            
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                contentType='application/json',
                accept='application/json',
                body=json.dumps({
                    'inputText': prompt,
                    'textGenerationConfig': {
                        'maxTokenCount': 1000,
                        'temperature': 0.1,
                        'topP': 0.9
                    }
                })
            )
            
            result = json.loads(response['body'].read())
            output_text = result['results'][0]['outputText'].strip()
            
            # Calculate output tokens
            output_tokens = CostCalculator.estimate_tokens(output_text)
            
            # Calculate cost
            cost_info = CostCalculator.calculate_cost(input_tokens, output_tokens)
            
            return output_text, cost_info
        except Exception as e:
            raise Exception(f"Error calling Titan model: {str(e)}")
    
    def analyze_csv(self, df: pd.DataFrame, max_samples: int = 5) -> List[Dict[str, Any]]:
        """
        Analyze a CSV DataFrame for PII content
        
        Args:
            df: pandas DataFrame to analyze
            max_samples: Maximum number of sample values per column
            
        Returns:
            List of dictionaries containing PII analysis results
        """
        results = []
        
        for column in df.columns:
            # Get sample values (non-null, unique) and convert to strings
            sample_values = [str(val) for val in df[column].dropna().unique()[:max_samples].tolist()]
            
            if not sample_values:
                results.append({
                    'column': column,
                    'classification': 'NO_DATA',
                    'confidence': 0.0,
                    'reasoning': 'Column contains no data',
                    'samples': [],
                    'cost_info': {'input_tokens': 0, 'output_tokens': 0, 'total_tokens': 0, 
                                 'input_cost_usd': 0.0, 'output_cost_usd': 0.0, 'total_cost_usd': 0.0}
                })
                continue
            
            try:
                # Create prompt for PII detection - simplified for Titan
                prompt = f"""Analyze this data for PII (Personally Identifiable Information):

Column: {column}
Values: {sample_values}

Is this PII? What type?
- SSN (Social Security Numbers)
- EMAIL (Email addresses)  
- PHONE (Phone numbers)
- ADDRESS (Physical addresses)
- DOB (Date of Birth)
- NAME (Personal names)
- HASHED_PII (Hashed/encrypted PII)
- NO_PII (Not PII)

Answer with just the category (like "EMAIL" or "NO_PII") and a brief reason."""

                # Call Titan model directly
                response, cost_info = self._call_titan_model(prompt)
                
                # Parse Titan's text response and extract PII classification
                response_upper = response.upper()
                classification = 'UNKNOWN'
                confidence = 0.5  # Default confidence
                
                # Check for NO_PII first to avoid false positives from examples in text
                if ('NO_PII' in response_upper or 'NOT PII' in response_upper or 'NO PII' in response_upper or 
                    'NOT CONSIDERED PII' in response_upper or 'IS NOT CONSIDERED PII' in response_upper):
                    classification = 'NO_PII'
                    confidence = 0.8
                # Check for PII types in the response
                elif 'EMAIL' in response_upper:
                    classification = 'EMAIL'
                    confidence = 0.9
                elif 'SSN' in response_upper or 'SOCIAL SECURITY' in response_upper:
                    classification = 'SSN'
                    confidence = 0.95
                elif 'PHONE' in response_upper:
                    classification = 'PHONE'
                    confidence = 0.85
                elif 'ADDRESS' in response_upper:
                    classification = 'ADDRESS'
                    confidence = 0.8
                elif 'DOB' in response_upper or 'DATE OF BIRTH' in response_upper:
                    classification = 'DOB'
                    confidence = 0.75
                elif 'NAME' in response_upper:
                    classification = 'NAME'
                    confidence = 0.8
                elif 'HASHED' in response_upper:
                    classification = 'HASHED_PII'
                    confidence = 0.7
                
                results.append({
                    'column': column,
                    'classification': classification,
                    'confidence': confidence,
                    'reasoning': response.strip(),
                    'samples': sample_values,
                    'cost_info': cost_info
                })
                    
            except Exception as e:
                results.append({
                    'column': column,
                    'classification': 'ERROR',
                    'confidence': 0.0,
                    'reasoning': f'Error analyzing column: {str(e)}',
                    'samples': sample_values,
                    'cost_info': {'input_tokens': 0, 'output_tokens': 0, 'total_tokens': 0, 
                                 'input_cost_usd': 0.0, 'output_cost_usd': 0.0, 'total_cost_usd': 0.0}
                })
        
        return results