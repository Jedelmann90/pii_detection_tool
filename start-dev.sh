#!/bin/bash

# Start Development Environment with Complete Volume Mapping
# This allows you to edit code locally and see changes instantly in containers

echo "🚀 Starting PII Detection Development Environment..."
echo ""

# Stop any running containers first
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.dev.yml down

# Start the development environment
echo "📡 Starting backend and frontend with volume mapping..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait a moment for containers to start
sleep 5

# Show status
echo ""
echo "✅ Development environment started!"
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "🎨 Frontend UI: http://localhost:3000"
echo ""
echo "💡 Volume Mapping Active:"
echo "   - Edit code in ./backend/src/ → Backend container updates automatically"
echo "   - Edit code in ./frontend/src/ → Frontend container updates automatically"
echo ""
echo "📝 To view logs:"
echo "   Backend: docker logs pii-backend-dev -f"
echo "   Frontend: docker logs pii-frontend-dev -f"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"