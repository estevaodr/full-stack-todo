# PRD: SQLite to PostgreSQL Migration

**Date**: 2026-01-20  
**Status**: Draft  
**Priority**: High

## Introduction/Overview

This PRD outlines the migration of the Full Stack Todo application from SQLite to PostgreSQL. The migration will improve the application's scalability, enable better production readiness, and provide a more robust database solution. Since this is a local development environment and the application is not in production, we will focus solely on application changes without data migration.

### Current State

The application currently uses:
- **Database**: SQLite (better-sqlite3)
- **ORM**: TypeORM
- **Configuration**: Environment variable `DATABASE_PATH` pointing to a file path (e.g., `tmp/db.sqlite`)
- **Location**: Database stored as a file in the `tmp/` directory (already in `.gitignore`)

### Target State

After migration:
- **Database**: PostgreSQL (latest version via Docker Compose)
- **ORM**: TypeORM (no changes needed, TypeORM supports PostgreSQL)
- **Configuration**: PostgreSQL connection string via environment variables
- **Location**: PostgreSQL data stored in a Docker volume mapped to a local directory (ignored by git)

## Goals

1. Replace SQLite with PostgreSQL for better production readiness
2. Set up Docker Compose with the latest PostgreSQL version
3. Ensure database data directory is properly ignored in git
4. Update application configuration to use PostgreSQL connection
5. Update seed script to work with PostgreSQL
6. Maintain all existing functionality without breaking changes

## Non-Goals

- Data migration from existing SQLite database (fresh start in development)
- Production deployment configuration (focus on local development)
- Database migration scripts (using TypeORM synchronize for development)

## Current State Analysis

### Database Configuration

**Location**: `apps/server/src/app/app.module.ts`

Current SQLite configuration:
```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    type: 'better-sqlite3',
    database: config.get('DATABASE_PATH'), // e.g., 'tmp/db.sqlite'
    synchronize: true,
    logging: true,
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
})
```

**Environment Variables**:
- `DATABASE_PATH`: File path to SQLite database (default: `tmp/db.sqlite`)
- Currently validated in `app.module.ts` with Joi schema
- Will be replaced with `DATABASE_URL` for PostgreSQL connection string

### Seed Script

**Location**: `scripts/seed.ts`

Current implementation:
- Uses TypeORM DataSource directly
- Connects to SQLite using `better-sqlite3`
- Reads database path from `DATABASE_PATH` environment variable
- Defaults to `tmp/db.sqlite`

### Dependencies

**Current**:
- `better-sqlite3`: ^12.5.0
- `@types/better-sqlite3`: ^7.6.13

**Required for PostgreSQL**:
- `pg`: PostgreSQL client for Node.js
- `@types/pg`: TypeScript types for pg

### Git Ignore

**Current**: `tmp/` directory is already ignored

**Required**: Add PostgreSQL data directory (e.g., `postgres-data/`) to `.gitignore`

## Functional Requirements

### FR1: Docker Compose Setup

**Description**: Create a `docker-compose.yml` file with PostgreSQL service

**Requirements**:
1. Use the latest PostgreSQL version available
2. Configure PostgreSQL with:
   - Database name: `fullstack_todo` (or configurable via env)
   - Username: `postgres` (or configurable via env)
   - Password: `postgres` (or configurable via env, default for dev)
   - Port: `5432` (standard PostgreSQL port)
3. Map PostgreSQL data directory to local folder `postgres-data/` in project root
4. Ensure data persistence across container restarts
5. Add health check for PostgreSQL service

**Acceptance Criteria**:
- `docker-compose up` starts PostgreSQL successfully
- Database persists data after container restart
- Can connect to database using connection string
- Health check passes

### FR2: Environment Variables Update

**Description**: Update environment variable configuration for PostgreSQL

**Requirements**:
1. Replace `DATABASE_PATH` with PostgreSQL connection variables:
   - `DATABASE_HOST`: PostgreSQL host (default: `localhost`)
   - `DATABASE_PORT`: PostgreSQL port (default: `5432`)
   - `DATABASE_USER`: PostgreSQL username (default: `postgres`)
   - `DATABASE_PASSWORD`: PostgreSQL password (default: `postgres`)
   - `DATABASE_NAME`: Database name (default: `fullstack_todo`)
