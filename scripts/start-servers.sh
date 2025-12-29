#!/bin/bash
# Script to start both server and client for E2E tests
# This ensures both services are running before tests begin

# Start server in background
npx nx serve server &
SERVER_PID=$!

# Start client in background  
npx nx serve client &
CLIENT_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
timeout=60
elapsed=0
while ! curl -s http://localhost:3000/api > /dev/null 2>&1; do
  if [ $elapsed -ge $timeout ]; then
    echo "Server failed to start within $timeout seconds"
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 1
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

# Wait for client to be ready
echo "Waiting for client to start..."
elapsed=0
while ! curl -s http://localhost:4200 > /dev/null 2>&1; do
  if [ $elapsed -ge $timeout ]; then
    echo "Client failed to start within $timeout seconds"
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 1
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

echo "Both servers are ready!"
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"

# Keep script running
wait

