import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITodo } from '@full-stack-todo/shared/domain';
import { ToDoEntitySchema } from '@full-stack-todo/server/data-access-todo';

/**
 * Service for managing Todo items.
 * 
 * This service uses the Repository Pattern with TypeORM to interact with the database.
 * The repository is injected using @InjectRepository decorator, which provides easy,
 * intuitive access to the type of queries you'd normally see in a SQL transaction.
 * 
 * Key changes from in-memory storage:
 * - TypeORM returns Promises, so all methods are now async/await
 * - TypeORM automatically generates UUIDs for new todos (no more Math.random())
 * - TypeORM provides transaction handling and error management
 * 
 * Note: The old BehaviorSubject code has been commented out for comparison purposes.
 * Future commits will remove this code to clean up the source files.
 */
@Injectable()
export class ServerFeatureTodoService {
  /**
   * BehaviorSubject holding the current state of all todos.
   * The $$ suffix is a convention indicating this is a reactive stream.
   * Initialized with a default todo item for demonstration purposes.
   * 
   * @deprecated This is the old in-memory storage implementation.
   * Kept for comparison - will be removed in future commits.
   */
  // private todos$$ = new BehaviorSubject<ITodo[]>([
  //   {
  //     id: 'something-something-dark-side',
  //     title: 'Add a route to create todo items!',
  //     description: 'Yes, this is foreshadowing a POST route introduction',
  //     completed: false,
  //   },
  // ]);

  /**
   * TypeORM repository for todo entities.
   * Injected via @InjectRepository decorator, providing database access methods.
   */
  constructor(
    @InjectRepository(ToDoEntitySchema)
    private todoRepository: Repository<ITodo>
  ) {}

  /**
   * Retrieves all todo items from the database for a specific user
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves to an array of all todo items for the user
   */
  async getAll(userId: string): Promise<ITodo[]> {
    // Old in-memory implementation:
    // return this.todos$$.value;
    
    return await this.todoRepository.find({
      where: { user_id: userId },
    });
  }

  /**
   * Retrieves a single todo item by its ID from the database for a specific user
   * @param userId - The unique identifier of the user
   * @param id - The unique identifier of the todo item
   * @returns Promise that resolves to the todo item with the specified ID
   * @throws NotFoundException if the todo item is not found or doesn't belong to the user
   * 
   * Note: We could use TypeORM's `findOneOrFail` method which automatically throws
   * an error if not found, but we chose to use `findOneBy` and manually throw
   * NotFoundException to maintain consistency with NestJS error handling patterns.
   */
  async getOne(userId: string, id: string): Promise<ITodo> {
    // Old in-memory implementation:
    // const todo = this.todos$$.value.find((td) => td.id === id);
    
    const todo = await this.todoRepository.findOneBy({
      id,
      user_id: userId,
    });
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    return todo;
  }

  /**
   * Creates a new todo item in the database for a specific user
   * TypeORM automatically generates a UUID for the ID and sets completed to false by default
   * @param userId - The unique identifier of the user
   * @param todo - Partial todo data containing only title and description
   * @returns Promise that resolves to the newly created todo item with generated UUID
   */
  async create(userId: string, todo: Pick<ITodo, 'title' | 'description'>): Promise<ITodo> {
    // Old in-memory implementation:
    // const current = this.todos$$.value;
    // const newTodo: ITodo = {
    //   ...todo,
    //   id: `todo-${Math.floor(Math.random() * 10000)}`,
    //   completed: false,
    // };
    // this.todos$$.next([...current, newTodo]);
    
    const newTodo = await this.todoRepository.save({
      ...todo,
      user_id: userId,
    });
    return newTodo;
  }

  /**
   * Updates an existing todo item in the database for a specific user
   * Only updates the fields provided in the data parameter
   * @param userId - The unique identifier of the user
   * @param id - The unique identifier of the todo item to update
   * @param data - Partial todo data containing only the fields to update
   * @returns Promise that resolves to the updated todo item
   * @throws NotFoundException if the todo item is not found or doesn't belong to the user
   */
  async update(userId: string, id: string, data: Partial<Omit<ITodo, 'id'>>): Promise<ITodo> {
    // Old in-memory implementation:
    // const todo = this.todos$$.value.find((td) => td.id === id);
    // if (!todo) {
    //   throw new NotFoundException(`To-do could not be found!`);
    // }
    // const updated = { ...todo, ...data };
    // this.todos$$.next([
    //   ...this.todos$$.value.map((td) => (td.id === id ? updated : td)),
    // ]);
    
    const todo = await this.todoRepository.findOneBy({
      id,
      user_id: userId,
    });
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    const updated = await this.todoRepository.save({ ...todo, ...data });
    return updated;
  }

  /**
   * Creates or updates a todo item (upsert operation) in the database for a specific user
   * If a todo with the given ID exists, it updates it; otherwise, it creates a new one
   * @param userId - The unique identifier of the user
   * @param data - Complete todo data including ID
   * @returns Promise that resolves to the created or updated todo item
   */
  async upsert(userId: string, data: ITodo): Promise<ITodo> {
    // Old in-memory implementation:
    // const todo = this.todos$$.value.find((td) => td.id === data.id);
    // if (!todo) {
    //   // Create new todo if it doesn't exist
    //   this.todos$$.next([...this.todos$$.value, data]);
    //   return data;
    // }
    // // Update existing todo
    // const updated = { ...todo, ...data };
    // this.todos$$.next([
    //   ...this.todos$$.value.map((td) => (td.id === updated.id ? updated : td)),
    // ]);
    
    // TypeORM's save method performs an upsert operation automatically
    // Ensure the user_id is set to the provided userId
    return await this.todoRepository.save({
      ...data,
      user_id: userId,
    });
  }

  /**
   * Deletes a todo item by its ID from the database for a specific user
   * @param userId - The unique identifier of the user
   * @param id - The unique identifier of the todo item to delete
   * @throws NotFoundException if the todo item is not found or doesn't belong to the user
   */
  async delete(userId: string, id: string): Promise<void> {
    // Old in-memory implementation:
    // const todo = this.todos$$.value.find((td) => td.id === id);
    // if (!todo) {
    //   throw new NotFoundException(`To-do could not be found!`);
    // }
    // this.todos$$.next([...this.todos$$.value.filter((td) => td.id !== id)]);
    
    const todo = await this.todoRepository.findOneBy({
      id,
      user_id: userId,
    });
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    await this.todoRepository.remove(todo);
  }
}

