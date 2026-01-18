# Manual Authentication Testing Guide

This guide walks through manual testing of the authentication system in the Angular client.

## Prerequisites

1. Server must be running on `http://localhost:3000`
2. Client must be running on `http://localhost:4200`
3. Browser with Developer Tools (Chrome/Firefox recommended)

## Setup

### Step 1: Start the Server

```bash
# In terminal 1
make server
# or
npx nx serve server
```

Wait for: `Nest application successfully started`

### Step 2: Start the Client

```bash
# In terminal 2
make client
# or
npx nx serve client
```

Wait for: `Compiled successfully` and the URL `http://localhost:4200`

### Step 3: Clear Previous Data (Optional)

If you want a fresh start:

```bash
# Delete the database
rm tmp/db.sqlite

# The database will be recreated automatically on first server request
```

## Test Cases

### Test 1: Registration Flow

**Objective**: Verify new users can register successfully

1. Open browser to `http://localhost:4200`
2. Look for "Register" link in the navigation
3. Click "Register" link
4. Verify you're at `/register` URL
5. Fill in the registration form:
   - **Email**: `testuser@example.com`
   - **Password**: `TestP@ssw0rd123!`
   - **Confirm Password**: `TestP@ssw0rd123!`
6. Click "Register" button
7. **Expected Result**: 
   - Form submits successfully
   - Redirected to login page (`/login`)
   - OR redirected to dashboard if auto-login is implemented
   
**Validation Tests**:
- Try submitting with empty fields → Should show validation errors
- Try mismatched passwords → Should show "Passwords do not match" error
- Try invalid email format → Should show email validation error
- Try weak password → Should show password strength requirements

### Test 2: Login Flow

**Objective**: Verify users can log in with valid credentials

1. Navigate to `http://localhost:4200/login`
2. Fill in the login form:
   - **Email**: `testuser@example.com`
   - **Password**: `TestP@ssw0rd123!`
3. Click "Login" button
4. **Expected Result**:
   - Form submits successfully
   - Redirected to dashboard (`/dashboard`)
   - Header shows user email/greeting
   - Logout button is visible

**Validation Tests**:
- Try wrong password → Should show "Invalid credentials" error
- Try non-existent email → Should show error
- Try empty fields → Should show validation errors

### Test 3: JWT Storage in localStorage

**Objective**: Verify JWT token is stored correctly

1. After successful login (Test 2)
2. Open Browser Developer Tools (F12)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Under **Local Storage**, select `http://localhost:4200`
5. **Expected Result**:
   - Look for key: `fst-token-storage`
   - Value should be a JWT token (format: `eyJhbGc...`)
   
**Additional Checks**:
- Copy the token value
- Go to https://jwt.io
- Paste the token in the "Encoded" section
- **Expected Decoded Payload**:
  ```json
  {
    "email": "testuser@example.com",
    "sub": "<user-id>",
    "iat": <timestamp>,
    "exp": <timestamp>
  }
  ```

### Test 4: Protected Route Access (Authenticated)

**Objective**: Verify authenticated users can access protected routes

1. Ensure you're logged in (see Test 2)
2. Navigate to `http://localhost:4200/dashboard`
3. **Expected Result**:
   - Dashboard page loads successfully
   - Can see todo list
   - Can interact with todos (create, edit, delete)

### Test 5: Protected Route Access (Unauthenticated)

**Objective**: Verify unauthenticated users are redirected to login

1. Open Browser Developer Tools
2. Clear **Local Storage**: Delete `fst-token-storage` key
3. Try to navigate to `http://localhost:4200/dashboard`
4. **Expected Result**:
   - Automatically redirected to `/login`
   - URL includes return URL: `/login?returnUrl=%2Fdashboard`
   
**Alternative Test**:
1. Log out (see Test 6)
2. Try to access `/dashboard` directly
3. Should be redirected to `/login`

### Test 6: Logout Flow

**Objective**: Verify users can log out successfully

1. Ensure you're logged in
2. Click the "Logout" button in the header
3. **Expected Result**:
   - Token removed from localStorage
   - User info disappears from header
   - Redirected to `/login` or home page
   - Login link appears again

**Verification**:
1. Check Developer Tools → Application → Local Storage
2. Confirm `fst-token-storage` key is deleted
3. Try accessing `/dashboard` → Should redirect to `/login`

### Test 7: JWT Sent in HTTP Requests

**Objective**: Verify JWT token is included in API requests

1. Ensure you're logged in
2. Open Browser Developer Tools
3. Go to **Network** tab
4. Navigate to dashboard or perform an action (e.g., create a todo)
5. Find an API request to `http://localhost:3000/api/v1/...`
6. Click on the request
7. Go to **Headers** section
8. **Expected Result**:
   - Under **Request Headers**, find `Authorization` header
   - Value should be: `Bearer eyJhbGc...` (your JWT token)

**Test Multiple Endpoints**:
- GET `/api/v1/todos` → Should include Authorization header
- POST `/api/v1/todos` → Should include Authorization header
- GET `/api/v1/users/:id` → Should include Authorization header

### Test 8: Token Expiration Handling

**Objective**: Verify expired tokens are handled correctly