2. Update Joi validation schema in `app.module.ts`
3. Update `.env.development` with new variables
4. Construct PostgreSQL connection string from environment variables

**Acceptance Criteria**:
- All environment variables are validated at startup
- Default values work for local development
- Connection string is correctly constructed
- Application starts and connects to PostgreSQL

### FR3: TypeORM Configuration Update

**Description**: Update TypeORM configuration to use PostgreSQL

**Requirements**:
1. Change `type` from `'better-sqlite3'` to `'postgres'`
2. Replace `database` with PostgreSQL connection configuration:
   - `host`: From `DATABASE_HOST`
   - `port`: From `DATABASE_PORT`
   - `username`: From `DATABASE_USER`
   - `password`: From `DATABASE_PASSWORD`
   - `database`: From `DATABASE_NAME`
3. Keep `synchronize: true` for development (schema auto-sync)
4. Keep `logging: true` for development
5. Keep `autoLoadEntities: true`

**Acceptance Criteria**:
- TypeORM connects to PostgreSQL successfully
- Schema synchronization works (tables created automatically)
- All existing entities work without modification
- Logging shows PostgreSQL queries

### FR4: Seed Script Update

**Description**: Update seed script to work with PostgreSQL

**Requirements**:
1. Change DataSource type from `'better-sqlite3'` to `'postgres'`
2. Update connection configuration to use PostgreSQL environment variables
3. Remove file path logic (no longer needed)
4. Update database path function to construct PostgreSQL connection config
5. Update documentation in `docs/scripts/SEED_SCRIPT.md`

**Acceptance Criteria**:
- Seed script connects to PostgreSQL
- Seed script creates users and todos successfully
- Seed script can be run multiple times (handles duplicates)
- Documentation reflects PostgreSQL usage

### FR5: Git Ignore Update

**Description**: Ensure PostgreSQL data directory is ignored

**Requirements**:
1. Add `postgres-data/` to `.gitignore`
2. Verify `tmp/` remains ignored (for any remaining SQLite files during transition)

**Acceptance Criteria**:
- `postgres-data/` directory is not tracked by git
- No database files are committed to repository

### FR6: Package Dependencies Update

**Description**: Update npm dependencies

**Requirements**:
1. Remove `better-sqlite3` and `@types/better-sqlite3` from dependencies
2. Add `pg` and `@types/pg` to dependencies
3. Update `package-lock.json`

**Acceptance Criteria**:
- `npm install` completes successfully
- No references to `better-sqlite3` in codebase
- PostgreSQL driver is available

## Technical Considerations

### Database Schema Compatibility

**Consideration**: SQLite and PostgreSQL have some differences in data types and features.

**Impact**: 
- TypeORM handles most differences automatically
- UUID generation works the same way
- Entity schemas should work without modification
- Need to verify any SQLite-specific code

**Action**: Review entity schemas for PostgreSQL compatibility:
- `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts`
- `libs/server/data-access-todo/src/lib/database/schemas/user.entity-schema.ts`

### Connection String Format

**PostgreSQL Connection String Format**:
```
postgresql://username:password@host:port/database
```

**TypeORM Configuration**:
Can use either:
1. Individual properties (host, port, username, password, database)
2. Connection string via `url` property

**Recommendation**: Use individual properties for better environment variable management and validation.

### Docker Compose Version

**Latest PostgreSQL Version**: As of 2026-01-20, PostgreSQL 16.x is the latest stable version.

**Docker Image**: Use `postgres:16` or `postgres:latest` for latest version.

### Data Persistence

**Volume Mapping**: Map PostgreSQL data directory to `postgres-data/` in project root.

**Docker Compose Configuration**:
```yaml
volumes:
  - ./postgres-data:/var/lib/postgresql/data
```

This ensures:
- Data persists when container is stopped
- Data is accessible for backups
- Data directory can be easily ignored in git

### Environment Variable Security

**Development**: Default values are acceptable for local development.

**Future Production**: Will need secure password management (not in scope for this PRD).

## Design Considerations

### Docker Compose File Location

