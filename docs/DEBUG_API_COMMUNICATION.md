# How to Debug API Communication Issues

**For:** Junior engineers who need to fix why E2E tests can't talk to the server

## The Problem in Simple Terms

The tests try to create todos, but the server never responds. We need to find out why.

## Step-by-Step Debugging

Follow these steps in order. Don't skip ahead - each step builds on the previous one.

---

## Step 1: Make Sure Servers Are Running

**What to do:**
1. Open Terminal 1
2. Run: `make run`
3. Wait until you see both servers running

**What you should see:**
```
Server running on: http://localhost:3000
Client running on: http://localhost:4200
```

**How to check it worked:**
Open Terminal 2 and run:
```bash
http GET http://localhost:3000/api/todos
```

**Expected result:**
- You should see `[]` (empty array) or a list of todos in JSON format
- If you see "Connection refused", the server isn't running

**Note:** If you don't have `httpie` installed:
```bash
# macOS
brew install httpie

# Or using pip
pip install httpie
```

**If it doesn't work:**
```bash
# Kill any processes using the ports
make kill

# Try again
make run
```

---

## Step 2: Test the API Manually

**Why:** We need to prove the server works when we call it directly.

**What to do:**
In Terminal 2, run these commands:

```bash
# Test 1: Get all todos
http GET http://localhost:3000/api/todos

# Test 2: Create a todo
http POST http://localhost:3000/api/todos \
  title="Test Todo" \
  description="Testing the API"
```

**What you should see:**
- Test 1: `[]` or a list of todos in pretty JSON format
- Test 2: A JSON object with the created todo (has `id`, `title`, `description`, `completed`, `createdAt`, `updatedAt`)

**HTTPie makes it easier:**
- No need for `-H "Content-Type: application/json"` - HTTPie does this automatically
- Just write `title="..."` instead of JSON strings
- Output is colored and formatted nicely

**If it doesn't work:**
- Check Terminal 1 for server error messages
- Make sure the server is actually running
- Check `apps/server/src/app/app.module.ts` - does it import `TodoModule`?

---

## Step 3: Check the Proxy Configuration

**What is a proxy?** The Angular app runs on port 4200, but the server is on port 3000. The proxy forwards requests from the app to the server.

**What to do:**
1. Open the file: `apps/client/proxy.conf.json`
2. Check it looks like this:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

**How to test if proxy works:**
1. Make sure client is running (`make client` or `make run`)
2. Open browser: `http://localhost:4200`
3. Open DevTools (F12) → Network tab
4. Try creating a todo in the browser
5. Look for a request to `/api/todos`

**What you should see:**
- A request to `http://localhost:4200/api/todos`
- Status code: 201 (created) or 200 (success)

**If it doesn't work:**
- The proxy might not be active
- Restart the client: `make kill` then `make client`
- Check `apps/client/project.json` - does it reference the proxy config?

---

## Step 4: Add Logging to See What's Happening

**Why:** We need to see if Playwright is making requests and if the server is responding.

**What to do:**
1. Open: `apps/client-e2e/src/todo-management.spec.ts`
2. Find the `test.beforeEach` function
3. Add this code at the start:

```typescript
test.beforeEach(async ({ page }) => {
  // Log all API requests
  page.on('request', request => {
    if (request.url().includes('/api')) {
      console.log('→ REQUEST:', request.method(), request.url());
    }
  });
  
  // Log all API responses
  page.on('response', response => {
    if (response.url().includes('/api')) {
      console.log('← RESPONSE:', response.status(), response.url());
    }
  });
  
  // Your existing code continues here...
  await page.goto('/');
  await page.locator('header h1').waitFor({ timeout: 10000 });
});
```

**What to do next:**
1. Save the file
2. Run a test: `npx nx e2e client-e2e --project=chromium --grep "should create"`
3. Look at the output

**What you should see:**
```
→ REQUEST: POST http://localhost:4200/api/todos
← RESPONSE: 201 http://localhost:4200/api/todos
```

**If you see:**
- ✅ Requests AND responses → The API is working! The problem is elsewhere.
- ❌ Requests but NO responses → The server isn't responding (go to Step 5)
- ❌ NO requests at all → The form isn't submitting (go to Step 6)

