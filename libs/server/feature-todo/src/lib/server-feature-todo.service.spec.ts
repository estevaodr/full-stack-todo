/**
 * Unit Tests for ServerFeatureTodoService
 * 
 * WHAT ARE WE TESTING HERE?
 * =========================
 * We're testing the SERVICE layer, which contains the business logic.
 * Unlike controller tests (which mock the service), here we test the service itself
 * by mocking the DATABASE REPOSITORY.
 * 
 * WHY TEST THE SERVICE SEPARATELY?
 * ================================
 * 1. Services contain important business logic that needs to be correct
 * 2. We can test error handling (like "todo not found")
 * 3. We can verify the service calls the repository correctly
 * 4. If the controller tests fail, we know if it's a controller or service problem
 * 
 * KEY DIFFERENCE FROM CONTROLLER TESTS:
 * ====================================
 * - Controller tests: Mock the SERVICE, test the CONTROLLER
 * - Service tests: Mock the REPOSITORY, test the SERVICE
 */

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ServerFeatureTodoService } from './server-feature-todo.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ToDoEntitySchema } from '@full-stack-todo/server/data-access-todo';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path mapping works at runtime, TypeScript language server false positive
import { ITodo } from '@full-stack-todo/shared/domain';
// Import the mock factory and type from the controller test file
// (We reuse the same mocks to keep code DRY - Don't Repeat Yourself)
import {
  repositoryMockFactory,
  MockType,
} from './server-feature-todo.controller.spec';

/**
 * Helper function to create fake todos
 * (Same as in controller tests - we reuse it)
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
 * Test Suite: ServerFeatureTodoService
 */
