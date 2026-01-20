# FullStackTodo

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

## Makefile Commands

This project includes a Makefile with convenient shortcuts for common development tasks. You can use `make help` to see all available commands.

### Running Applications

```sh
make server          # Run the server in development mode
make client          # Run the client in development mode
make run             # Run both server and client in parallel (uses nx run-many)
make all             # Alias for 'make run'
make run-many TARGET=serve PROJECTS=server,client  # Alternative: use run-many directly
```

### Testing

```sh
make test            # Run all tests
make test-server     # Run server tests only
make test-client     # Run client tests only
make e2e             # Run all e2e tests
make e2e-server      # Run server e2e tests
make e2e-client      # Run client e2e tests
```

**Note:** This project uses Husky to automatically run all tests before every commit. See [docs/test/GIT_HOOKS.md](docs/test/GIT_HOOKS.md) for more information about Git hooks.

### Building

```sh
make build           # Build all projects
make build-server    # Build server only
make build-client    # Build client only
```

### Linting

```sh
make lint            # Lint all projects
make lint-server     # Lint server only
make lint-client     # Lint client only
```

### Running Tasks on Multiple Projects

```sh
make run-many TARGET=test                    # Run test target on all projects
make run-many TARGET=build                   # Run build target on all projects
make run-many TARGET=lint PROJECTS=server,client  # Run lint on specific projects
```

### Utilities

```sh
make install        # Install dependencies
make clean          # Clean build artifacts and cache
make kill           # Stop all running server and client processes
make help           # Show all available commands
```

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/nest:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/nest?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
