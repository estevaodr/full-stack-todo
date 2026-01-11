/**
 * Unit Tests for ServerFeatureTodoController
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the controller separately from the database, network, and other parts of the app.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like a database or service) that we control.
 * Instead of connecting to a real database (slow, requires setup), we use a mock that
 * pretends to be the database. This makes tests:
 * - Fast (no database queries)
 * - Reliable (no network issues)
 * - Isolated (tests don't affect each other)
 */

// NestJS testing utilities - helps us create a test environment
import { Test } from '@nestjs/testing';
// TypeORM utilities - helps us mock the database repository
import { getRepositoryToken } from '@nestjs/typeorm';
// TypeORM Repository type - the interface for database operations
import { Repository } from 'typeorm';
// The controller we're testing
import { ServerFeatureTodoController } from './server-feature-todo.controller';
// The service the controller uses (we'll mock its methods)
import { ServerFeatureTodoService } from './server-feature-todo.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ToDoEntitySchema } from '@full-stack-todo/server/data-access-todo';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ITodo } from '@full-stack-todo/shared/domain';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { UpdateTodoDto } from '@full-stack-todo/shared';

/**
 * MockType - A TypeScript utility type for creating mock objects
 * 
 * WHAT IS THIS?
 * =============
 * This creates a type where every property is optional and is a Jest mock function.
 * 
 * HOW IT WORKS:
 * - `[P in keyof T]` - For each property (P) in type T
 * - `?:` - Make it optional (the property might not exist)
 * - `jest.Mock<unknown>` - Each property is a Jest mock function
 * 
 * EXAMPLE:
 * If T is { find: Function, save: Function }, then MockType<T> is:
 * { find?: jest.Mock, save?: jest.Mock }
 */
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

/**
 * repositoryMockFactory - Creates a fake database repository for testing
 * 
 * WHAT IS THIS?
 * =============
 * This function creates a fake version of a TypeORM Repository. Instead of talking
 * to a real database, it returns fake data that we control.
 * 
 * WHY DO WE NEED THIS?
 * ====================
 * The service needs a repository to work, but in tests we don't want to:
 * - Set up a real database
 * - Wait for slow database queries
 * - Risk tests affecting each other
 * 
 * HOW IT WORKS:
 * ============
 * - `jest.fn()` creates a mock function that we can control
 * - Each method (find, save, etc.) is a mock that returns fake data
 * - We can later tell these mocks what to return in each test
 * 
 * WHAT DO THESE METHODS DO?
 * =========================
 * - findOne: Find one record (returns the entity passed to it)
 * - findOneBy: Find one record by criteria (returns empty object by default)
 * - save: Save a record (returns the entity passed to it)
 * - find: Find multiple records (returns the entities passed to it)
 * - remove: Delete a record (returns the entity passed to it)
 * - delete: Delete operation (returns null)
 */
export const repositoryMockFactory: () => MockType<Repository<ITodo>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    findOneBy: jest.fn(() => ({})),
    save: jest.fn((entity) => entity),
    findOneOrFail: jest.fn(() => ({})),
    delete: jest.fn(() => null),
    find: jest.fn((entities) => entities),
    remove: jest.fn((entity) => entity),
  })
);

/**
 * createMockTodo - Helper function to create fake todo items for testing
 * 
 * WHAT IS THIS?
 * =============
 * A utility function that creates a fake todo item with random data.
 * 
 * WHY DO WE NEED IT?
 * ==================
 * Instead of manually creating todo objects in every test, we use this helper.
 * It makes tests easier to read and maintain.
 * 
 * HOW IT WORKS:
 * ============
 * - Generates a random ID using Math.random() and base36 encoding
 * - Creates random title and description
 * - Sets completed to false by default
 * 
 * EXAMPLE USAGE:
 * const todo = createMockTodo();
 * // todo = { id: "todo-abc123", title: "Test Todo xyz", ... }
 */
function createMockTodo(): ITodo {
  return {
    id: `todo-${Math.random().toString(36).substr(2, 9)}`,
    title: `Test Todo ${Math.random().toString(36).substr(2, 5)}`,
    description: `Test Description ${Math.random().toString(36).substr(2, 5)}`,
    completed: false,
  };
}

/**
 * Test Suite: ServerFeatureTodoController
 * 
 * WHAT IS A TEST SUITE?
 * =====================
 * A group of related tests. All tests in this describe() block test the controller.
 * 
 * TEST STRUCTURE:
 * ==============
 * 1. Setup (beforeEach) - Prepare the test environment
 * 2. Tests (it blocks) - Individual test cases
 * 3. Assertions (expect) - Check that results are correct
 */
