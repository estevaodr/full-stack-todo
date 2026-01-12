# JWT Token Testing Guide with curl

This guide demonstrates how to test JWT token creation and usage using curl commands.

## Prerequisites

1. Server must be running on `http://localhost:3000`
2. `curl` installed on your system
3. `jq` installed (optional, for pretty JSON output)

## Step-by-Step Guide

### Step 1: Start the Server

```bash
cd /home/estevao/src/brenz/full-stack-todo
npx nx serve server
```

The server will start on `http://localhost:3000`

### Step 2: Create a New User

Create a user account (this endpoint is public and doesn't require authentication):

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestP@ssw0rd123!"
  }'
```

**Expected Response:**
```json
{
  "id": "9fe5c910-dbf3-4fa3-92d3-0e7d12b8a1b4",
  "email": "testuser@example.com",
  "todos": []
}
```

**Note:** Save the `id` value - you'll need it later!

### Step 3: Login to Get JWT Token

Login with the credentials you just created (this endpoint is also public):

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestP@ssw0rd123!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwic3ViIjoiOWZlNWM5MTAtZGJmMy00ZmEzLTkyZDMtMGU3ZDEyYjhhMWI0IiwiaWF0IjoxNzY4MjU0NzYwLCJleHAiOjE3NjgyNTUzNjB9.j2hG1M5Iel4N9aPv7nwXY0prjRwJgRw7yszBLiTKSZg"
}
```

**Important:** Copy the `access_token` value - this is your JWT token!

### Step 4: Test Protected Endpoint WITHOUT Token (Should Fail)

Try to access a protected endpoint without providing the token:

```bash
curl -X GET http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

This confirms that protected endpoints require authentication.

### Step 5: Test Protected Endpoint WITH Token (Should Succeed)

Now use the token you received in Step 3. Replace `YOUR_TOKEN_HERE` with the actual token:

```bash
TOKEN="YOUR_TOKEN_HERE"

curl -X GET http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[]
```

An empty array is expected if you haven't created any todos yet.

### Step 6: Get User Information with Token

Retrieve your user information using the token. Replace `USER_ID` with the ID from Step 2:

```bash
TOKEN="YOUR_TOKEN_HERE"
USER_ID="YOUR_USER_ID_HERE"

curl -X GET http://localhost:3000/api/v1/users/$USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "id": "9fe5c910-dbf3-4fa3-92d3-0e7d12b8a1b4",
  "email": "testuser@example.com",
  "todos": []
}
```

### Step 7: Create a Todo with Token

Create a new todo item using your JWT token:

```bash
TOKEN="YOUR_TOKEN_HERE"

curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Todo from curl",
    "description": "This todo was created using curl with JWT authentication"
  }'
```

**Expected Response:**
```json
{
  "id": "b471a97b-ed09-4c6a-b5b9-e5e99c0ba0d2",
  "title": "Test Todo from curl",
  "description": "This todo was created using curl with JWT authentication",
  "completed": false,
  "user_id": "9fe5c910-dbf3-4fa3-92d3-0e7d12b8a1b4"
}
```

### Step 8: Verify User Isolation

Try to access another user's data (should fail with 404):

```bash
TOKEN="YOUR_TOKEN_HERE"
OTHER_USER_ID="00000000-0000-0000-0000-000000000000"  # Non-existent or different user ID

curl -X GET http://localhost:3000/api/v1/users/$OTHER_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "message": "User could not be found!",
  "statusCode": 404
}
```

This confirms that users can only access their own data.

## Complete Example Script

Here's a complete bash script that automates all the steps:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "=== Step 1: Create User ==="
USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestP@ssw0rd123!"
  }')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "User ID: $USER_ID"
echo ""

echo "=== Step 2: Login ==="
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestP@ssw0rd123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token: $TOKEN"
echo ""

echo "=== Step 3: Test Protected Endpoint (should fail without token) ==="
curl -s -X GET $BASE_URL/todos \
  -H "Content-Type: application/json" | jq .
echo ""

echo "=== Step 4: Test Protected Endpoint (should succeed with token) ==="
curl -s -X GET $BASE_URL/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== Step 5: Get User Info ==="
curl -s -X GET $BASE_URL/users/$USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== Step 6: Create Todo ==="
curl -s -X POST $BASE_URL/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Todo",
    "description": "Created via curl"
  }' | jq .
```

## Key Points

1. **Public Endpoints** (no token required):
   - `POST /api/v1/users` - Create user
   - `POST /api/v1/auth/login` - Login

2. **Protected Endpoints** (token required):
   - `GET /api/v1/todos` - Get all todos
   - `GET /api/v1/todos/:id` - Get specific todo
   - `POST /api/v1/todos` - Create todo
   - `PATCH /api/v1/todos/:id` - Update todo
   - `DELETE /api/v1/todos/:id` - Delete todo
   - `GET /api/v1/users/:id` - Get user info

3. **Token Format**: Always use `Authorization: Bearer <token>` header

4. **Token Expiration**: Tokens expire after 10 minutes (600 seconds) by default

5. **User Isolation**: Users can only access their own data - attempting to access another user's data returns 404

## Troubleshooting

- **401 Unauthorized**: Token is missing, invalid, or expired
- **404 Not Found**: Trying to access another user's data or resource doesn't exist
- **400 Bad Request**: Validation error (check request body format)
- **500 Internal Server Error**: Server error (check server logs)

## Testing Invalid Scenarios

### Test with Invalid Token
```bash
curl -X GET http://localhost:3000/api/v1/todos \
  -H "Authorization: Bearer invalid_token_here"
```
Expected: 401 Unauthorized

### Test with Wrong Password
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword"
  }'
```
Expected: 401 Unauthorized with message "Email or password is invalid"

### Test with Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Missing description"
  }'
```
Expected: 400 Bad Request with validation errors