describe('ServerFeatureTodoService', () => {
  // Variables to hold our service and mocked repository
  let service: ServerFeatureTodoService;
  let repoMock: MockType<Repository<ITodo>>; // The fake database repository

  /**
   * beforeEach - Setup for each test
   * 
   * KEY DIFFERENCE FROM CONTROLLER TESTS:
   * =====================================
   * - We don't include the controller here (we're testing the service directly)
   * - We get a reference to the mocked repository so we can control what it returns
   */
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerFeatureTodoService,
        {
          provide: getRepositoryToken(ToDoEntitySchema),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    // Get the service instance
    service = module.get(ServerFeatureTodoService);
    // Get the mocked repository so we can control it in our tests
    repoMock = module.get(getRepositoryToken(ToDoEntitySchema));
  });

  /**
   * Test: getAll() - Should return all todos
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly calls the repository's find() method
   * and returns the results.
   * 
   * HOW IT WORKS:
   * ============
   * 1. We tell the mock repository what to return when find() is called
   * 2. We call the service's getAll() method
   * 3. We check that it returns the correct data
   * 4. We verify that find() was actually called (important!)
   */
  it('should return an array of to-do items', async () => {
    // Create an array of 5 fake todos
    const todos = Array.from({ length: 5 }).map(() => createMockTodo());
    
    // Tell the mock repository: "When find() is called, return this Promise with these todos"
    // The ?. is optional chaining - it's safe if find doesn't exist (though it should)
    repoMock.find?.mockReturnValue(Promise.resolve(todos));

    // Call the service method
    const result = await service.getAll();

    // Check that we got back the right number of todos
    expect(result.length).toBe(todos.length);
    // IMPORTANT: Verify that the repository method was actually called
    // This ensures the service is using the repository correctly
    expect(repoMock.find).toHaveBeenCalled();
  });

  /**
   * Test: getOne() - Should return a single todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly finds a todo by ID and returns it.
   */
  it('should return a single to-do item', async () => {
    const todo = createMockTodo();
    
    // Mock the repository to return our fake todo when findOneBy() is called
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(todo));

    // Call the service method
    const result = await service.getOne(todo.id);

    // Check the result
    expect(result).toEqual(todo);
    // Verify that findOneBy() was called with the correct ID
    // This ensures the service is passing the right parameters to the repository
    expect(repoMock.findOneBy).toHaveBeenCalledWith({ id: todo.id });
  });

  /**
   * Test: getOne() - Should throw error when todo not found
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * Error handling! When a todo doesn't exist, the service should throw a NotFoundException.
   * 
   * WHY TEST ERRORS?
   * ===============
   * Error handling is just as important as happy path (success) scenarios.
   * We need to make sure the service handles errors correctly.
   * 
   * HOW TO TEST ERRORS:
   * ==================
   * Use expect().rejects.toThrow() to check that a Promise rejects (fails) with an error.
   */
  it('should throw NotFoundException when todo is not found', async () => {
    // Mock the repository to return null (todo not found)
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(null));

    // Use rejects.toThrow() to check that the Promise fails with NotFoundException
    // await expect() waits for the Promise and checks if it throws an error
    await expect(service.getOne('non-existent-id')).rejects.toThrow(
      NotFoundException
    );
  });

  /**
   * Test: create() - Should create a new todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly saves a new todo to the repository.
   */
  it('should create a new to-do item', async () => {
    const newTodo = createMockTodo();
    
    // Mock the repository to return the todo when save() is called
    repoMock.save?.mockReturnValue(Promise.resolve(newTodo));

    // Call create with only title and description
    // (The service will add ID and completed status)
    const result = await service.create({
      title: newTodo.title,
      description: newTodo.description,
    });

    // Check that we got back the created todo
    expect(result).toEqual(newTodo);
    // Verify that save() was called (the service should save to the database)
    expect(repoMock.save).toHaveBeenCalled();
  });

  /**
   * Test: update() - Should update an existing todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service:
   * 1. Finds the existing todo
   * 2. Updates it with new data
   * 3. Saves it back to the repository
   * 
   * WHY TWO REPOSITORY CALLS?
   * ========================
   * The service first finds the todo (to make sure it exists), then saves the updated version.
   * This is a common pattern: find, modify, save.
   */
  it('should update an existing to-do item', async () => {
    const todo = createMockTodo();
    const updatedTodo = { ...todo, title: 'Updated Title' }; // Copy todo and change title

    // Mock findOneBy to return the existing todo
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(todo));
    // Mock save to return the updated todo
    repoMock.save?.mockReturnValue(Promise.resolve(updatedTodo));

    // Call update with the ID and new data
    const result = await service.update(todo.id, { title: 'Updated Title' });

    // Check that the title was updated
    expect(result.title).toBe('Updated Title');
    // Verify that findOneBy was called to find the existing todo
    expect(repoMock.findOneBy).toHaveBeenCalledWith({ id: todo.id });
    // Verify that save was called to persist the changes
    expect(repoMock.save).toHaveBeenCalled();
  });

  /**
   * Test: update() - Should throw error when updating non-existent todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly handles the case where someone tries to update
   * a todo that doesn't exist.
   */
  it('should throw NotFoundException when updating non-existent todo', async () => {
    // Mock the repository to return null (todo not found)
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(null));

    // Check that update() throws NotFoundException
    await expect(
      service.update('non-existent-id', { title: 'New Title' })
    ).rejects.toThrow(NotFoundException);
  });

  /**
   * Test: upsert() - Should create or update a todo
   * 
   * WHAT IS UPSERT?
   * ===============
   * "Upsert" = Update if exists, Insert if not.
   * TypeORM's save() method does this automatically - if the ID exists, it updates;
   * if not, it creates a new record.
   */
  it('should upsert a to-do item', async () => {
    const todo = createMockTodo();
    
    // Mock save to return the todo
    repoMock.save?.mockReturnValue(Promise.resolve(todo));

    // Call upsert with a complete todo object
    const result = await service.upsert(todo);

    // Check the result
    expect(result).toEqual(todo);
    // Verify that save was called with the todo
    expect(repoMock.save).toHaveBeenCalledWith(todo);
  });

  /**
   * Test: delete() - Should delete a todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service:
   * 1. Finds the todo (to make sure it exists)
   * 2. Removes it from the repository
   * 
   * WHY FIND FIRST?
   * ==============
   * The service checks if the todo exists before trying to delete it.
   * This allows it to throw a helpful error if the todo doesn't exist.
   */
  it('should delete a to-do item', async () => {
    const todo = createMockTodo();
    
    // Mock findOneBy to return the todo (it exists)
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(todo));
    // Mock remove to return the deleted todo
    repoMock.remove?.mockReturnValue(Promise.resolve(todo));

    // Call delete
    await service.delete(todo.id);

    // Verify that findOneBy was called to find the todo
    expect(repoMock.findOneBy).toHaveBeenCalledWith({ id: todo.id });
    // Verify that remove was called to delete it
    expect(repoMock.remove).toHaveBeenCalledWith(todo);
  });

  /**
   * Test: delete() - Should throw error when deleting non-existent todo
   * 
   * WHAT ARE WE TESTING?
   * ====================
   * That the service correctly handles trying to delete a todo that doesn't exist.
   */
  it('should throw NotFoundException when deleting non-existent todo', async () => {
    // Mock the repository to return null (todo not found)
    repoMock.findOneBy?.mockReturnValue(Promise.resolve(null));

    // Check that delete() throws NotFoundException
    await expect(service.delete('non-existent-id')).rejects.toThrow(
      NotFoundException
    );
  });
});
