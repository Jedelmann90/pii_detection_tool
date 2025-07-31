#!/bin/bash

echo "🚀 Starting PII Detection Application..."

# Kill any existing servers
echo "Stopping existing servers..."
pkill -f "uvicorn app.main:app"
pkill -f "next dev"

sleep 2

# Start backend
echo "📡 Starting backend server..."
cd backend
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "✅ Both servers are starting up..."
echo "📡 Backend API: http://localhost:8001"  
echo "🎨 Frontend UI: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID