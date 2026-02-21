# Migration Strategy and TypeORM Synchronize

How the database schema is managed: development uses TypeORM `synchronize`; production should use migrations.

## Current setup

- **ORM**: TypeORM with NestJS (`TypeOrmModule.forRootAsync`).
- **Config**: `apps/server/src/app/app.module.ts` (and `scripts/seed.ts` for seeding).
- **Entities**: `libs/server/data-access-todo/src/lib/database/schemas/` — see [ENTITIES.md](./ENTITIES.md) and [SCHEMA.md](./SCHEMA.md).

## Development: `synchronize: true`

In development the server uses **`synchronize: true`**:

- TypeORM creates or updates tables to match entity schemas on startup.
- No migration files are required for local or dev environments.
- **Risk**: Schema changes can alter or drop columns/tables; use only with dev data or disposable databases.

**Where it is set:**

- `apps/server/src/app/app.module.ts` — `TypeOrmModule.forRootAsync` → `useFactory` → `synchronize: true`.
- `scripts/seed.ts` — `synchronize: true` so the seed script can create/update schema before inserting data.

## Production: use migrations

**In production, set `synchronize: false`** and rely on **migrations** to change the schema. This gives:

- Controlled, versioned schema changes.
- No automatic drops or unexpected alters on app startup.
- Rollback and audit via migration history.

### Recommended approach

1. **Disable synchronize in production**  
   Use env-based config (e.g. `synchronize: process.env.NODE_ENV !== 'production'`) or a dedicated env var so production never runs with `synchronize: true`.

2. **Generate migrations from entities**  
   Use TypeORM CLI to generate migration files from entity diff, for example:
   ```bash
   npx typeorm migration:generate -d path/to-data-source.js -n MigrationName
   ```
   Data source must point at the same DB (or a copy) and list the same entities as the app.

3. **Run migrations on deploy**  
   Before starting the app, run:
   ```bash
   npx typeorm migration:run -d path/to-data-source.js
   ```
   Integrate this step into your CI/CD or startup script.

4. **Do not run `synchronize: true` in production**  
   Avoid any code path that enables `synchronize` when `NODE_ENV === 'production'` or in production-like environments.

## Migration workflow (when you adopt migrations)

1. Change entity schemas in `libs/server/data-access-todo/src/lib/database/schemas/`.
2. Generate a migration: `npx typeorm migration:generate -d <data-source> -n DescribeChange`.
3. Review the generated SQL; adjust if needed (e.g. data backfills, renames).
4. Commit the migration file.
5. Run migrations in target environment before deploying the new app version.

## Seed script

`scripts/seed.ts` uses `synchronize: true` so the schema exists before seeding. Use this only against dev or disposable databases. For production, schema should already be applied via migrations; the seed script can be updated to assume schema exists and set `synchronize: false`.

## Summary

| Environment   | `synchronize` | Schema updates              |
|---------------|----------------|-----------------------------|
| Development   | `true`        | Auto from entities on start |
| Production    | `false`       | Migrations only             |

Entity source of truth: `libs/server/data-access-todo` entity schemas. For table/column reference, see [SCHEMA.md](./SCHEMA.md).
