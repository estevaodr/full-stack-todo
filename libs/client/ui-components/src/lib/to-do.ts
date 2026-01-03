/**
 * ToDo Component
 * 
 * A standalone Angular component that displays a single todo item with
 * interactive controls for toggling completion status, editing, and deletion.
 * 
 * This component uses:
 * - OnPush change detection strategy for performance optimization
 * - @Input() decorator to receive todo data from parent components
 * - @Output() decorators with EventEmitters to communicate actions back to parent
 * - Shared ITodo interface from the domain layer for type safety
 * 
 * Component Features:
 * - Displays todo title, description, and completion status
 * - Visual indicator (icon) for completion status
 * - Action buttons for edit and delete operations
 * - Emits events when user interacts with the component
 * 
 * Usage Example:
 * ```html
 * <fst-todo 
 *   [todo]="myTodo" 
 *   (toggleComplete)="handleToggle($event)"
 *   (editTodo)="handleEdit($event)"
 *   (deleteTodo)="handleDelete($event)">
 * </fst-todo>
 * ```
 */

import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter, 
  Input, 
  Output 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITodo } from '@full-stack-todo/shared/domain';

@Component({
  selector: 'fst-todo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './to-do.html',
  styleUrls: ['./to-do.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDoComponent {
  /**
   * Input property that receives the todo item data from the parent component.
   * 
   * The `@Input()` decorator allows parent components to pass data into this component
   * using property binding syntax: [todo]="someTodoItem"
   * 
   * @type {ITodo | undefined}
   * @public
   */
  @Input() todo: ITodo | undefined;

  /**
   * Output event emitter for toggling the completion status of a todo.
   * 
   * When the user clicks the completion indicator, this event emits the entire
   * todo object so the parent component can update the completion status.
   * 
   * Parent components can listen to this event using:
   * (toggleComplete)="handleToggle($event)"
   * 
   * @type {EventEmitter<ITodo>}
   * @public
   */
  @Output() toggleComplete = new EventEmitter<ITodo>();

  /**
   * Output event emitter for editing a todo item.
   * 
   * When the user clicks the edit button, this event emits the todo object
   * so the parent component can handle the edit action (e.g., open an edit dialog).
   * 
   * Parent components can listen to this event using:
   * (editTodo)="handleEdit($event)"
   * 
   * @type {EventEmitter<ITodo>}
   * @public
   */
  @Output() editTodo = new EventEmitter<ITodo>();

  /**
   * Output event emitter for deleting a todo item.
   * 
   * When the user clicks the delete button, this event emits the todo object
   * so the parent component can handle the deletion (e.g., call API to delete).
   * 
   * Parent components can listen to this event using:
   * (deleteTodo)="handleDelete($event)"
   * 
   * @type {EventEmitter<ITodo>}
   * @public
   */
  @Output() deleteTodo = new EventEmitter<ITodo>();

  /**
   * Handles the toggle completion action.
   * 
   * This method is called when the user interacts with the completion indicator.
   * It emits the todo object through the toggleComplete EventEmitter, allowing
   * the parent component to update the completion status via the API.
   * 
   * @returns {void}
   */
  triggerToggleComplete(): void {
    if (this.todo) {
      this.toggleComplete.emit(this.todo);
    }
  }

  /**
   * Handles the edit action.
   * 
   * This method is called when the user clicks the edit button.
   * It emits the todo object through the editTodo EventEmitter, allowing
   * the parent component to handle the edit action (e.g., open edit dialog).
   * 
   * @returns {void}
   */
  triggerEdit(): void {
    if (this.todo) {
      this.editTodo.emit(this.todo);
    }
  }

  /**
   * Handles the delete action.
   * 
   * This method is called when the user clicks the delete button.
   * It emits the todo object through the deleteTodo EventEmitter, allowing
   * the parent component to handle the deletion (e.g., call delete API).
   * 
   * @returns {void}
   */
  triggerDelete(): void {
    if (this.todo) {
      this.deleteTodo.emit(this.todo);
    }
  }
}
