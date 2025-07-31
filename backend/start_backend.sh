#!/bin/bash

echo "Starting PII Detection Backend..."

# Activate virtual environment
source venv/bin/activate

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Test imports
echo "Testing imports..."
python test_imports.py

# Start the server
echo "Starting FastAPI server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000