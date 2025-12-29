/**
 * App Component - Root component of the Angular application
 * 
 * This is the main component that:
 * - Acts as the container for the entire application
 * - Combines the TodoFormComponent and TodoListComponent
 * - Handles communication between child components
 * 
 * Key Angular concepts:
 * - @ViewChild: Gets a reference to a child component in the template
 * - Component communication: Parent listens to child events and calls child methods
 */
import { Component, ViewChild } from '@angular/core';
import { TodoFormComponent } from './todo/todo-form.component';
import { TodoListComponent } from './todo/todo-list.component';

@Component({
  imports: [TodoFormComponent, TodoListComponent],
  selector: 'fse-root', // This is the root component - used in index.html
  templateUrl: './app.html', // Template that defines the component's HTML structure
  styleUrl: './app.scss', // Styles specific to this component
})
export class App {
  /**
   * @ViewChild gets a reference to the TodoListComponent in the template
   * This allows us to call methods on the child component from the parent
   * 
   * The ! (non-null assertion) tells TypeScript "I know this might be undefined
   * initially, but I'll check before using it"
   * 
   * Template reference: <fse-todo-list #todoList></fse-todo-list>
   */
  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;
  
  // Title displayed in the header
  protected title = 'Todo App';

  /**
   * Called when the TodoFormComponent emits the 'todoCreated' event
   * 
   * This method:
   * 1. Receives the event from the form component
   * 2. Gets a reference to the list component
   * 3. Calls loadTodos() to refresh the list with the new todo
   * 
   * This is parent-child component communication:
   * - Child (form) emits event: (todoCreated)="onTodoCreated()"
   * - Parent (this) handles event and calls method on another child (list)
   */
  onTodoCreated(): void {
    // Check if the reference exists (component might not be initialized yet)
    if (this.todoListComponent) {
      // Call the child component's method to refresh the todo list
      this.todoListComponent.loadTodos();
    }
  }
}
