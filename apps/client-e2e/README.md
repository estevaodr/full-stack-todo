# E2E Tests for Todo Application

This directory contains end-to-end tests for the Todo application using Playwright and BDD (Behavior-Driven Development).

## Prerequisites

1. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

2. **Install HTTPie (for API testing):**
   ```bash
   # macOS
   brew install httpie
   
   # Or using pip
   pip install httpie
   ```

3. **Start both server and client:**
   ```bash
   make run
   # Or start them separately:
   make server  # Terminal 1
   make client  # Terminal 2
   ```

## Running Tests

### Run all E2E tests
```bash
make e2e-client
# Or
npx nx e2e client-e2e
```

### Run tests in UI mode (interactive)
```bash
npx nx e2e client-e2e --ui
```

### Run specific test
```bash
npx nx e2e client-e2e --grep "should create a new todo"
```

### Run tests in a specific browser
```bash
npx nx e2e client-e2e --project=chromium
npx nx e2e client-e2e --project=firefox
npx nx e2e client-e2e --project=webkit
```

## BDD Scenarios

The tests are based on BDD scenarios defined in:
- **Feature file:** `src/features/todo-management.feature`
- **Test implementation:** `src/todo-management.spec.ts`

See the main [BDD.md](../../docs/BDD.md) file for detailed scenario documentation.

## Test Structure

- `src/example.spec.ts` - Basic smoke test
- `src/todo-management.spec.ts` - Comprehensive todo management tests
- `src/features/todo-management.feature` - BDD feature file (Gherkin format)

## Troubleshooting

### Tests fail with "server not responding"
- Ensure both server and client are running
- Check that server is on `http://localhost:3000`
- Check that client is on `http://localhost:4200`
- Verify proxy configuration in `apps/client/proxy.conf.json`

### Tests timeout
- Increase timeout in test file if needed
- Check network tab in browser for failed API calls
- Verify server logs for errors

### Browser not found
- Run `npx playwright install` to download browsers

## Debugging Resources

For detailed debugging guides, see the `docs/` folder in the repository root:
- **`docs/TEST_STATUS.md`** - Current test status and summary
- **`docs/DEBUG_API_COMMUNICATION.md`** - Step-by-step API debugging guide (start here!)
- **`docs/ADD_LOGGING.md`** - Guide for adding detailed logging to tests

