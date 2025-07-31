#!/bin/bash

echo "🔍 Checking server status..."
echo ""

# Check backend
echo "📡 Backend (Port 8000):"
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend is running at http://localhost:8000"
    curl -s http://localhost:8000/health | jq .
else
    echo "   ❌ Backend is not responding"
fi

echo ""

# Check frontend
echo "🎨 Frontend (Port 3000):"
if curl -s -I http://localhost:3000/ | head -1 | grep -q "200"; then
    echo "   ✅ Frontend is running at http://localhost:3000"
else
    echo "   ❌ Frontend is not responding"
fi

echo ""
echo "🚀 Access your PII Detection Tool at: http://localhost:3000"