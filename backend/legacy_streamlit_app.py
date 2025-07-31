import boto3
import pandas as pd
import streamlit as st
import os
from langchain.chains import LLMChain
from langchain.prompts.prompt import PromptTemplate
from langchain_community.llms import Bedrock

# Set Streamlit page config
st.set_page_config(page_title="PII Scanner", page_icon="🔐")
st.title("🔐 CSV PII Scanner")

# Upload CSV
uploaded_file = st.file_uploader("Upload a CSV file to scan for PII", type=["csv"])
if uploaded_file:
    df = pd.read_csv(uploaded_file)
    st.write("Sample of uploaded file:")
    st.dataframe(df.head())

    # Configure Bedrock LLM
    @st.cache_resource
    def config_llm():
        try:
            # Configure session for work AWS account
            # Try environment variables first (for manual credentials)
            aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            aws_session_token = os.getenv('AWS_SESSION_TOKEN')
            
            if aws_access_key and aws_secret_key:
                # Use explicit credentials
                session = boto3.Session(
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key,
                    aws_session_token=aws_session_token
                )
            else:
                # Try profile if specified
                aws_profile = os.getenv('AWS_PROFILE')
                if aws_profile:
                    session = boto3.Session(profile_name=aws_profile)
                else:
                    # Default credential chain
                    session = boto3.Session()
            
            # Use specific region if specified
            aws_region = os.getenv('AWS_REGION', 'us-east-1')
            
            client = session.client("bedrock-runtime", region_name=aws_region)
            model_id = "anthropic.claude-instant-v1"
            llm = Bedrock(model_id=model_id, client=client)
            llm.model_kwargs = {
                "max_tokens_to_sample": 256,
                "temperature": 0.1,
                "top_p": 1
            }
            return llm
        except Exception as e:
            st.error(f"AWS Authentication Error: {str(e)}")
            st.info("Please ensure you have valid AWS credentials configured.")
            return None

    llm = config_llm()
    
    if llm is None:
        st.stop()

    # Prompt template
    pii_prompt = PromptTemplate(
        input_variables=["column_name", "sample_values"],
        template="""
You are a data privacy analyst. Determine if the column "{column_name}" from a CSV file contains personally identifiable information (PII). Here are some sample values:

{sample_values}

Only reply "PII" if this column contains PII like names, SSNs, emails, phone numbers, etc. Otherwise reply "Not PII".
"""
    )

    pii_chain = LLMChain(llm=llm, prompt=pii_prompt)

    # Scan columns
    st.subheader("🔎 PII Detection Results")
    pii_results = []
    for col in df.columns:
        sample_vals = df[col].dropna().astype(str).sample(min(5, len(df))).tolist()
        sample_str = "\n".join(sample_vals)

        # Safely invoke the chain and handle various output formats
        response = pii_chain.invoke({
            "column_name": col,
            "sample_values": sample_str
        })

        # Get the output key from the LLMChain (commonly 'text')
        result_text = response.get("text", response.get("output", "No result"))
        pii_results.append((col, result_text.strip()))

    # Display results
    for col, result in pii_results:
        st.write(f"**{col}**: {result}")