**Location**: `docker-compose.yml` in project root

**Rationale**: Standard location, easy to find and use

### PostgreSQL Data Directory

**Location**: `postgres-data/` in project root

**Rationale**: 
- Clear naming convention
- Easy to add to `.gitignore`
- Consistent with existing `tmp/` directory pattern

### Environment Variable Naming

**Convention**: Use `DATABASE_URL` for PostgreSQL connection string

**Rationale**: 
- Standard format used by cloud platforms (Heroku, Railway, etc.)
- Single variable instead of multiple (host, port, user, password, database)
- TypeORM supports `url` property directly
- Format: `postgresql://user:password@host:port/database`
- More concise and easier to manage

## Implementation Notes

### Step 1: Docker Compose Setup

1. Create `docker-compose.yml` in project root
2. Configure PostgreSQL service with latest version
3. Set up volume mapping for data persistence
4. Add health check
5. Test with `docker-compose up -d`

### Step 2: Update Dependencies

1. Remove `better-sqlite3` and `@types/better-sqlite3`
2. Add `pg` and `@types/pg`
3. Run `npm install`

### Step 3: Update Environment Variables

1. Update `.env.development` with `DATABASE_URL` connection string
2. Update Joi validation schema in `app.module.ts`
3. Remove `DATABASE_PATH` validation
4. Add `DATABASE_URL` validation (string, required or with default)

### Step 4: Update TypeORM Configuration

1. Change `type` to `'postgres'`
2. Replace `database` with `url` property using `DATABASE_URL`
3. Update `useFactory` function in `app.module.ts`
4. Test connection

### Step 5: Update Seed Script

1. Change DataSource type to `'postgres'`
2. Update connection configuration to use `url` from `DATABASE_URL`
3. Remove file path logic
4. Update `getDatabasePath()` function (rename to `getDatabaseUrl()`)
5. Test seed script

### Step 6: Update Git Ignore

1. Add `postgres-data/` to `.gitignore`
2. Verify no database files are tracked

### Step 7: Update Documentation

1. Update `docs/scripts/SEED_SCRIPT.md`
2. Add Docker Compose usage instructions
3. Update any references to SQLite

### Step 8: Testing

1. Start PostgreSQL: `docker-compose up -d`
2. Start application: `npm run start:server`
3. Verify connection in logs
4. Run seed script: `npm run seed`
5. Verify data in database
6. Test API endpoints
7. Stop and restart containers to verify persistence

## Success Criteria

1. ✅ Docker Compose starts PostgreSQL successfully
2. ✅ Application connects to PostgreSQL on startup
3. ✅ All existing API endpoints work correctly
4. ✅ Seed script populates PostgreSQL database
5. ✅ Database data persists across container restarts
6. ✅ `postgres-data/` directory is ignored by git
7. ✅ No SQLite dependencies remain
8. ✅ All tests pass
9. ✅ Documentation is updated

## Risks and Mitigations

### Risk 1: TypeORM Entity Compatibility

**Risk**: Entity schemas may have SQLite-specific features that don't work with PostgreSQL.

**Mitigation**: 
- TypeORM handles most differences automatically
- Test all entities after migration
- Review entity schemas for PostgreSQL compatibility

### Risk 2: Connection Issues

**Risk**: Application may fail to connect to PostgreSQL if Docker container isn't running.

**Mitigation**:
- Add clear error messages
- Document Docker Compose requirement
- Add health checks in Docker Compose

### Risk 3: Data Loss During Migration

**Risk**: Since we're not migrating data, any existing SQLite data will be lost.

**Mitigation**:
- This is expected and acceptable for development
- Document that this is a fresh start
- Seed script provides initial data

## Open Questions

None at this time.

## References

- [TypeORM PostgreSQL Documentation](https://typeorm.io/data-source-options#postgres--cockroachdb-data-source-options)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS TypeORM Documentation](https://docs.nestjs.com/techniques/database)

## Appendix

### Example Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: fullstack-todo-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: fullstack_todo
    ports:
      - "5432:5432"
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Example Environment Variables

```env
# PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fullstack_todo
```

### Example TypeORM Configuration

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL'),
    synchronize: true,
    logging: true,
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
})
```
