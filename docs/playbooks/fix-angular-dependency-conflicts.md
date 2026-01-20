# Fixing Angular Dependency Conflicts

## Problem

When installing or updating npm packages, you may encounter dependency resolution errors like:

```
npm error ERESOLVE could not resolve
npm error While resolving: @angular/platform-browser-dynamic@21.0.8
npm error Found: @angular/common@21.0.6
npm error Could not resolve dependency:
npm error peer @angular/common@"21.0.8" from @angular/platform-browser-dynamic@21.0.8
```

This happens when Angular packages have mismatched patch versions. For example:
- `@angular/common@21.0.6` is installed
- `@angular/platform-browser-dynamic@21.0.8` requires `@angular/common@21.0.8`

## Root Cause

Angular packages must all be on the same patch version. When using version ranges like `~21.0.0` (which allows patch updates), npm may resolve different packages to different patch versions, causing conflicts.

## Solution

### Step 1: Update package.json

Ensure all Angular packages use the same version constraint. Replace `~21.0.0` with `^21.0.8` (or the latest patch version) for all Angular packages:

**Dependencies:**
```json
{
  "dependencies": {
    "@angular/common": "^21.0.8",
    "@angular/compiler": "^21.0.8",
    "@angular/core": "^21.0.8",
    "@angular/forms": "^21.0.8",
    "@angular/platform-browser": "^21.0.8",
    "@angular/router": "^21.0.8"
  }
}
```

**DevDependencies:**
```json
{
  "devDependencies": {
    "@angular-devkit/build-angular": "^21.0.8",
    "@angular-devkit/core": "^21.0.8",
    "@angular-devkit/schematics": "^21.0.8",
    "@angular/build": "^21.0.8",
    "@angular/cli": "^21.0.8",
    "@angular/compiler-cli": "^21.0.8",
    "@angular/language-service": "^21.0.8",
    "@angular/platform-browser-dynamic": "^21.0.8",
    "@schematics/angular": "^21.0.8"
  }
}
```

**Note:** Use `^21.0.8` (caret) instead of `~21.0.0` (tilde) to allow minor and patch updates while ensuring all packages resolve to compatible versions.

### Step 2: Clean Install

Remove existing node_modules and package-lock.json, then reinstall:

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clean npm cache (optional but recommended)
npm cache clean --force

# Reinstall dependencies
npm install
```

### Step 3: Verify Installation

Check that all Angular packages are on the same version:

```bash
npm list @angular/common @angular/core @angular/platform-browser-dynamic
```

All should show the same version (e.g., `21.0.8`).

## Alternative Solutions

### Option 1: Use --legacy-peer-deps (Not Recommended)

If you need a quick workaround (not recommended for production):

```bash
npm install --legacy-peer-deps
```

**Warning:** This may install incompatible versions and cause runtime errors.

### Option 2: Use --force (Not Recommended)

Force the installation despite conflicts:

```bash
npm install --force
```

**Warning:** This can break your application. Only use for testing.

### Option 3: Use Exact Versions

Pin all Angular packages to exact versions (most restrictive):

```json
{
  "dependencies": {
    "@angular/common": "21.0.8",
    "@angular/core": "21.0.8"
    // ... etc (no ~ or ^)
  }
}
```

**Note:** This prevents automatic updates and requires manual version bumps.

## Prevention

### Best Practices

1. **Use consistent version constraints:**
   - Use `^21.0.8` (caret) for all Angular packages
   - Avoid mixing `~` (tilde) and `^` (caret) for Angular packages

2. **Update all Angular packages together:**
   ```bash
   npm install @angular/common@^21.0.8 @angular/core@^21.0.8 @angular/platform-browser@^21.0.8
   ```

3. **Use Angular Update Guide:**
   - For major/minor updates, use Angular's official update guide: https://update.angular.io/
   - Use `ng update` command when possible

4. **Check for conflicts before committing:**
   ```bash
   npm install --dry-run
   ```

## Common Angular Package Versions

When updating, ensure these packages are aligned:

- `@angular/common`
- `@angular/compiler`
- `@angular/core`
- `@angular/forms`
- `@angular/platform-browser`
- `@angular/platform-browser-dynamic`
- `@angular/router`
- `@angular-devkit/build-angular`
- `@angular-devkit/core`
- `@angular-devkit/schematics`
- `@angular/build`
- `@angular/cli`
- `@angular/compiler-cli`
- `@angular/language-service`
- `@schematics/angular`

## Troubleshooting

### Issue: Still getting conflicts after updating package.json

**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `npm install`

### Issue: Different versions still installed

**Solution:**
Check for transitive dependencies that might be pulling in different versions:
```bash
npm list @angular/common --all
```

If other packages require different Angular versions, you may need to update those packages or use npm overrides.

### Issue: Storybook or other tools require different versions

**Solution:**
Use npm overrides to force a specific version:
```json
{
  "overrides": {
    "@angular/common": "^21.0.8",
    "@angular/core": "^21.0.8"
  }
}
```

## Related Issues

- **Nx compatibility:** Ensure Nx version is compatible with Angular version
- **Storybook compatibility:** Check Storybook version supports your Angular version
- **TypeScript compatibility:** Angular 21 requires TypeScript ~5.9.2

## References

- [Angular Update Guide](https://update.angular.io/)
- [npm Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning)
- [Angular Version Compatibility](https://angular.io/guide/versions)
