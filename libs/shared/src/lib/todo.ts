export interface ITodo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

/**
 * Todo entity with timestamps.
 * Extends ITodo with createdAt and updatedAt fields.
 */
export interface Todo extends ITodo {
  createdAt: Date;
  updatedAt: Date;
}

