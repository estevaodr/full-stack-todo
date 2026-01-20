# Task List: SQLite to PostgreSQL Migration

**PRD**: `tasks/prd-sqlite-to-postgresql-migration.md`  
**Date**: 2026-01-20  
**Status**: In Progress

## Relevant Files

- `docker-compose.yml` - Docker Compose configuration for PostgreSQL service (new file)
- `apps/server/src/app/app.module.ts` - Main application module containing TypeORM configuration
- `scripts/seed.ts` - Database seeding script that needs PostgreSQL connection
- `package.json` - NPM dependencies (remove SQLite, add PostgreSQL)
- `.env.development` - Development environment variables template
- `.gitignore` - Git ignore rules (add postgres-data directory)
- `docs/scripts/SEED_SCRIPT.md` - Seed script documentation
- `libs/server/data-access-todo/src/lib/database/schemas/to-do.entity-schema.ts` - Todo entity schema (verify PostgreSQL compatibility)
- `libs/server/data-access-todo/src/lib/database/schemas/user.entity-schema.ts` - User entity schema (verify PostgreSQL compatibility)

### Notes

- Entity schemas should work with PostgreSQL without modification (TypeORM handles differences)
- All database-related changes are in application configuration, not in business logic
- Tests should continue to work as they use mocked repositories

## Tasks

- [ ] 1.0 Set up Docker Compose with PostgreSQL
  - [x] 1.1 Create `docker-compose.yml` file in project root
  - [x] 1.2 Configure PostgreSQL service with latest version (postgres:16 or postgres:latest)
  - [x] 1.3 Set up environment variables for PostgreSQL (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
  - [x] 1.4 Configure port mapping (5432:5432)
  - [x] 1.5 Map PostgreSQL data directory to `./postgres-data:/var/lib/postgresql/data` volume
  - [x] 1.6 Add health check configuration using `pg_isready`
  - [x] 1.7 Test Docker Compose setup with `docker-compose up -d`
  - [x] 1.8 Verify PostgreSQL container starts successfully and health check passes
  - [x] 1.9 Verify data persistence by stopping and restarting container

- [ ] 2.0 Update npm dependencies (remove SQLite, add PostgreSQL)
  - [ ] 2.1 Remove `better-sqlite3` from dependencies in `package.json`
  - [ ] 2.2 Remove `@types/better-sqlite3` from devDependencies in `package.json`
  - [ ] 2.3 Add `pg` to dependencies in `package.json`
  - [ ] 2.4 Add `@types/pg` to devDependencies in `package.json`
  - [ ] 2.5 Run `npm install` to update `package-lock.json`
  - [ ] 2.6 Verify no references to `better-sqlite3` remain in codebase (search for imports/usage)
  - [ ] 2.7 Verify PostgreSQL driver is available and can be imported

- [ ] 3.0 Update environment variables and validation
  - [ ] 3.1 Update `.env.development` template with new PostgreSQL variables (DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME)
  - [ ] 3.2 Update Joi validation schema in `apps/server/src/app/app.module.ts` to replace `DATABASE_PATH` validation
  - [ ] 3.3 Add validation for `DATABASE_HOST` (string, default: 'localhost')
  - [ ] 3.4 Add validation for `DATABASE_PORT` (number, default: 5432)
  - [ ] 3.5 Add validation for `DATABASE_USER` (string, default: 'postgres')
  - [ ] 3.6 Add validation for `DATABASE_PASSWORD` (string, default: 'postgres')
  - [ ] 3.7 Add validation for `DATABASE_NAME` (string, default: 'fullstack_todo')
  - [ ] 3.8 Remove `DATABASE_PATH` from validation schema
  - [ ] 3.9 Test environment variable validation at application startup

- [ ] 4.0 Update TypeORM configuration for PostgreSQL
  - [ ] 4.1 Change `type` from `'better-sqlite3'` to `'postgres'` in `apps/server/src/app/app.module.ts`
  - [ ] 4.2 Replace `database` property with PostgreSQL connection configuration object
  - [ ] 4.3 Add `host` property using `config.get('DATABASE_HOST')`
  - [ ] 4.4 Add `port` property using `config.get('DATABASE_PORT')`
  - [ ] 4.5 Add `username` property using `config.get('DATABASE_USER')`
  - [ ] 4.6 Add `password` property using `config.get('DATABASE_PASSWORD')`
  - [ ] 4.7 Add `database` property using `config.get('DATABASE_NAME')`
  - [ ] 4.8 Keep `synchronize: true` for development
  - [ ] 4.9 Keep `logging: true` for development
  - [ ] 4.10 Keep `autoLoadEntities: true`
  - [ ] 4.11 Update code comments to reflect PostgreSQL instead of SQLite
  - [ ] 4.12 Test TypeORM connection to PostgreSQL on application startup
  - [ ] 4.13 Verify schema synchronization works (tables created automatically)
  - [ ] 4.14 Verify logging shows PostgreSQL queries

- [ ] 5.0 Update seed script for PostgreSQL
  - [ ] 5.1 Change DataSource `type` from `'better-sqlite3'` to `'postgres'` in `scripts/seed.ts`
  - [ ] 5.2 Replace `getDatabasePath()` function with `getDatabaseConfig()` function
  - [ ] 5.3 Update `getDatabaseConfig()` to return PostgreSQL connection configuration object
  - [ ] 5.4 Read PostgreSQL environment variables (DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME)
  - [ ] 5.5 Provide default values matching Docker Compose configuration
  - [ ] 5.6 Update DataSource configuration to use PostgreSQL connection config instead of file path
  - [ ] 5.7 Remove file path logic and directory creation code (no longer needed)
  - [ ] 5.8 Update console log messages to reflect PostgreSQL connection instead of file path
  - [ ] 5.9 Update error messages to reference PostgreSQL instead of SQLite
  - [ ] 5.10 Test seed script connects to PostgreSQL successfully
  - [ ] 5.11 Test seed script creates users and todos successfully
  - [ ] 5.12 Test seed script handles duplicate data gracefully
  - [ ] 5.13 Update `docs/scripts/SEED_SCRIPT.md` to reflect PostgreSQL usage
  - [ ] 5.14 Update documentation to reference Docker Compose requirement
  - [ ] 5.15 Update documentation to remove SQLite-specific instructions

- [ ] 6.0 Update gitignore and documentation
  - [ ] 6.1 Add `postgres-data/` to `.gitignore` file
  - [ ] 6.2 Verify `tmp/` remains in `.gitignore` (for any remaining SQLite files during transition)
  - [ ] 6.3 Test that `postgres-data/` directory is not tracked by git
  - [ ] 6.4 Verify no database files are committed to repository
  - [ ] 6.5 Review and update any other documentation that references SQLite
  - [ ] 6.6 Add Docker Compose usage instructions to README or relevant documentation
  - [ ] 6.7 Update any setup/installation documentation to include Docker Compose step
