# Database Seed Script Documentation

## Overview

The seed script (`scripts/seed.ts`) is a utility tool that populates the PostgreSQL database with initial sample data. It's designed to help developers quickly set up a development environment with pre-configured todo items.

## Purpose

- **Development Setup**: Quickly populate the database with sample data for testing and development
- **Demo Data**: Provide realistic examples of todo items for demonstration purposes
- **Testing**: Ensure consistent initial state for testing scenarios

## Prerequisites

Before running the seed script, ensure you have:

- Node.js and npm installed
- All project dependencies installed (`npm install`)
- TypeScript and ts-node available (included in devDependencies)
- PostgreSQL running (via Docker Compose: `docker-compose up -d`)
- A valid database connection configured (or use the default)

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

### Database Connection

The script automatically loads environment variables from `.env` files and determines the database connection using the following priority:

1. **`.env` file**: Automatically loads `DATABASE_URL` from `.env` in the project root
2. **`.env.development` file**: Falls back to `.env.development` if `DATABASE_URL` is not found in `.env`
3. **Environment Variable**: If `DATABASE_URL` is exported in the shell, it uses that value
4. **Default URL**: Falls back to `postgresql://postgres:postgres@localhost:5432/fullstack_todo`

#### Setting a Custom Database URL

**Recommended: Use `.env` file** (automatically loaded):

```bash
# Add to .env file in project root
DATABASE_URL=postgresql://user:password@host:port/database
npm run seed
```

**Alternative: Export environment variable**:

```bash
# Using environment variable
DATABASE_URL=postgresql://user:password@host:port/database npm run seed

# Or export it first
export DATABASE_URL=postgresql://user:password@host:port/database
npm run seed
```

**Note**: The script automatically loads `.env` and `.env.development` files, so you typically don't need to export the variable manually.

#### Starting PostgreSQL

Before running the seed script, make sure PostgreSQL is running:

```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d

# Verify it's running
docker-compose ps
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
🔗 Database URL: postgresql://postgres:****@localhost:5432/fullstack_todo
📄 Loading seed data from YAML...
   Found 3 user(s) to seed
✅ Database connection established
📊 Existing data in database: 0 user(s), 0 todo(s)

👤 Creating user: alice@example.com
   ✓ User created with ID: ...
   📝 Creating 5 todo(s) for alice@example.com...
      ✓ Created: "Welcome to Full Stack Todo!" (pending)
      ...

✨ Seeding complete!
📊 Total users in database: 3
📊 Total todos in database: 12
🔌 Database connection closed
🎉 Seed script completed successfully
```

### Exit Codes

- `0`: Success - Database seeded successfully
- `1`: Error - Something went wrong (connection failed, insertion error, etc.)

## Reseeding the Database

If you need to reseed the database (replace existing data), you have a few options:

### Option 1: Clear Existing Data

```bash
# Clear existing data using psql
docker exec full-stack-todo-postgres psql -U postgres -d fullstack_todo -c "TRUNCATE TABLE \"user\", todo CASCADE;"

# Then run the seed script
npm run seed
```

### Option 2: Recreate the Database

```bash
# Drop and recreate the database
docker exec full-stack-todo-postgres psql -U postgres -c "DROP DATABASE IF EXISTS fullstack_todo;"
docker exec full-stack-todo-postgres psql -U postgres -c "CREATE DATABASE fullstack_todo;"

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
  type: 'postgres',
  url: databaseUrl,
  entities: [UserEntitySchema, ToDoEntitySchema],
  synchronize: true, // Create/update schema automatically (safe for seeding script)
  logging: false,
});
```

**Important Notes**:
- `synchronize: true` - The script automatically creates/updates the database schema
- `logging: false` - SQL queries are not logged (set to `true` for debugging)
- Uses the same entity schemas as the main application
- Requires PostgreSQL to be running (use `docker-compose up -d`)

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
- Clear existing data: `docker exec full-stack-todo-postgres psql -U postgres -d fullstack_todo -c "TRUNCATE TABLE \"user\", todo CASCADE;"`
- Or modify the script to skip the check

#### Issue: "Cannot connect to database" or "ECONNREFUSED"

**Possible Causes**:
- PostgreSQL is not running
- Database URL is incorrect
- Connection credentials are wrong
- Port 5432 is not accessible

**Solution**:
- Start PostgreSQL: `docker-compose up -d`
- Verify PostgreSQL is running: `docker-compose ps`
- Verify `DATABASE_URL` environment variable
- Check connection string format: `postgresql://user:password@host:port/database`
- Ensure Docker container is healthy: `docker inspect full-stack-todo-postgres`

#### Issue: "TypeORM entity not found"

**Solution**: 
- Verify `ToDoEntitySchema` is exported from `@full-stack-todo/server/data-access-todo`
- Check that path aliases are correctly configured

## Integration with CI/CD

The seed script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Start PostgreSQL
  run: docker-compose up -d

- name: Seed Database
  run: npm run seed
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fullstack_todo
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

