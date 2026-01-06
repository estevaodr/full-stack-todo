# Scripts Documentation

This directory contains documentation for utility scripts used in the Full Stack Todo project.

## Available Scripts

### Database Seeding

- **[SEED_SCRIPT.md](./SEED_SCRIPT.md)** - Complete documentation for the database seed script
  - Usage instructions
  - Configuration options
  - Troubleshooting guide
  - Customization examples

## Quick Start

### Seed the Database

```bash
# Using npm
npm run seed

# Using Nx
nx run server:seed
```

For detailed information, see [SEED_SCRIPT.md](./SEED_SCRIPT.md).

## Adding New Scripts

When adding new utility scripts:

1. Create the script in the `scripts/` directory at the project root
2. Add documentation in this `docs/scripts/` directory
3. Update this README with a link to the new documentation
4. Add the script command to `package.json` if it should be easily accessible

