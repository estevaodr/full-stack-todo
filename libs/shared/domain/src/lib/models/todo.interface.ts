/**
 * Interface representing a Todo item.
 * This is the core domain model shared between frontend and backend.
 * The 'I' prefix is a common convention for interfaces in TypeScript.
 */
export interface ITodo {
  /** Unique identifier for the todo item */
  id: string;
  /** Title of the todo item */
  title: string;
  /** Description or details of the todo item */
  description: string;
  /** Whether the todo item has been completed */
  completed: boolean;
}

export type ICreateTodo = Pick<ITodo, 'title' | 'description'>;
export type IUpdateTodo = Partial<Omit<ITodo, 'id'>>;
export type IUpsertTodo = ITodo;

