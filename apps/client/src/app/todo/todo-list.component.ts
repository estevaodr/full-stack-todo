/**
 * TodoListComponent - Displays a list of todos with ability to toggle completion and delete
 * 
 * This is a standalone Angular component that:
 * - Fetches todos from the server when it loads
 * - Displays todos in a list format
 * - Allows users to toggle todo completion status
 * - Allows users to delete todos
 * - Shows loading and error states
 * 
 * Key Angular concepts:
 * - @Component: Decorator that marks this class as an Angular component
 * - standalone: true means this component doesn't need to be declared in a module
 * - implements OnInit: Lifecycle hook interface - ngOnInit() runs when component initializes
 * - inject(): Modern Angular way to inject dependencies (alternative to constructor injection)
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides *ngIf, *ngFor, DatePipe, etc.
import { FormsModule } from '@angular/forms'; // Provides ngModel for two-way binding
import { TodoService } from './todo.service';
import { Todo, UpdateTodoDto } from '@full-stack-todo/shared';

@Component({
  selector: 'fse-todo-list', // How to use this component: <fse-todo-list></fse-todo-list>
  standalone: true, // Standalone component (Angular 14+ feature)
  imports: [CommonModule, FormsModule], // Directives and pipes we need
  templateUrl: './todo-list.component.html', // HTML template file
  styleUrl: './todo-list.component.scss', // Stylesheet file
})
export class TodoListComponent implements OnInit {
  // Component state properties
  todos: Todo[] = []; // Array to store all todos fetched from the server
  loading = false; // Flag to show loading spinner while fetching data
  error: string | null = null; // Stores error message if API call fails

  // Dependency injection using inject() function (modern Angular approach)
  // This gives us access to TodoService methods
  private todoService = inject(TodoService);

  /**
   * Lifecycle hook: Called once after Angular initializes the component
   * This is the perfect place to fetch initial data
   */
  ngOnInit(): void {
    this.loadTodos();
  }

  /**
   * Fetches all todos from the server
   * 
   * This method:
   * 1. Sets loading to true (shows loading indicator)
   * 2. Clears any previous errors
   * 3. Calls the service to get todos
   * 4. Handles success (updates todos array) or error (shows error message)
   */
  loadTodos(): void {
    this.loading = true; // Show loading indicator
    this.error = null; // Clear any previous errors

    // subscribe() is how we "listen" to the Observable returned by the service
    // Observables are lazy - nothing happens until you subscribe
    this.todoService.getAll().subscribe({
      // next: Called when the HTTP request succeeds
      next: (todos) => {
        this.todos = todos; // Update our local array with the fetched todos
        this.loading = false; // Hide loading indicator
      },
      // error: Called when the HTTP request fails
      error: (err) => {
        this.error = 'Failed to load todos'; // Show user-friendly error message
        this.loading = false; // Hide loading indicator
        console.error('Error loading todos:', err); // Log detailed error for debugging
      },
    });
  }

  /**
   * Toggles the completion status of a todo
   * @param todo - The todo item to toggle
   * 
   * When user clicks the checkbox:
   * 1. Create an update object with the new completed status (opposite of current)
   * 2. Send update request to server
   * 3. Update the local array with the server's response
   */
  toggleComplete(todo: Todo): void {
    // Create a partial update object - only send the field that changed
    // Partial<UpdateTodoDto> means all fields are optional
    const updateDto: Partial<UpdateTodoDto> = { completed: !todo.completed };

    // Send update request
    this.todoService
      .update(todo.id, updateDto as UpdateTodoDto)
      .subscribe({
        next: (updatedTodo) => {
          // Find the index of the todo in our array
          const index = this.todos.findIndex((t) => t.id === todo.id);
          
          // If found, replace it with the updated version from server
          // This ensures our local data matches the server
          if (index !== -1) {
            this.todos[index] = updatedTodo;
          }
        },
        error: (err) => {
          this.error = 'Failed to update todo';
          console.error('Error updating todo:', err);
        },
      });
  }

  /**
   * Deletes a todo from the server
   * @param id - The unique identifier of the todo to delete
   * 
   * Process:
   * 1. Ask user for confirmation (prevent accidental deletions)
   * 2. If confirmed, send delete request
   * 3. On success, remove todo from local array (optimistic update)
   */
  deleteTodo(id: string): void {
    // Confirm with user before deleting (browser's built-in confirm dialog)
    if (confirm('Are you sure you want to delete this todo?')) {
      this.todoService.delete(id).subscribe({
        next: () => {
          // Remove the todo from our local array
          // filter() creates a new array with all todos EXCEPT the one with this id
          this.todos = this.todos.filter((t) => t.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete todo';
          console.error('Error deleting todo:', err);
        },
      });
    }
  }
}

