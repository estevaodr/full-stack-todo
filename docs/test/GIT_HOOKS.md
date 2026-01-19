# Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality through Git hooks.

## Pre-commit Hook

Before every commit, Husky automatically runs all tests to ensure code quality.

### What happens on commit:

1. You run `git commit`
2. Husky triggers the pre-commit hook
3. All tests run: `npx nx run-many --target=test --all`
4. If tests pass ✅ - commit proceeds
5. If tests fail ❌ - commit is blocked

### Hook Location

`.husky/pre-commit` - Contains the pre-commit script

## Available Scripts

```bash
# Run all tests manually (same as pre-commit hook)
npm run test:all

# Or use nx directly
npx nx run-many --target=test --all

# Run tests for specific project
npx nx test <project-name>

# Examples:
npx nx test client
npx nx test server-feature-auth
```

## Bypassing the Hook (Not Recommended)

In rare cases where you need to commit without running tests:

```bash
git commit --no-verify -m "your message"
```

**Warning:** Only use `--no-verify` in emergency situations. The pre-commit hook exists to prevent broken code from entering the repository.

## Setup for New Contributors

Husky is automatically set up when you run `npm install` due to the `prepare` script in `package.json`.

If hooks aren't working:

```bash
# Reinstall husky
npm run prepare

# Or manually
npx husky install
```

## Why Pre-commit Testing?

1. **Catch bugs early** - Find issues before they reach the repository
2. **Maintain quality** - Ensure all committed code passes tests
3. **Save CI time** - Prevent pushing broken code that fails in CI
4. **Team confidence** - Every commit is tested and verified

## Test Suite Coverage

The pre-commit hook runs tests for all projects:

- ✅ Client (Angular app)
- ✅ Server (NestJS API)
- ✅ Server Feature Auth (Authentication)
- ✅ Server Feature User (User management)
- ✅ Server Feature Todo (Todo CRUD)
- ✅ UI Components (Storybook components)
- ✅ Data Access (Client services)
- ✅ Data Access Todo (Shared interfaces)

## Troubleshooting

### Hook not running

```bash
# Ensure hook is executable
chmod +x .husky/pre-commit

# Reinstall husky
npm run prepare
```

### Tests failing

```bash
# Run tests to see failures
npm run test:all

# Run specific failing test
npx nx test <project-name>

# Clear Nx cache if issues persist
npx nx reset
```

### Slow commits

If tests are slow, consider:

1. Using Nx caching (already enabled)
2. Running tests in parallel (already enabled)
3. Using `--skip-nx-cache` only when necessary

The Nx cache makes subsequent test runs much faster by reusing results from unchanged projects.
