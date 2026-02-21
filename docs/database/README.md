# Database Documentation

Overview of the Full Stack Todo application database: PostgreSQL schema, TypeORM entities, and migration strategy.

## Overview

The application uses **PostgreSQL** with **TypeORM** (EntitySchema). The backend is NestJS; entities live in `libs/server/data-access-todo`. Two main entities:

- **User** – Authentication and ownership (id, email, password, todos relation).
- **Todo** – Todo items (id, title, description, completed, user relation).

Connection is configured via `DATABASE_URL` in the server app.

## Navigation

| Document | Description |
|----------|-------------|
| [ERD.md](./ERD.md) | Entity Relationship Diagram (Mermaid) – User and Todo entities |
| [ENTITIES.md](./ENTITIES.md) | Entity definitions – User and Todo columns, relations, and cascade behaviors |
| [SCHEMA.md](./SCHEMA.md) | PostgreSQL schema – tables, column types, and DDL |
| [MIGRATIONS.md](./MIGRATIONS.md) | Migration strategy and TypeORM `synchronize` notes |

## Quick reference

- **User table**: `user` (id UUID PK, email unique, password, one-to-many todos).
- **Todo table**: `todo` (id UUID PK, title, user_id FK, description, completed; unique constraint on title + user_id).
- **Cascade**: Deleting a user cascades to their todos.
