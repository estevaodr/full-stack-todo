/**
 * Unit Tests for Api Service (Data Access Library)
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the Api service separately from the actual HTTP network calls, backend server,
 * and other parts of the app.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 5. Ensure API endpoints are called correctly with the right parameters
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like HttpClient) that we control.
 * Instead of making real HTTP requests (slow, requires network, backend server), we use
 * a mock that pretends to be HttpClient. This makes tests:
 * - Fast (no network calls)
 * - Reliable (no network issues or server downtime)
 * - Isolated (tests don't affect each other)
 * - Predictable (we control what the mock returns)
 * 
 * HOW DO WE MOCK HTTPCLIENT?
 * ==========================
 * We use `jest.spyOn()` to watch HttpClient methods and `mockReturnValue()` to tell them
 * what to return. Since HttpClient returns Observables, we wrap our fake data with `of()`
 * from RxJS to create an Observable that immediately emits our test data.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Api } from './api';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ICreateTodo, ITodo, IUpdateTodo, IUpsertTodo } from '@full-stack-todo/shared/domain';

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
 * It makes tests easier to read and maintain. If the ITodo interface changes,
 * we only need to update this one function instead of every test.
 * 
 * HOW IT WORKS:
 * ============
 * - Generates a random ID using Math.random() and base36 encoding
 * - Creates random title and description to ensure each test uses unique data
 * - Sets completed to false by default (can be overridden in tests if needed)
 * 
 * EXAMPLE USAGE:
 * const todo = createMockTodo();
 * // todo = { id: "todo-abc123", title: "Test Todo xyz", description: "Test Description abc", completed: false }
 * 
 * @returns {ITodo} A mock todo item with random data
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
 * Test Suite: Api Service
 * 
 * WHAT IS A TEST SUITE?
 * =====================
 * A group of related tests. All tests in this describe() block test the Api service.
 * 
 * TEST STRUCTURE:
 * ==============
 * 1. Setup (beforeEach) - Prepare the test environment
 * 2. Tests (it blocks) - Individual test cases
 * 3. Assertions (expect) - Check that results are correct
 * 
 * WHAT DOES BEFOREEACH DO?
 * =========================
 * The `beforeEach` function runs before every test. It sets up:
 * - TestBed: Angular's testing framework that creates a test environment
 * - HttpClientTestingModule: Provides a fake HttpClient for testing
 * - Service instance: The Api service we're testing
 * - HttpClient reference: So we can spy on and mock its methods
 */
