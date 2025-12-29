# How to Add Logging to E2E Tests

**For:** Junior engineers who need to see what's happening during tests

## What is Logging?

Logging means printing information to the console so you can see what the test is doing. It's like adding `console.log()` statements to your code.

## Why Add Logging?

When a test fails, you need to know:
- Did the test reach this step?
- What data was sent?
- What response was received?
- How long did it take?

Logging answers these questions.

---

## Quick Start: Add Basic Logging

### Step 1: Add Network Logging (Most Important)

**Where:** `apps/client-e2e/src/todo-management.spec.ts`

**Find this function:**
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('header h1').waitFor({ timeout: 10000 });
});
```

**Replace it with this:**
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
  
  await page.goto('/');
  await page.locator('header h1').waitFor({ timeout: 10000 });
});
```

**What this does:**
- Prints every API request the test makes
- Prints every API response the server sends back
- Shows you if requests are being made and if responses are received

**How to test:**
1. Save the file
2. Run: `npx nx e2e client-e2e --project=chromium --grep "should create"`
3. Look for `→ REQUEST:` and `← RESPONSE:` in the output

---

## Step 2: Add Logging to the createTodo Helper

**Where:** `apps/client-e2e/src/todo-management.spec.ts`

**Find this function:**
```typescript
const createTodo = async (page: Page, title: string, description: string) => {
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="description"]', description);
  await page.click('button[type="submit"]');
  await page.locator(`text=${title}`).first().waitFor({ timeout: 5000 });
};
```

**Replace it with this:**
```typescript
const createTodo = async (page: Page, title: string, description: string) => {
  console.log(`[HELPER] Starting to create todo: ${title}`);
  
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="description"]', description);
  console.log(`[HELPER] Form filled`);
  
  await page.click('button[type="submit"]');
  console.log(`[HELPER] Submit button clicked`);
  
  console.log(`[HELPER] Waiting for todo to appear: ${title}`);
  await page.locator(`text=${title}`).first().waitFor({ timeout: 15000 });
  console.log(`[HELPER] Todo appeared!`);
};
```

**What this does:**
- Shows you each step of creating a todo
- Tells you when the form is filled
- Tells you when the button is clicked
- Tells you when the todo appears

---

## Step 3: Add Logging to a Test

**Example:** Let's add logging to the "create todo" test

**Find this test:**
```typescript
test('should create a new todo successfully', async ({ page }) => {
  const uniqueTitle = `Buy groceries ${Date.now()}`;
  
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="description"]', 'Milk, eggs, bread');
  await page.click('button[type="submit"]');
  
  await page.locator(`text=${uniqueTitle}`).waitFor({ timeout: 15000 });
  
  const todoItem = page.locator('.todo-item').filter({ hasText: uniqueTitle }).first();
  await expect(todoItem).toBeVisible();
});
```

**Replace it with this:**
```typescript
test('should create a new todo successfully', async ({ page }) => {
  console.log('[TEST] Starting test: should create a new todo successfully');
  
  const uniqueTitle = `Buy groceries ${Date.now()}`;
  console.log(`[TEST] Using title: ${uniqueTitle}`);
  
  await page.fill('input[name="title"]', uniqueTitle);
  await page.fill('textarea[name="description"]', 'Milk, eggs, bread');
  console.log('[TEST] Form filled');
  
  await page.click('button[type="submit"]');
  console.log('[TEST] Submit clicked');
  
  console.log('[TEST] Waiting for API response...');
  const responsePromise = page.waitForResponse(
    response => 
      response.url().includes('/api/todos') && 
      response.request().method() === 'POST',
    { timeout: 15000 }
  ).then(async (response) => {
    console.log(`[TEST] ✅ Got response: ${response.status()}`);
    return response;
  }).catch((error) => {
    console.log(`[TEST] ❌ No response: ${error.message}`);
    return null;
  });
  
  const response = await responsePromise;
  
  console.log('[TEST] Waiting for todo to appear in UI...');
  await page.locator(`text=${uniqueTitle}`).waitFor({ timeout: 15000 });
  console.log('[TEST] Todo found in UI!');
  
  const todoItem = page.locator('.todo-item').filter({ hasText: uniqueTitle }).first();
  await expect(todoItem).toBeVisible();
  console.log('[TEST] ✅ Test passed!');
});
```

**What this does:**
- Shows you each step of the test
- Tells you if the API responded or not
- Shows you when the todo appears
- Makes it easy to see where the test fails

---

## Step 4: Run Tests and Read the Logs

**How to run:**
```bash
npx nx e2e client-e2e --project=chromium --grep "should create"
```

