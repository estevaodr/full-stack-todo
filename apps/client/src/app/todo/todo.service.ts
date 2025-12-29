/**
 * TodoService - Service for managing todos via HTTP requests
 * 
 * This service acts as a bridge between the Angular application and the REST API.
 * It provides methods to perform CRUD (Create, Read, Update, Delete) operations on todos.
 * 
 * Key concepts:
 * - @Injectable: Makes this class available for dependency injection
 * - providedIn: 'root' means this service is available app-wide as a singleton
 * - HttpClient: Angular's service for making HTTP requests
 * - Observable: RxJS pattern for handling asynchronous operations (like HTTP calls)
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, CreateTodoDto, UpdateTodoDto } from '@full-stack-todo/shared';

@Injectable({
  providedIn: 'root', // Makes this service available throughout the entire application
})
export class TodoService {
  // Base URL for the todos API endpoint
  // Note: This uses a relative path which will be proxied to the backend server
  // The proxy configuration (proxy.conf.json) redirects /api to http://localhost:3000/api
  private apiUrl = '/api/todos';

  // Dependency injection: Angular automatically provides HttpClient instance
  constructor(private http: HttpClient) {}

  /**
   * Fetches all todos from the server
   * @returns Observable that emits an array of Todo objects
   * 
   * Usage in component:
   * this.todoService.getAll().subscribe(todos => { ... })
   */
  getAll(): Observable<Todo[]> {
    // GET request to fetch all todos
    // The <Todo[]> tells TypeScript what type of data we expect back
    return this.http.get<Todo[]>(this.apiUrl);
  }

  /**
   * Fetches a single todo by its ID
   * @param id - The unique identifier of the todo
   * @returns Observable that emits a single Todo object
   */
  getById(id: string): Observable<Todo> {
    // Template literal syntax: `${variable}` inserts the variable value into the string
    // Example: if id = "123", the URL becomes "/api/todos/123"
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new todo on the server
   * @param todo - The todo data to create (title and description)
   * @returns Observable that emits the created Todo (with ID and timestamps)
   */
  create(todo: CreateTodoDto): Observable<Todo> {
    // POST request sends data to the server
    // First parameter: URL endpoint
    // Second parameter: The data to send in the request body
    return this.http.post<Todo>(this.apiUrl, todo);
  }

  /**
   * Updates an existing todo on the server
   * @param id - The unique identifier of the todo to update
   * @param todo - The fields to update (partial update - only send what changed)
   * @returns Observable that emits the updated Todo
   */
  update(id: string, todo: UpdateTodoDto): Observable<Todo> {
    // PATCH request for partial updates (only send changed fields)
    // PUT would be used for full replacement, but PATCH is more efficient
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, todo);
  }

  /**
   * Deletes a todo from the server
   * @param id - The unique identifier of the todo to delete
   * @returns Observable that completes when deletion is successful (no data returned)
   */
  delete(id: string): Observable<void> {
    // DELETE request removes the resource
    // Returns Observable<void> because the server returns no content (204 status)
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