---

## Step 5: Check Playwright Configuration

**What to do:**
1. Open: `apps/client-e2e/playwright.config.ts`
2. Find the `webServer` section
3. Check what it says

**Current setup:**
```typescript
webServer: {
  command: 'npx nx serve client',
  url: 'http://localhost:4200',
  timeout: 120000,
}
```

**The problem:** This only starts the client. It assumes the server is already running.

**Possible fix:**
Try starting both servers. Change it to:

```typescript
webServer: [
  {
    command: 'npx nx serve server',
    url: 'http://localhost:3000/api',
    timeout: 120000,
  },
  {
    command: 'npx nx serve client',
    url: 'http://localhost:4200',
    timeout: 120000,
  },
]
```

**What to do:**
1. Make this change
2. Save the file
3. Run tests again: `make e2e-client`
4. See if it works

**If it still doesn't work:**
- The server might not be ready when tests start
- Try increasing the timeout: `timeout: 180000` (3 minutes)

---

## Step 6: Check for JavaScript Errors

**What to do:**
Add this to your test to catch browser errors:

```typescript
test('check for errors', async ({ page }) => {
  const errors: string[] = [];
  
  // Catch console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('Browser error:', msg.text());
    }
  });
  
  // Catch page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('Page error:', error.message);
  });
  
  await page.goto('/');
  await page.fill('input[name="title"]', 'Test');
  await page.fill('textarea[name="description"]', 'Test');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  
  if (errors.length > 0) {
    console.log('Found errors:', errors);
  }
});
```

**What to look for:**
- CORS errors → Server needs CORS enabled
- Network errors → Connection problem
- JavaScript errors → Code bug

---

## Step 7: Test Direct API Calls (Bypass Proxy)

**Why:** This tells us if the problem is the proxy or the server itself.

**What to do:**
Create a simple test:

```typescript
test('test direct API', async ({ request }) => {
  // This bypasses the browser and talks directly to the server
  const response = await request.post('http://localhost:3000/api/todos', {
    data: {
      title: 'Direct Test',
      description: 'Testing direct API call'
    }
  });
  
  console.log('Status:', response.status());
  console.log('Body:', await response.json());
  
  expect(response.ok()).toBeTruthy();
});
```

**Run it:**
```bash
npx nx e2e client-e2e --project=chromium --grep "test direct API"
```

**What this tells you:**
- ✅ **If this works:** The server is fine. The problem is the proxy or the browser.
- ❌ **If this fails:** The server has a problem. Check server logs.

---

## Common Problems and Quick Fixes

### Problem: "Connection refused"
**Fix:** Server isn't running. Run `make run` first.

### Problem: "Port already in use"
**Fix:** Something else is using port 3000 or 4200. Run `make kill` to free them.

### Problem: "CORS error"
**Fix:** Server needs CORS enabled. Check `apps/server/src/main.ts` - should have `app.enableCors()`.

### Problem: "Proxy not working"
**Fix:** 
1. Check `proxy.conf.json` exists and is correct
2. Restart client: `make kill` then `make client`
3. Check browser DevTools Network tab

### Problem: "Tests timeout"
**Fix:**
1. Increase timeout in test: `timeout: 30000` (30 seconds)
2. Make sure server is actually running
3. Check server logs for errors

---

## Checklist

Before asking for help, make sure you've checked:

- [ ] Both servers are running (`make run`)
- [ ] Manual API calls work (`http GET http://localhost:3000/api/todos`)
- [ ] Proxy configuration is correct
- [ ] Added logging to see requests/responses
- [ ] Checked for JavaScript errors
- [ ] Tested direct API calls
- [ ] Read server logs for errors

---

## What to Do After You Find the Problem

1. **Write down what you found** - What was the issue?
2. **Fix it** - Make the necessary changes
3. **Test it** - Run the tests again
4. **Document it** - Update this file with the solution

---

## Need Help?

If you're stuck:
1. Re-read the step you're on
2. Check the "Common Problems" section
3. Look at server logs in Terminal 1
4. Check browser console (if testing manually)
5. Ask a senior engineer - show them what you've tried

---

**Remember:** Debugging is about being methodical. Do one step at a time. Don't skip steps. Write down what you see at each step.
