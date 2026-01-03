/**
 * UI Components Library
 * 
 * This library contains reusable Angular components for the application.
 * All components are standalone and can be imported individually.
 * 
 * Exports:
 * - ToDoComponent: Component for displaying and interacting with todo items
 * - ThemeToggleComponent: Component for switching between light and dark themes
 * - EditTodoDialogComponent: Modal dialog component for editing todo items
 */

export * from './lib/to-do';
export { ThemeToggleComponent } from './lib/theme-toggle/theme-toggle';
export { EditTodoDialogComponent } from './lib/edit-todo-dialog/edit-todo-dialog';