describe('Api', () => {
  let service: Api;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // In the TestBed setup for this spec file, I used the "old" method of importing 
      // testing modules instead of using provides such as provideHttpClient().
      // Either way works at this time, but the generators still use the traditional imports.
      // 
      // HttpClientTestingModule provides a fake HttpClient that we can control in tests.
      // It doesn't make real HTTP requests - instead, we tell it what to return.
      imports: [HttpClientTestingModule],
      providers: [Api],
    });

    // Get references to the service and HttpClient so we can use them in tests
    service = TestBed.inject(Api);
    http = TestBed.inject(HttpClient);
  });

  /**
   * Test: GET /api/v1/todos - Should get a list of to-do items
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that getAllToDoItems() correctly calls the GET endpoint and returns
   * an array of todo items.
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create fake todo data (array of 5 todos)
   * 2. Mock HttpClient.get() to return our fake data wrapped in an Observable
   * 3. Call the service method and subscribe to the Observable
   * 4. Verify the response matches our fake data
   * 5. Verify HttpClient.get() was called exactly once
   * 
   * WHY USE `done` CALLBACK?
   * ========================
   * This test differs from the backend's unit tests in that instead of using
   * `async ()` for the callback, we define a callback method `done` that we can
   * call when we choose. This is necessary because Observables are asynchronous,
   * and we need to tell Jest when our test is complete (after the Observable emits).
   * 
   * WHAT IS `of()`?
   * ===============
   * `of()` is an RxJS operator that creates an Observable that immediately emits
   * the value(s) you pass to it. Since HttpClient returns Observables, we need to
   * wrap our fake data with `of()` to match that return type.
   */
  it('should get a list of to-do items', (done) => {
    const todos: ITodo[] = Array.from({ length: 5 }).map(() =>
      createMockTodo()
    );
    
    /**
     * This should look familiar at this point - Jest will monitor
     * HttpClient for calls to it's `get()` method and return whatever
     * value we provide. Since HttpClient returns Observables, we
     * need to wrap our response payload with `of()`
     */
    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(todos));
    
    /**
     * Calling `subscribe()` on the service's method will cause it
     * to run, thus emitting the value we mocked above. As you can
     * see, we manually call the `done` callback once we've
     * completed our checks.
     */
    service.getAllToDoItems().subscribe({
      next: (val) => {
        expect(val).toStrictEqual(todos);
        expect(val.length).toEqual(todos.length);
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: GET /api/v1/todos/:id - Should get a single todo item by ID
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that getToDoById() correctly calls the GET endpoint with the todo ID
   * in the URL and returns a single todo item.
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create a fake todo item
   * 2. Mock HttpClient.get() to return our fake todo wrapped in an Observable
   * 3. Call the service method with the todo's ID
   * 4. Verify the response matches our fake todo
   * 5. Verify HttpClient.get() was called with the correct URL including the ID
   */
  it('should get a single to-do item by ID', (done) => {
    const todo = createMockTodo();
    
    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(todo));
    
    service.getToDoById(todo.id).subscribe({
      next: (val) => {
        expect(val).toStrictEqual(todo);
        expect(val.id).toBe(todo.id);
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
    expect(httpSpy).toHaveBeenCalledWith(`/api/v1/todos/${todo.id}`);
  });

  /**
   * Test: POST /api/v1/todos - Should create a new todo item
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that createToDo() correctly calls the POST endpoint with the todo data
   * in the request body and returns the newly created todo (with server-generated ID).
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create a fake todo item (this represents what the server will return)
   * 2. Create ICreateTodo data (only title and description - no ID yet)
   * 3. Mock HttpClient.post() to return our fake todo wrapped in an Observable
   * 4. Call the service method with the create data
   * 5. Verify the response matches our fake todo
   * 6. Verify HttpClient.post() was called with the correct URL and body
   * 
   * WHAT IS ICreateTodo?
   * ====================
   * ICreateTodo is a type that only includes 'title' and 'description' from ITodo.
   * The 'id' is excluded because it will be generated by the server, and 'completed'
   * is excluded because new todos always start as incomplete.
   */
  it('should create a new to-do item', (done) => {
    const newTodo = createMockTodo();
    const createData: ICreateTodo = {
      title: newTodo.title,
      description: newTodo.description,
    };
    
    const httpSpy = jest.spyOn(http, 'post').mockReturnValue(of(newTodo));
    
    service.createToDo(createData).subscribe({
      next: (val) => {
        expect(val).toStrictEqual(newTodo);
        expect(val.title).toBe(createData.title);
        expect(val.description).toBe(createData.description);
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
    expect(httpSpy).toHaveBeenCalledWith(`/api/v1/todos`, createData);
  });

  /**
   * Test: PATCH /api/v1/todos/:id - Should update an existing todo item
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that updateToDo() correctly calls the PATCH endpoint with the todo ID
   * in the URL and partial update data in the request body, then returns the updated todo.
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create a fake todo item (the original)
   * 2. Create IUpdateTodo data (only the fields we want to update)
   * 3. Create an updated todo by merging the original with the update data
   * 4. Mock HttpClient.patch() to return the updated todo wrapped in an Observable
   * 5. Call the service method with the todo ID and update data
   * 6. Verify the response matches our updated todo
   * 7. Verify HttpClient.patch() was called with the correct URL and body
   * 
   * WHAT IS PATCH?
   * ==============
   * PATCH is an HTTP method for partial updates. Unlike PUT (which replaces the entire
   * object), PATCH allows you to send only the fields you want to update. This is more
   * efficient and follows REST best practices.
   * 
   * WHAT IS IUpdateTodo?
   * ====================
   * IUpdateTodo is a type that makes all fields optional (except 'id' which can't be changed).
   * This allows updating just the title, or just completed status, or any combination of fields.
   */
  it('should update an existing to-do item', (done) => {
    const todo = createMockTodo();
    const updateData: IUpdateTodo = {
      title: 'Updated Title',
      completed: true,
    };
    const updatedTodo = { ...todo, ...updateData };
    
    const httpSpy = jest.spyOn(http, 'patch').mockReturnValue(of(updatedTodo));
    
    service.updateToDo(todo.id, updateData).subscribe({
      next: (val) => {
        expect(val).toStrictEqual(updatedTodo);
        expect(val.title).toBe(updateData.title);
        expect(val.completed).toBe(updateData.completed);
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
    expect(httpSpy).toHaveBeenCalledWith(`/api/v1/todos/${todo.id}`, updateData);
  });

  /**
   * Test: PUT /api/v1/todos/:id - Should create or update a todo item (upsert)
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that createOrUpdateToDo() correctly calls the PUT endpoint with the todo ID
   * in the URL and the complete todo object in the request body, then returns the created/updated todo.
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create a fake todo item (complete with all fields including ID)
   * 2. Mock HttpClient.put() to return our fake todo wrapped in an Observable
   * 3. Call the service method with the todo ID and complete todo data
   * 4. Verify the response matches our fake todo
   * 5. Verify HttpClient.put() was called with the correct URL and body
   * 
   * WHAT IS UPSERT?
   * ===============
   * "Upsert" means "update if exists, insert if not" - a common database operation.
   * If a todo with the given ID exists, it will be updated. If it doesn't exist,
   * a new todo will be created with that ID.
   * 
   * WHAT IS PUT?
   * ============
   * PUT is an HTTP method for full replacement. Unlike PATCH (which does partial updates),
   * PUT requires you to send the complete object. The server will either:
   * - Replace an existing todo entirely if the ID exists
   * - Create a new todo with the provided ID if it doesn't exist
   * 
   * WHAT IS IUpsertTodo?
   * ====================
   * IUpsertTodo is the full ITodo interface, requiring all fields including 'id'.
   * This is different from ICreateTodo because the client provides the ID (useful for
   * syncing data from external sources or maintaining client-side IDs).
   */
  it('should create or update a to-do item (upsert)', (done) => {
    const todo = createMockTodo();
    const upsertData: IUpsertTodo = todo;
    
    const httpSpy = jest.spyOn(http, 'put').mockReturnValue(of(todo));
    
    service.createOrUpdateToDo(todo.id, upsertData).subscribe({
      next: (val) => {
        expect(val).toStrictEqual(todo);
        expect(val.id).toBe(todo.id);
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
    expect(httpSpy).toHaveBeenCalledWith(`/api/v1/todos/${todo.id}`, upsertData);
  });

  /**
   * Test: DELETE /api/v1/todos/:id - Should delete a todo item
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Testing that deleteToDo() correctly calls the DELETE endpoint with the todo ID
   * in the URL and returns void (no response body).
   * 
   * HOW DOES THIS TEST WORK?
   * ========================
   * 1. Create a fake todo item (we need its ID)
   * 2. Mock HttpClient.delete() to return undefined wrapped in an Observable
   * 3. Call the service method with the todo ID
   * 4. Verify the response is undefined (DELETE requests typically return no body)
   * 5. Verify HttpClient.delete() was called with the correct URL including the ID
   * 
   * WHY DOES DELETE RETURN VOID?
   * =============================
   * DELETE requests typically don't return a response body - just a status code (usually 204 No Content).
   * The Observable<void> type indicates that the Observable completes successfully but doesn't emit any data.
   * 
   * NOTE:
   * =====
   * At this time there are not unit tests for "unexpected" situations like handling 4XX-level HTTP errors,
   * browser being offline, network timeouts, etc. These would be good additions for more comprehensive testing.
   */
  it('should delete a to-do item', (done) => {
    const todo = createMockTodo();
    
    const httpSpy = jest.spyOn(http, 'delete').mockReturnValue(of(undefined));
    
    service.deleteToDo(todo.id).subscribe({
      next: (val) => {
        expect(val).toBeUndefined();
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
    expect(httpSpy).toHaveBeenCalledWith(`/api/v1/todos/${todo.id}`);
  });
});

