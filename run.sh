#!/bin/bash

echo "🚀 Starting PII Detection App..."

# Kill existing processes first
echo "🛑 Stopping any existing servers..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo "📡 Starting backend..."
cd /Users/Josh/Documents/coleridgeFiles/aws_bedrock/PII_detection/backend
source venv/bin/activate
export AWS_PROFILE=work
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

sleep 3

# Start frontend server
echo "🎨 Starting frontend..."
cd /Users/Josh/Documents/coleridgeFiles/aws_bedrock/PII_detection/frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!

sleep 2

echo ""
echo "✅ READY!"
echo "📡 Backend: http://localhost:8001"
echo "🎨 Frontend: http://localhost:3000/simple_frontend.html"
echo ""
echo "Open http://localhost:3000/simple_frontend.html in your browser"
echo ""
echo "Press Ctrl+C to stop"

wait $BACKEND_PID $FRONTEND_PID