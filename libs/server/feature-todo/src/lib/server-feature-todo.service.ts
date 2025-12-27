import { Injectable, NotFoundException } from '@nestjs/common';
import { ITodo } from '@full-stack-todo/shared/domain';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing Todo items.
 * Uses RxJS BehaviorSubject for in-memory state management.
 * In a production environment, this would typically interact with a database.
 */
@Injectable()
export class ServerFeatureTodoService {
  /**
   * BehaviorSubject holding the current state of all todos.
   * The $$ suffix is a convention indicating this is a reactive stream.
   * Initialized with a default todo item for demonstration purposes.
   */
  private todos$$ = new BehaviorSubject<ITodo[]>([
    {
      id: 'something-something-dark-side',
      title: 'Add a route to create todo items!',
      description: 'Yes, this is foreshadowing a POST route introduction',
      completed: false,
    },
  ]);

  /**
   * Retrieves all todo items
   * @returns Array of all todo items
   */
  getAll(): ITodo[] {
    return this.todos$$.value;
  }

  /**
   * Retrieves a single todo item by its ID
   * @param id - The unique identifier of the todo item
   * @returns The todo item with the specified ID
   * @throws NotFoundException if the todo item is not found
   */
  getOne(id: string): ITodo {
    const todo = this.todos$$.value.find((td) => td.id === id);
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    return todo;
  }

  /**
   * Creates a new todo item
   * Generates a random ID and sets completed to false by default
   * @param todo - Partial todo data containing only title and description
   * @returns The newly created todo item with generated ID
   */
  create(todo: Pick<ITodo, 'title' | 'description'>): ITodo {
    const current = this.todos$$.value;
    const newTodo: ITodo = {
      ...todo,
      id: `todo-${Math.floor(Math.random() * 10000)}`,
      completed: false,
    };
    this.todos$$.next([...current, newTodo]);
    return newTodo;
  }

  /**
   * Updates an existing todo item
   * Only updates the fields provided in the data parameter
   * @param id - The unique identifier of the todo item to update
   * @param data - Partial todo data containing only the fields to update
   * @returns The updated todo item
   * @throws NotFoundException if the todo item is not found
   */
  update(id: string, data: Partial<Omit<ITodo, 'id'>>): ITodo {
    const todo = this.todos$$.value.find((td) => td.id === id);
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    const updated = { ...todo, ...data };
    this.todos$$.next([
      ...this.todos$$.value.map((td) => (td.id === id ? updated : td)),
    ]);
    return updated;
  }

  /**
   * Creates or updates a todo item (upsert operation)
   * If a todo with the given ID exists, it updates it; otherwise, it creates a new one
   * @param data - Complete todo data including ID
   * @returns The created or updated todo item
   */
  upsert(data: ITodo): ITodo {
    const todo = this.todos$$.value.find((td) => td.id === data.id);
    if (!todo) {
      // Create new todo if it doesn't exist
      this.todos$$.next([...this.todos$$.value, data]);
      return data;
    }
    // Update existing todo
    const updated = { ...todo, ...data };
    this.todos$$.next([
      ...this.todos$$.value.map((td) => (td.id === updated.id ? updated : td)),
    ]);
    return updated;
  }

  /**
   * Deletes a todo item by its ID
   * @param id - The unique identifier of the todo item to delete
   * @throws NotFoundException if the todo item is not found
   */
  delete(id: string): void {
    const todo = this.todos$$.value.find((td) => td.id === id);
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    this.todos$$.next([...this.todos$$.value.filter((td) => td.id !== id)]);
    return;
  }
}