describe('ServerFeatureTodoController', () => {
  // These variables will hold our controller and service instances
  // We declare them here so all tests can use them
  let controller: ServerFeatureTodoController;
  let service: ServerFeatureTodoService;

  /**
   * beforeEach - Runs before EACH test in this suite
   * 
   * WHAT DOES THIS DO?
   * ==================
   * Sets up a fresh test environment for every test. This ensures:
   * - Tests don't interfere with each other
   * - Each test starts with a clean slate
   * - Mocks are reset between tests
   * 
   * HOW IT WORKS:
   * ============
   * 1. Test.createTestingModule() - Creates a NestJS module just for testing
   * 2. providers - Tells NestJS what services to create
   *    - ServerFeatureTodoService - The real service (but it will use a mock repository)
   *    - getRepositoryToken() - Tells NestJS to use our mock instead of real repository
   * 3. controllers - Tells NestJS which controller to test
   * 4. .compile() - Builds the test module
   * 5. module.get() - Gets instances of the controller and service
   * 
   * DEPENDENCY INJECTION:
   * ====================
   * NestJS automatically "injects" dependencies. When the controller needs the service,
   * or the service needs the repository, NestJS provides them automatically.
   * We're telling NestJS: "When you need a repository, use our mock instead of a real one."
   */
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerFeatureTodoService,
        {
          // This tells NestJS: "When someone asks for the repository token,
          // use our mock factory instead of creating a real repository"
          provide: getRepositoryToken(ToDoEntitySchema),
          useFactory: repositoryMockFactory,
        },
      ],
      controllers: [ServerFeatureTodoController],
    }).compile();

    // Get instances from the test module
    // These are the same objects that would be used in the real app,
    // but with mocked dependencies
    controller = module.get(ServerFeatureTodoController);
    service = module.get(ServerFeatureTodoService);
  });

  /**
   * Test: GET /api/v1/todos - Should return an array of todos
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * We're testing that when someone calls getAll() on the controller,
   * it returns an array of todo items for the authenticated user.
   * 
   * HOW DOES IT WORK?
   * ================
   * 1. We "spy" on the service's getAll() method
   *    - A spy watches a function and can control what it returns
   *    - We tell it to return a Promise with 5 fake todos
   * 2. We call the controller's getAll() method with userId
   *    - In the real app, @ReqUserId() extracts userId from the JWT token
   *    - In tests, we pass it directly as a parameter
   * 3. We check (assert) that the result is an array with 5 items
   * 
   * WHY MOCK THE SERVICE?
   * ====================
   * We're testing the CONTROLLER, not the service. By mocking the service,
   * we ensure that:
   * - If the service has bugs, it doesn't break this test
   * - We're only testing the controller's logic
   * - The test runs faster (no database calls)
   */
  it('should return an array of to-do items for the authenticated user', async () => {
    const userId = 'user-123';
    // Create a spy that watches service.getAll() and makes it return fake data
    // mockReturnValue() tells Jest: "When getAll() is called, return this Promise"
    jest.spyOn(service, 'getAll').mockReturnValue(
      new Promise((res) => {
        // Create an array of 5 fake todos and resolve the Promise with it
        res(Array.from({ length: 5 }).map(() => createMockTodo()));
      })
    );

    // Call the controller method with userId
    // In the real app, @ReqUserId() extracts userId from the JWT token
    const res = await controller.getAll(userId);

    // ASSERTIONS - Check that the result is what we expect
    // expect() is Jest's way of checking values
    // .toBe() checks for exact equality (===)
    expect(Array.isArray(res)).toBe(true); // Make sure it's an array
    expect(res.length).toBe(5); // Make sure it has 5 items
    // Verify that the service was called with the correct userId
    expect(service.getAll).toHaveBeenCalledWith(userId);
  });

  /**
   * Test: GET /api/v1/todos/:id - Should return a single todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that getOne() returns a single todo item when given an ID for the authenticated user.
   */
  it('should return a single to-do item for the authenticated user', async () => {
    const userId = 'user-123';
    // Create a fake todo item
    const todo = createMockTodo();
    
    // Mock the service to return our fake todo
    jest.spyOn(service, 'getOne').mockReturnValue(
      new Promise((res) => {
        res(todo);
      })
    );

    // Call the controller method with userId and the todo's ID
    // In the real app, @ReqUserId() extracts userId from the JWT token
    const res = await controller.getOne(userId, todo.id);

    // Check that we got back the same todo
    expect(res).toEqual(todo); // .toEqual() does deep comparison (checks all properties)
    expect(res.id).toBe(todo.id); // Double-check the ID matches
    // Verify that the service was called with the correct userId and id
    expect(service.getOne).toHaveBeenCalledWith(userId, todo.id);
  });

  /**
   * Test: POST /api/v1/todos - Should create a new todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that create() accepts todo data and returns the created todo for the authenticated user.
   */
  it('should create a new to-do item for the authenticated user', async () => {
    const userId = 'user-123';
    // Create a fake todo that will be "created"
    const newTodo = createMockTodo();
    
    // Mock the service to return our fake todo when create() is called
    jest.spyOn(service, 'create').mockReturnValue(
      new Promise((res) => {
        res(newTodo);
      })
    );

    // Call the controller's create() method with userId and just title and description
    // In the real app, @ReqUserId() extracts userId from the JWT token
    // (The service will add the ID, completed status, and user_id)
    const res = await controller.create(userId, {
      title: newTodo.title,
      description: newTodo.description,
    });

    // Check that the created todo matches what we expected
    expect(res).toEqual(newTodo);
    expect(res.title).toBe(newTodo.title);
    // Verify that the service was called with the correct userId and data
    expect(service.create).toHaveBeenCalledWith(userId, {
      title: newTodo.title,
      description: newTodo.description,
    });
  });

  /**
   * Test: PATCH /api/v1/todos/:id - Should update a todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that update() can change properties of an existing todo for the authenticated user.
   * 
   * WHAT IS PATCH?
   * =============
   * PATCH is an HTTP method for partial updates (changing only some fields).
   * Unlike PUT (which replaces the whole object), PATCH only updates what you send.
   */
  it('should allow updates to a single todo for the authenticated user', async () => {
    const userId = 'user-123';
    // Create a fake todo
    const todo = createMockTodo();
    const newTitle = 'newTitle'; // The new title we want to set

    // Mock the service to return the todo with the updated title
    // The spread operator (...) copies all properties, then we override title
    jest
      .spyOn(service, 'update')
      .mockReturnValue(
        new Promise((res) => {
          res({ ...todo, title: newTitle }); // { id: "...", title: "newTitle", ... }
        })
      );

    // Call update with userId, the todo ID and the new title
    // In the real app, @ReqUserId() extracts userId from the JWT token
    // UpdateTodoDto allows partial updates (only title, only description, etc.)
    const updated = await controller.update(userId, todo.id, { title: newTitle } as UpdateTodoDto);

    // Check that the title was actually updated
    expect(updated.title).toBe(newTitle);
    // Verify that the service was called with the correct userId, id, and data
    expect(service.update).toHaveBeenCalledWith(userId, todo.id, { title: newTitle });
  });

  /**
   * Test: PUT /api/v1/todos/:id - Should upsert a todo
   * 
   * WHAT IS UPSERT?
   * ===============
   * "Upsert" = Update if exists, Insert if not.
   * If a todo with that ID exists, update it. Otherwise, create a new one.
   */
  it('should upsert a to-do item for the authenticated user', async () => {
    const userId = 'user-123';
    const todo = createMockTodo();
    
    // Mock the service to return the todo
    jest.spyOn(service, 'upsert').mockReturnValue(
      new Promise((res) => {
        res(todo);
      })
    );

    // Call upsert with userId and a complete todo object (including ID)
    // In the real app, @ReqUserId() extracts userId from the JWT token
    const res = await controller.upsertOne(userId, todo);

    // Check that we got back the same todo
    expect(res).toEqual(todo);
    // Verify that the service was called with the correct userId and todo
    expect(service.upsert).toHaveBeenCalledWith(userId, todo);
  });

  /**
   * Test: DELETE /api/v1/todos/:id - Should delete a todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that delete() removes a todo for the authenticated user and doesn't return anything (void).
   * 
   * NOTE ON ASSERTIONS:
   * ==================
   * Since delete() returns void (nothing), we can't check the return value.
   * Instead, we check that the service method was called with the correct userId and ID.
   */
  it('should delete a to-do item for the authenticated user', async () => {
    const userId = 'user-123';
    const todo = createMockTodo();
    
    // Mock the service's delete method to return a resolved Promise
    // (delete() doesn't return anything, so we resolve with undefined)
    jest.spyOn(service, 'delete').mockReturnValue(
      new Promise((res) => {
        res(undefined);
      })
    );

    // Call delete with userId and the todo's ID
    // In the real app, @ReqUserId() extracts userId from the JWT token
    await controller.delete(userId, todo.id);

    // Check that the service's delete method was called with the correct userId and ID
    // toHaveBeenCalledWith() verifies that a mock function was called with specific arguments
    expect(service.delete).toHaveBeenCalledWith(userId, todo.id);
  });
});
