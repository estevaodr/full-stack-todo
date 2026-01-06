# Database Seed Script Documentation

## Overview

The seed script (`scripts/seed.ts`) is a utility tool that populates the SQLite database with initial sample data. It's designed to help developers quickly set up a development environment with pre-configured todo items.

## Purpose

- **Development Setup**: Quickly populate the database with sample data for testing and development
- **Demo Data**: Provide realistic examples of todo items for demonstration purposes
- **Testing**: Ensure consistent initial state for testing scenarios

## Prerequisites

Before running the seed script, ensure you have:

- Node.js and npm installed
- All project dependencies installed (`npm install`)
- TypeScript and ts-node available (included in devDependencies)
- A valid database path configured (or use the default)

## Usage

### Method 1: Using npm script (Recommended)

```bash
npm run seed
```

This is the simplest way to run the seed script. It uses the configuration defined in `package.json`.

### Method 2: Using Nx

```bash
# Using Nx run command
nx run server:seed

# Or using the shorthand
nx seed server
```

This method leverages Nx's task runner and provides better integration with the monorepo structure.

### Method 3: Direct execution with ts-node

```bash
npx ts-node --project scripts/tsconfig.json --require tsconfig-paths/register scripts/seed.ts
```

This method runs the script directly without going through npm or Nx.

## Configuration

### Database Path

The script determines the database path using the following priority:

1. **Environment Variable**: If `DATABASE_PATH` is set, it uses that value
2. **Default Path**: Falls back to `tmp/db.sqlite` in the project root

#### Setting a Custom Database Path

```bash
# Using environment variable
DATABASE_PATH=./custom/path/database.sqlite npm run seed

# Or export it first
export DATABASE_PATH=./custom/path/database.sqlite
npm run seed
```

### Sample Data

The script seeds the database with 5 sample todo items:

1. **Welcome to Full Stack Todo!** - A welcome message todo
2. **Add a route to create todo items!** - A development task
3. **Learn TypeORM** - A completed learning task
4. **Implement database seeding** - A completed implementation task
5. **Build amazing features** - A future task

Each todo includes:
- `title`: The main text of the todo
- `description`: Additional details
- `completed`: Boolean status (some are completed, some are not)
- `id`: Automatically generated UUID by TypeORM

## Behavior

### Safety Features

The script includes several safety mechanisms:

1. **Duplicate Prevention**: Checks if the database already contains data before seeding
   - If data exists, the script exits with a warning message
   - Prevents accidental overwriting of existing data

2. **Directory Creation**: Automatically creates the database directory if it doesn't exist
   - Creates `tmp/` directory if using default path
   - Creates any custom directory path specified

3. **Error Handling**: Comprehensive error handling with:
   - Clear error messages
   - Proper connection cleanup
   - Appropriate exit codes

### Output

The script provides detailed console output:

```
🌱 Starting database seed...
📁 Database path: /path/to/tmp/db.sqlite
✅ Database connection established
📊 Existing todos in database: 0
📝 Inserting 5 sample todos...
   ✓ Created: "Welcome to Full Stack Todo!"
   ✓ Created: "Add a route to create todo items!"
   ✓ Created: "Learn TypeORM"
   ✓ Created: "Implement database seeding"
   ✓ Created: "Build amazing features"

✨ Seeding complete!
📊 Total todos in database: 5
🔌 Database connection closed
🎉 Seed script completed successfully
```

### Exit Codes

- `0`: Success - Database seeded successfully
- `1`: Error - Something went wrong (connection failed, insertion error, etc.)

## Reseeding the Database

If you need to reseed the database (replace existing data), you have a few options:

### Option 1: Delete the Database File

```bash
# Delete the database file
rm tmp/db.sqlite

# Then run the seed script
npm run seed
```

### Option 2: Clear Data Programmatically

You can manually clear the database using your database tool or by writing a custom script.

### Option 3: Modify the Script

You can modify `scripts/seed.ts` to:
- Skip the duplicate check
- Clear existing data before seeding
- Use `upsert` operations instead of `save`

## Technical Details

### Architecture

The seed script uses:

- **TypeORM DataSource**: Direct database connection (not through NestJS)
- **Entity Schema**: Uses `ToDoEntitySchema` from `@full-stack-todo/server/data-access-todo`
- **Path Aliases**: Leverages TypeScript path mappings from `tsconfig.base.json`
- **Type Safety**: Uses `ITodo` interface from `@full-stack-todo/shared`

### Connection Configuration

```typescript
const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: databasePath,
  entities: [ToDoEntitySchema],
  synchronize: false, // Don't auto-sync in scripts
  logging: false,
});
```

**Important Notes**:
- `synchronize: false` - The script doesn't modify the database schema
- `logging: false` - SQL queries are not logged (set to `true` for debugging)
- Uses the same entity schema as the main application

### File Structure

```
scripts/
├── seed.ts          # Main seed script
└── tsconfig.json    # TypeScript configuration for scripts
```

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module '@full-stack-todo/...'"

**Solution**: Ensure `tsconfig-paths` is being loaded:
- The npm script includes `--require tsconfig-paths/register`
- Verify path mappings in `tsconfig.base.json`

#### Issue: "Database already contains data"

**Solution**: This is expected behavior. To reseed:
- Delete the database file: `rm tmp/db.sqlite`
- Or modify the script to skip the check

#### Issue: "Cannot connect to database"

**Possible Causes**:
- Database path is incorrect
- File permissions issue
- Database file is locked by another process

**Solution**:
- Verify `DATABASE_PATH` environment variable
- Check file permissions
- Ensure no other process is using the database

#### Issue: "TypeORM entity not found"

**Solution**: 
- Verify `ToDoEntitySchema` is exported from `@full-stack-todo/server/data-access-todo`
- Check that path aliases are correctly configured

## Integration with CI/CD

The seed script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Seed Database
  run: npm run seed
  env:
    DATABASE_PATH: ./tmp/test-db.sqlite
```

## Customization

### Adding More Sample Data

Edit `scripts/seed.ts` and modify the `sampleTodos` array:

```typescript
const sampleTodos: Omit<ITodo, 'id'>[] = [
  // Add your custom todos here
  {
    title: 'Your Custom Todo',
    description: 'Your description',
    completed: false,
  },
  // ... more todos
];
```

### Changing Seeding Behavior

You can modify the script to:
- Clear existing data before seeding
- Use different data sources (JSON files, APIs, etc.)
- Add validation logic
- Support different environments (dev, staging, production)

## Best Practices

1. **Never run in production**: The seed script is designed for development only
2. **Backup before reseeding**: If you need to reseed, backup existing data first
3. **Use environment variables**: Configure database paths via environment variables
4. **Version control**: Keep the seed script in version control for consistency
5. **Document changes**: Update this documentation when modifying seed data

## Related Documentation

- [TypeORM Documentation](https://typeorm.io/)
- [Nx Documentation](https://nx.dev/)
- [NestJS Database Documentation](https://docs.nestjs.com/techniques/database)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the script source code in `scripts/seed.ts`
3. Check the main application's database configuration in `apps/server/src/app/app.module.ts`

