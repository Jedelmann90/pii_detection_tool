#!/bin/bash

echo "🚀 Starting PII Detection App..."

# Kill existing processes first
echo "🛑 Stopping any existing servers..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend (Node.js)
echo "📡 Starting Node.js backend..."
cd /Users/Josh/Documents/coleridgeFiles/aws_bedrock/PII_detection/backend
npm run dev &
BACKEND_PID=$!

sleep 3

# Start frontend server
echo "🎨 Starting frontend..."
cd /Users/Josh/Documents/coleridgeFiles/aws_bedrock/PII_detection/frontend
npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo "✅ READY!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop"

wait $BACKEND_PID $FRONTEND_PID