**What you'll see:**
```
[TEST] Starting test: should create a new todo successfully
[TEST] Using title: Buy groceries 1234567890
[TEST] Form filled
[TEST] Submit clicked
→ REQUEST: POST http://localhost:4200/api/todos
[TEST] Waiting for API response...
← RESPONSE: 201 http://localhost:4200/api/todos
[TEST] ✅ Got response: 201
[TEST] Waiting for todo to appear in UI...
[TEST] Todo found in UI!
[TEST] ✅ Test passed!
```

**If it fails, you'll see:**
```
[TEST] Starting test: should create a new todo successfully
[TEST] Using title: Buy groceries 1234567890
[TEST] Form filled
[TEST] Submit clicked
→ REQUEST: POST http://localhost:4200/api/todos
[TEST] Waiting for API response...
[TEST] ❌ No response: Timeout 15000ms exceeded
```

**This tells you:** The request was made, but no response came back. The server isn't responding.

---

## Advanced: Log Response Body

**Why:** Sometimes you need to see what the server actually sent back.

**Add this:**
```typescript
page.on('response', async response => {
  if (response.url().includes('/api')) {
    const status = response.status();
    const url = response.url();
    
    try {
      const body = await response.json();
      console.log(`← RESPONSE: ${status} ${url}`);
      console.log('  Body:', JSON.stringify(body, null, 2));
    } catch (e) {
      const text = await response.text();
      console.log(`← RESPONSE: ${status} ${url}`);
      console.log('  Body (text):', text);
    }
  }
});
```

**What this does:**
- Shows the response status code
- Shows the actual data the server returned
- Helps you see if the data format is correct

---

## Advanced: Log Timing

**Why:** To see if things are taking too long.

**Add this:**
```typescript
test('with timing', async ({ page }) => {
  const start = Date.now();
  
  await page.goto('/');
  console.log(`[TIMING] Page loaded: ${Date.now() - start}ms`);
  
  const fillStart = Date.now();
  await page.fill('input[name="title"]', 'Test');
  await page.fill('textarea[name="description"]', 'Test');
  console.log(`[TIMING] Form filled: ${Date.now() - fillStart}ms`);
  
  const clickStart = Date.now();
  await page.click('button[type="submit"]');
  console.log(`[TIMING] Button clicked: ${Date.now() - clickStart}ms`);
  
  const waitStart = Date.now();
  await page.locator('text=Test').waitFor();
  console.log(`[TIMING] Todo appeared: ${Date.now() - waitStart}ms`);
  
  console.log(`[TIMING] Total time: ${Date.now() - start}ms`);
});
```

**What this does:**
- Shows how long each step takes
- Helps identify slow operations
- Shows if something is hanging

---

## Advanced: Log Browser Console Errors

**Why:** JavaScript errors in the browser can break tests.

**Add this:**
```typescript
test.beforeEach(async ({ page }) => {
  // Catch browser console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser error:', msg.text());
    }
  });
  
  // Catch page errors
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
  });
  
  // Your existing code...
});
```

**What this does:**
- Shows JavaScript errors from the browser
- Helps find code bugs
- Shows CORS errors or network problems

---

## What to Look For in Logs

### ✅ Good Signs:
- `→ REQUEST:` appears → The test is making API calls
- `← RESPONSE: 201` → The server responded successfully
- `[TEST] ✅ Test passed!` → Everything worked

### ❌ Bad Signs:
- `→ REQUEST:` but no `← RESPONSE:` → Server isn't responding
- `❌ Browser error:` → JavaScript error in the app
- `❌ No response: Timeout` → Request timed out
- No `→ REQUEST:` at all → Form isn't submitting

---

## Quick Reference

**Add to beforeEach (do this first):**
```typescript
page.on('request', request => {
  if (request.url().includes('/api')) {
    console.log('→ REQUEST:', request.method(), request.url());
  }
});

page.on('response', response => {
  if (response.url().includes('/api')) {
    console.log('← RESPONSE:', response.status(), response.url());
  }
});
```

**Add to tests:**
```typescript
console.log('[TEST] Starting step...');
// ... do something ...
console.log('[TEST] Step completed!');
```

**Run tests:**
```bash
npx nx e2e client-e2e --project=chromium --grep "test name"
```

---

## Tips

1. **Start simple** - Add basic logging first, then add more if needed
2. **Use clear labels** - `[TEST]`, `[HELPER]`, `[NETWORK]` make logs easy to read
3. **Don't log everything** - Only log important steps
4. **Remove logging later** - Once you fix the problem, you can remove extra logs
5. **Save logs to file** - Use `> test-output.log` to save logs for later

---

**Remember:** Logging is your friend. It shows you exactly what's happening. If a test fails, the logs will tell you why.
