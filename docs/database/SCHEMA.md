# PostgreSQL Schema

Tables, column types, and constraints. The app uses TypeORM with PostgreSQL; schema is driven by entity schemas (see [ENTITIES.md](./ENTITIES.md)).

## Connection

- **Database**: PostgreSQL
- **Config**: `DATABASE_URL` (e.g. `postgresql://user:password@host:port/database`)
- **ORM**: TypeORM with `autoLoadEntities: true` and `synchronize: true` in development (see [MIGRATIONS.md](./MIGRATIONS.md)).

## Tables

### `user`

| Column     | PostgreSQL type | Nullable | Default | Notes                    |
|------------|-----------------|----------|---------|--------------------------|
| `id`       | `uuid`          | No       | `gen_random_uuid()` | Primary key        |
| `email`    | `character varying` | No   | —       | Unique                  |
| `password` | `character varying` | No  | —       | Stored hashed           |

- **Primary key**: `id`
- **Unique**: `email`

### `todo`

| Column        | PostgreSQL type | Nullable | Default | Notes           |
|---------------|-----------------|----------|---------|-----------------|
| `id`          | `uuid`          | No       | `gen_random_uuid()` | Primary key |
| `title`       | `character varying` | No   | —       |                 |
| `user_id`     | `uuid`          | Yes      | —       | FK → `user.id`  |
| `description` | `character varying` | Yes  | —       |                 |
| `completed`   | `boolean`       | No       | `false` |                 |

- **Primary key**: `id`
- **Foreign key**: `user_id` → `user(id)` (on delete cascade via TypeORM relation)
- **Unique**: `UNIQUE_TITLE_USER` on `(title, user_id)` — see below.

## Unique constraints and indexes

PostgreSQL creates unique indexes for unique constraints; primary keys get implicit unique indexes.

| Table  | Constraint / index      | Columns      | Purpose |
|--------|-------------------------|-------------|---------|
| `user` | Unique on `email`       | `email`     | One account per email; enables fast lookup by email. |
| `todo` | **UNIQUE_TITLE_USER**   | `title`, `user_id` | Per-user title uniqueness: same user cannot have two todos with the same title; different users can reuse titles. |

- **UNIQUE_TITLE_USER**: Defined in `ToDoEntitySchema` (`to-do.entity-schema.ts`) under `uniques: [{ name: 'UNIQUE_TITLE_USER', columns: ['title', 'user_id'] }]`. TypeORM creates the corresponding unique constraint (and index) on the `todo` table.

No additional application-defined indexes beyond primary keys and the above unique constraints. Queries by `user_id` on `todo` benefit from the unique index on `(title, user_id)` when filtering by user.

## Column type mapping (TypeORM → PostgreSQL)

| TypeORM / Entity | PostgreSQL        |
|------------------|--------------------|
| `uuid`           | `uuid`             |
| `String`         | `character varying`|
| `boolean`        | `boolean`          |

Schema is created/updated by TypeORM from `libs/server/data-access-todo` entity schemas; for production, use migrations instead of `synchronize`.
