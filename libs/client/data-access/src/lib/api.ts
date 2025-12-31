import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICreateTodo } from '@full-stack-todo/shared/domain';
@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);

  getAllToDoItems(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`/api/todos`);
  }


  getToDoById(todoId: string): Observable<unknown> {
    return this.http.get<unknown>(`/api/todos/${todoId}`);
  }


  createToDo(todoData: ICreateTodo): Observable<unknown> {
    return this.http.post<unknown>(`/api/todos`, todoData);
  }


  updateToDo(todoId: string, todoData: unknown): Observable<unknown> {
    return this.http.patch<unknown>(`/api/todos/${todoId}`, todoData);
  }


  createOrUpdateToDo(todoId: string, todoData: unknown): Observable<unknown> {
    return this.http.put<unknown>(`/api/todos/${todoId}`, todoData);
  }


  deleteToDo(todoId: string): Observable<unknown> {
    return this.http.delete<unknown>(`/api/todos/${todoId}`);
  }
}
