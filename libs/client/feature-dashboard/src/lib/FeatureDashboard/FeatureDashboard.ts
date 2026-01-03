/**
 * Feature Dashboard Component
 * 
 * This component serves as the main dashboard for displaying and managing todo items.
 * It acts as a container that:
 * - Fetches todo items from the API
 * - Displays them using the ToDoComponent
 * - Handles user interactions (toggle, edit, delete)
 * - Separates completed and incomplete todos into two columns
 * 
 * Component Features:
 * - Two-column layout (Incomplete | Completed)
 * - Real-time updates after user actions
 * - TrackBy function for performance optimization
 * - Uses BehaviorSubject for reactive state management
 * 
 * Performance Optimization:
 * - trackBy function prevents unnecessary re-renders
 * - OnPush change detection (inherited from ToDoComponent)
 * - Async pipe for automatic subscription management
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Api } from '@full-stack-todo/client/data-access';
import { ITodo } from '@full-stack-todo/shared/domain';
import { ToDoComponent, ThemeToggleComponent, EditTodoDialogComponent } from '@full-stack-todo/client/ui-components';

@Component({
  selector: 'lib-feature-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // Import the standalone ToDoComponent
    ToDoComponent,
    // Import theme toggle component
    ThemeToggleComponent,
    // Import edit dialog component
    EditTodoDialogComponent
  ],
  templateUrl: './FeatureDashboard.html',
  styleUrl: './FeatureDashboard.scss',
})
export class FeatureDashboardComponent implements OnInit {
  /**
   * Injected API service for making HTTP requests.
   * 
   * Uses Angular's inject() function for dependency injection.
   * The Api service handles all communication with the backend.
   */
  private readonly apiService = inject(Api);

  /**
   * BehaviorSubject for managing todo items state.
   * 
   * BehaviorSubject is used instead of a plain Observable because:
   * - It maintains the current value (last emitted)
   * - Components can access the current value synchronously
   * - New subscribers immediately receive the current value
   * 
   * Initialized with an empty array, which will be populated
   * when the component loads and after each user action.
   */
  todos$ = new BehaviorSubject<ITodo[]>([]);

  /**
   * Currently selected todo for editing
   */
  editingTodo: ITodo | null = null;

  /**
   * Whether the edit dialog is visible
   */
  isEditDialogVisible = false;

  /**
   * TrackBy function for *ngFor optimization.
   * 
   * This function tells Angular how to uniquely identify each todo item
   * in the list. By using the todo's ID, Angular can:
   * - Track which items have changed
   * - Avoid re-rendering unchanged items
   * - Improve performance with large lists
   * 
   * Without trackBy, Angular would re-render all items whenever the
   * array reference changes, even if individual items haven't changed.
   * 
   * @param {number} idx - The index of the item (not used, but required by Angular)
   * @param {ITodo} todo - The todo item
   * @returns {string} The unique identifier (todo.id)
   */
  trackTodo(idx: number, todo: ITodo): string {
    return todo.id;
  }

  /**
   * Lifecycle hook called after component initialization.
   * 
   * This is the ideal place to fetch initial data when the component loads.
   * We call refreshItems() to load todos from the API.
   */
  ngOnInit(): void {
    this.refreshItems();
  }

  /**
   * Refreshes the todo items list from the API.
   * 
   * This method:
   * - Calls the API to get all todos
   * - Uses take(1) to automatically unsubscribe after receiving data
   * - Updates the BehaviorSubject with the new data
   * 
   * Called:
   * - On component initialization (ngOnInit)
   * - After each user action (toggle, delete) to refresh the list
   */
  refreshItems(): void {
    this.apiService
      .getAllToDoItems()
      .pipe(take(1)) // Automatically unsubscribe after first emission
      .subscribe((items) => this.todos$.next(items));
  }

  /**
   * Handles the toggle completion action from ToDoComponent.
   * 
   * When a user clicks the completion indicator on a todo item,
   * this method:
   * - Calls the API to update the todo's completed status
   * - Refreshes the list after successful update
   * 
   * @param {ITodo} todo - The todo item to toggle
   */
  toggleComplete(todo: ITodo): void {
    this.apiService
      .updateToDo(todo.id, { completed: !todo.completed })
      .pipe(take(1))
      .subscribe(() => {
        // Refresh the list after successful update
        this.refreshItems();
      });
  }

  /**
   * Handles the delete action from ToDoComponent.
   * 
   * When a user clicks the delete button on a todo item,
   * this method:
   * - Calls the API to delete the todo
   * - Refreshes the list after successful deletion
   * 
   * @param {ITodo} todo - The todo item to delete
   */
  deleteTodo(todo: ITodo): void {
    this.apiService
      .deleteToDo(todo.id)
      .pipe(take(1))
      .subscribe(() => {
        // Refresh the list after successful deletion
        this.refreshItems();
      });
  }

  /**
   * Handles the edit action from ToDoComponent.
   * 
   * When a user clicks the edit button on a todo item,
   * this method opens the edit dialog modal.
   * 
   * Note: Completed todos cannot be edited. This method
   * prevents editing if the todo is already completed.
   * 
   * @param {ITodo} todo - The todo item to edit
   */
  editTodo(todo: ITodo): void {
    // Prevent editing completed todos
    if (todo.completed) {
      return;
    }
    
    this.editingTodo = todo;
    this.isEditDialogVisible = true;
  }

  /**
   * Handles saving the edited todo from the dialog.
   * 
   * Called when the user clicks "Save" in the edit dialog.
   * Updates the todo via the API and refreshes the list.
   * 
   * @param {Object} data - The updated todo data (title and description)
   */
  onSaveEdit(data: { title: string; description: string }): void {
    if (!this.editingTodo) {
      return;
    }

    // Only update if values have changed
    if (
      data.title !== this.editingTodo.title ||
      data.description !== (this.editingTodo.description || '')
    ) {
      // Prepare update payload
      const updateData: { title: string; description?: string } = {
        title: data.title,
      };

      // Only include description if it's different (allows clearing description)
      if (data.description !== (this.editingTodo.description || '')) {
        updateData.description = data.description;
      }

      this.apiService
        .updateToDo(this.editingTodo.id, updateData)
        .pipe(take(1))
        .subscribe({
          next: () => {
            // Close dialog and refresh the list after successful update
            this.closeEditDialog();
            this.refreshItems();
          },
          error: (error) => {
            console.error('Error updating todo:', error);
            // Show user-friendly error message
            window.alert('Failed to update todo. Please try again.');
          },
        });
    } else {
      // No changes, just close the dialog
      this.closeEditDialog();
    }
  }

  /**
   * Handles canceling the edit dialog.
   * 
   * Called when the user clicks "Cancel" or clicks outside the dialog.
   */
  onCancelEdit(): void {
    this.closeEditDialog();
  }

  /**
   * Closes the edit dialog and clears the editing todo.
   */
  private closeEditDialog(): void {
    this.isEditDialogVisible = false;
    this.editingTodo = null;
  }
}