1. Log in successfully
2. Open Developer Tools → Application → Local Storage
3. Copy the current token from `fst-token-storage`
4. Go to https://jwt.io
5. Decode the token and note the `exp` (expiration) timestamp
6. **Option A - Wait for expiration** (tokens expire in 10 minutes):
   - Wait until after expiration time
   - Try to access a protected route
   - Should be redirected to login
7. **Option B - Manually expire** (advanced):
   - Modify the token to have an old expiration date
   - Try to access a protected route
   - Should be redirected to login

### Test 9: Token Persistence Across Page Reloads

**Objective**: Verify users stay logged in after page reload

1. Log in successfully
2. Navigate to dashboard
3. Refresh the page (F5 or Ctrl+R)
4. **Expected Result**:
   - User remains logged in
   - Dashboard still accessible
   - User info still displayed in header
   - Token still in localStorage

### Test 10: Multiple Tabs/Windows

**Objective**: Verify authentication works across multiple browser tabs

1. Log in in Tab 1
2. Open new tab (Tab 2) to `http://localhost:4200`
3. **Expected Result**:
   - Tab 2 also shows user as logged in
   - Can access dashboard in both tabs
   
**Logout Test**:
1. Log out in Tab 1
2. Refresh Tab 2
3. **Expected Result**:
   - Tab 2 should also be logged out (after refresh)

### Test 11: Error Handling

**Objective**: Verify errors are displayed to users

1. **Server Offline Test**:
   - Stop the server
   - Try to log in
   - Expected: Error message displayed
   
2. **Network Error Simulation**:
   - Open Developer Tools → Network tab
   - Enable "Offline" mode
   - Try to log in
   - Expected: Error message displayed

3. **Invalid Token Test**:
   - Manually modify the token in localStorage (change a few characters)
   - Try to access dashboard
   - Expected: Redirected to login or error displayed

## Browser Console Checks

Throughout testing, monitor the browser console for:
- ❌ No error messages (unless testing error scenarios)
- ❌ No 401 Unauthorized errors (except in unauthenticated tests)
- ❌ No CORS errors
- ❌ No TypeScript/Angular errors

## Server Console Checks

Monitor the server terminal for:
- ✅ Successful login attempts logged
- ✅ JWT validation logs (if enabled)
- ❌ No unhandled exceptions
- ❌ No database errors

## Test Results Template

Use this template to document your testing results:

```
Date: ___________
Tester: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Test 1: Registration Flow | ☐ Pass ☐ Fail | |
| Test 2: Login Flow | ☐ Pass ☐ Fail | |
| Test 3: JWT Storage | ☐ Pass ☐ Fail | |
| Test 4: Protected Route (Auth) | ☐ Pass ☐ Fail | |
| Test 5: Protected Route (Unauth) | ☐ Pass ☐ Fail | |
| Test 6: Logout Flow | ☐ Pass ☐ Fail | |
| Test 7: JWT in Requests | ☐ Pass ☐ Fail | |
| Test 8: Token Expiration | ☐ Pass ☐ Fail | |
| Test 9: Token Persistence | ☐ Pass ☐ Fail | |
| Test 10: Multiple Tabs | ☐ Pass ☐ Fail | |
| Test 11: Error Handling | ☐ Pass ☐ Fail | |

Overall Result: ☐ All Pass ☐ Some Failures

Issues Found:
1. ___________
2. ___________
3. ___________
```

## Troubleshooting

### Issue: Cannot access client at http://localhost:4200

**Solution**: 
- Check client is running: `npx nx serve client`
- Check for port conflicts: `lsof -ti :4200`

### Issue: API requests failing

**Solution**:
- Check server is running: `npx nx serve server`
- Check server URL in proxy config: `apps/client/proxy.conf.json`
- Verify server is on port 3000

### Issue: Token not being sent in requests

**Solution**:
- Verify `jwtInterceptor` is registered in `apps/client/src/main.ts`
- Check browser console for interceptor errors
- Verify token exists in localStorage

### Issue: "Cannot find module 'jwt-decode'"

**Solution**:
- Run `npm install jwt-decode`
- Restart the client dev server

### Issue: Always redirected to login, even when logged in

**Solution**:
- Check `authGuard` implementation
- Verify `isTokenExpired()` logic
- Check token expiration time

## Success Criteria

All 11 test cases should pass:
- ✅ Users can register new accounts
- ✅ Users can log in with valid credentials
- ✅ JWT token is stored in localStorage
- ✅ Authenticated users can access protected routes
- ✅ Unauthenticated users are redirected to login
- ✅ Users can log out successfully
- ✅ JWT token is sent in API requests
- ✅ Expired tokens are handled correctly
- ✅ Authentication persists across page reloads
- ✅ Authentication works across multiple tabs
- ✅ Errors are displayed appropriately

## Next Steps After Manual Testing

1. Document any issues found
2. Fix critical bugs
3. Run automated tests again: `make test`
4. Consider adding E2E tests for authentication flows
5. Update Storybook stories if needed
6. Commit changes if all tests pass

## Related Documentation

- [JWT Token Testing with curl](./JWT_TOKEN_TESTING.md) - Backend API testing
- [Running Tests](./RUNNING_TESTS.md) - Automated test documentation
- [Part 9 Reference](../references/full_stack_developmen_series_part_9.md) - Feature specification
