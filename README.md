# Full Stack Todo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/nest?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Prerequisites

Before running the application, ensure you have:

- **Node.js** (v20 or higher recommended)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for PostgreSQL database)

## Getting Started

### 1. Install Dependencies

```sh
npm install
```

### 2. Start PostgreSQL Database

The application uses PostgreSQL as its database. You have two options:

**Option A: Automatic (Recommended)**

PostgreSQL will be started automatically when you run the server:

```sh
npx nx serve server
# or
npx nx run-many --target=serve --projects=server,client
```

**Option B: Manual**

Start PostgreSQL manually using Docker Compose:

```sh
docker-compose up -d
# or using Nx
npx nx postgres
```

This will start a PostgreSQL 16 container with:
- Database: `fullstack_todo`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

To verify PostgreSQL is running:

```sh
docker-compose ps
# or
npx nx postgres:logs
```

### 3. Seed the Database (Optional)

Populate the database with sample data:

```sh
npm run seed
```

### 4. Run the Application

See the [Run tasks](#run-tasks) section below for details on running the server and client.

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve server
```

To create a production bundle:

```sh
npx nx build server
```

To see all available targets to run for a project, run:

```sh
npx nx show project server
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Taskfile Commands

This project uses [Taskfile](https://taskfile.dev/) for convenient shortcuts for common development tasks. You can use `task --list` or just `task` to see all available commands.

**Note**: The project also includes a `Makefile` for backward compatibility, but Taskfile is the recommended tool.

### Running Applications

```sh
task server          # Run the server in development mode
task client          # Run the client in development mode
task run             # Run both server and client in parallel (uses nx run-many, automatically starts PostgreSQL)
task all             # Alias for 'task run'
task run-many TARGET=serve PROJECTS=server,client  # Alternative: use run-many directly
```

**Legacy Makefile support**: You can still use `make` commands if preferred (e.g., `make server`, `make run`).

### Testing

```sh
task test            # Run all tests
task test-server     # Run server tests only
task test-client     # Run client tests only
task e2e             # Run all e2e tests
task e2e-server      # Run server e2e tests
task e2e-client      # Run client e2e tests
```

**Note:** This project uses Husky to automatically run all tests before every commit. See [docs/test/GIT_HOOKS.md](docs/test/GIT_HOOKS.md) for more information about Git hooks.

### Building

```sh
task build           # Build all projects
task build-server    # Build server only
task build-client    # Build client only
```

### Linting

```sh
task lint            # Lint all projects
task lint-server     # Lint server only
task lint-client     # Lint client only
```

### Running Tasks on Multiple Projects

```sh
task run-many TARGET=test                    # Run test target on all projects
task run-many TARGET=build                   # Run build target on all projects
task run-many TARGET=lint PROJECTS=server,client  # Run lint on specific projects
```

### Utilities

```sh
task install        # Install dependencies
task clean          # Clean build artifacts and cache
task kill           # Stop all running server and client processes
task                # Show all available commands (or use 'task --list')
```

