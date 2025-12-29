/**
 * TodoFormComponent - Form for creating new todos
 * 
 * This component:
 * - Provides a form with title and description fields
 * - Validates that both fields are filled
 * - Submits the new todo to the server
 * - Emits an event when a todo is successfully created (so parent can refresh the list)
 * 
 * Key Angular concepts:
 * - @Output: Allows this component to send data/events to its parent component
 * - EventEmitter: Used to emit custom events to parent components
 * - Two-way binding: [(ngModel)] connects form inputs to component properties
 */
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel two-way binding
import { TodoService } from './todo.service';
import { CreateTodoDto } from '@full-stack-todo/shared';

@Component({
  selector: 'fse-todo-form', // Use as: <fse-todo-form></fse-todo-form>
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss',
})
export class TodoFormComponent {
  /**
   * @Output decorator creates an event that parent components can listen to
   * EventEmitter<void> means we're just signaling that something happened (no data sent)
   * 
   * Parent component can listen like this:
   * <fse-todo-form (todoCreated)="onTodoCreated()"></fse-todo-form>
   */
  @Output() todoCreated = new EventEmitter<void>();

  // Form data properties - bound to input fields via [(ngModel)]
  title = ''; // Two-way bound to title input field
  description = ''; // Two-way bound to description textarea
  loading = false; // Shows loading state while creating todo
  error: string | null = null; // Stores validation or API errors

  // Inject TodoService to make API calls
  private todoService = inject(TodoService);

  /**
   * Called when user submits the form (clicks "Create Todo" button)
   * 
   * Process:
   * 1. Validate that both fields have content (after trimming whitespace)
   * 2. If invalid, show error and stop
   * 3. If valid, show loading state and send data to server
   * 4. On success: clear form, hide loading, notify parent component
   * 5. On error: show error message, hide loading
   */
  onSubmit(): void {
    // Validation: Check if fields are empty (after removing whitespace)
    // trim() removes spaces from beginning and end of string
    if (!this.title.trim() || !this.description.trim()) {
      this.error = 'Title and description are required';
      return; // Stop execution - don't submit if invalid
    }

    this.loading = true; // Show loading spinner/disable button
    this.error = null; // Clear any previous errors

    // Create the data object to send to server
    // CreateTodoDto is a type that ensures we only send title and description
    // (not id, completed, etc. - those are set by the server)
    const createTodoDto: CreateTodoDto = {
      title: this.title.trim(), // Remove leading/trailing spaces
      description: this.description.trim(),
    };

    // Send POST request to create the todo
    this.todoService.create(createTodoDto).subscribe({
      next: () => {
        // Success! Clear the form fields
        this.title = '';
        this.description = '';
        this.loading = false;

        // Emit event to notify parent component that a todo was created
        // Parent component can then refresh the todo list
        this.todoCreated.emit();
      },
      error: (err) => {
        // Request failed - show error to user
        this.error = 'Failed to create todo';
        this.loading = false;
        console.error('Error creating todo:', err); // Log for debugging
      },
    });
  }
}

