#!/usr/bin/env python3

print("Testing imports...")

try:
    import fastapi
    print("✓ FastAPI imported successfully")
except ImportError as e:
    print(f"✗ FastAPI import failed: {e}")

try:
    import pandas
    print("✓ Pandas imported successfully")
except ImportError as e:
    print(f"✗ Pandas import failed: {e}")

try:
    import boto3
    print("✓ Boto3 imported successfully")
except ImportError as e:
    print(f"✗ Boto3 import failed: {e}")

try:
    import langchain
    print("✓ LangChain imported successfully")
except ImportError as e:
    print(f"✗ LangChain import failed: {e}")

try:
    from app.main import app
    print("✓ FastAPI app imported successfully")
except ImportError as e:
    print(f"✗ App import failed: {e}")

print("Import test complete!")