import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICreateTodo, ITodo, IUpdateTodo, IUpsertTodo } from '@full-stack-todo/shared/domain';

/**
 * API Service for Todo Items
 * 
 * This service handles all HTTP communication with the backend API for todo operations.
 * It uses Angular's HttpClient to make requests and returns Observables that components
 * can subscribe to for handling async responses.
 * 
 * @Injectable decorator with 'root' means this service is a singleton available app-wide
 */
@Injectable({
  providedIn: 'root',
})
export class Api {
  /**
   * HttpClient is injected using Angular's new inject() function
   * This is used to make HTTP requests (GET, POST, PUT, PATCH, DELETE)
   * 'readonly' ensures this reference can't be reassigned after initialization
   */
  private readonly http = inject(HttpClient);

  /**
   * Retrieves all todo items from the server
   * 
   * HTTP Method: GET
   * Endpoint: /api/v1/todos
   * 
   * Note: The server uses API versioning, so all endpoints are prefixed with /v1
   * 
   * @returns Observable<ITodo[]> - An array of all todo items wrapped in an Observable.
   *          Components subscribe to this to get the data when it arrives.
   */
  getAllToDoItems(): Observable<ITodo[]> {
    return this.http.get<ITodo[]>(`/api/v1/todos`);
  }

  /**
   * Retrieves a single todo item by its unique ID
   * 
   * HTTP Method: GET
   * Endpoint: /api/v1/todos/:id
   * 
   * @param todoId - The unique identifier of the todo item to retrieve
   * @returns Observable<ITodo> - The requested todo item wrapped in an Observable
   */
  getToDoById(todoId: string): Observable<ITodo> {
    return this.http.get<ITodo>(`/api/v1/todos/${todoId}`);
  }

  /**
   * Creates a new todo item on the server
   * 
   * HTTP Method: POST
   * Endpoint: /api/v1/todos
   * Body: todoData (title and description)
   * 
   * POST is used for creating new resources. The server will generate an ID
   * and return the complete todo object including the new ID.
   * 
   * @param todoData - Object containing title and description for the new todo
   * @returns Observable<ITodo> - The newly created todo item with server-generated ID
   */
  createToDo(todoData: ICreateTodo): Observable<ITodo> {
    return this.http.post<ITodo>(`/api/v1/todos`, todoData);
  }

  /**
   * Partially updates an existing todo item
   * 
   * HTTP Method: PATCH
   * Endpoint: /api/v1/todos/:id
   * Body: todoData (only the fields you want to update)
   * 
   * PATCH is for partial updates - you only send the fields that changed.
   * For example, you could update just the 'completed' status without sending
   * the title or description.
   * 
   * @param todoId - The ID of the todo item to update
   * @param todoData - Partial object with only the fields to update
   * @returns Observable<ITodo> - The updated todo item
   */
  updateToDo(todoId: string, todoData: IUpdateTodo): Observable<ITodo> {
    return this.http.patch<ITodo>(`/api/v1/todos/${todoId}`, todoData);
  }

  /**
   * Creates a new todo or replaces an existing one (upsert = update or insert)
   * 
   * HTTP Method: PUT
   * Endpoint: /api/v1/todos/:id
   * Body: todoData (complete todo object)
   * 
   * PUT is for full replacement. If a todo with this ID exists, it replaces it entirely.
   * If it doesn't exist, it creates a new one with the provided ID.
   * You must send the complete object, not just changed fields.
   * 
   * @param todoId - The ID of the todo item to upsert
   * @param todoData - Complete todo object with all fields
   * @returns Observable<ITodo> - The created or updated todo item
   */
  createOrUpdateToDo(todoId: string, todoData: IUpsertTodo): Observable<ITodo> {
    return this.http.put<ITodo>(`/api/v1/todos/${todoId}`, todoData);
  }

  /**
   * Deletes a todo item from the server
   * 
   * HTTP Method: DELETE
   * Endpoint: /api/v1/todos/:id
   * 
   * Permanently removes the todo item with the specified ID from the database.
   * 
   * @param todoId - The ID of the todo item to delete
   * @returns Observable<void> - Empty response confirming deletion
   */
  deleteToDo(todoId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/todos/${todoId}`);
  }
}
