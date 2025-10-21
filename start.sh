#!/bin/bash

echo "==============================================="
echo " CryptoBeekeeper Honeypot System - Startup"
echo "==============================================="
echo

# Check if MongoDB is running
echo "[1/4] Checking MongoDB..."
if pgrep -x mongod > /dev/null; then
    echo "   ✓ MongoDB is running"
else
    echo "   ✗ WARNING: MongoDB is not running!"
    echo "   Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    exit 1
fi

echo
echo "[2/4] Starting Backend..."
cd backend

# Activate virtual environment and start backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!

sleep 3

echo
echo "[3/4] Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

sleep 5

echo
echo "[4/4] Opening Browser..."
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
fi

echo
echo "==============================================="
echo " CryptoBeekeeper is now running!"
echo "==============================================="
echo " Backend:  http://localhost:5000"
echo " Frontend: http://localhost:3000"
echo "==============================================="
echo
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
