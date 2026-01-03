/**
 * Edit Todo Dialog Component
 * 
 * A modal dialog component for editing todo items.
 * Displays a form with title and description fields in a single popup.
 * 
 * This component:
 * - Shows a modal overlay with a form
 * - Allows editing both title and description in one place
 * - Emits the updated todo when saved
 * - Can be closed by clicking outside or cancel button
 */

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITodo } from '@full-stack-todo/shared/domain';

@Component({
  selector: 'fst-edit-todo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-todo-dialog.html',
  styleUrls: ['./edit-todo-dialog.scss'],
})
export class EditTodoDialogComponent implements OnChanges {
  /**
   * The todo item being edited
   */
  @Input() todo: ITodo | null = null;

  /**
   * Whether the dialog is visible
   */
  @Input() visible: boolean = false;

  /**
   * Emits when the user saves the changes
   * Passes the updated todo data (title and description)
   */
  @Output() save = new EventEmitter<{ title: string; description: string }>();

  /**
   * Emits when the user cancels editing
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Local form data
   */
  formData = {
    title: '',
    description: '',
  };

  /**
   * Watches for changes to the todo input
   * Updates form data when todo changes
   */
  ngOnChanges(): void {
    if (this.todo) {
      this.formData = {
        title: this.todo.title || '',
        description: this.todo.description || '',
      };
    }
  }

  /**
   * Handles the save action
   * Validates and emits the updated data
   */
  onSave(): void {
    const trimmedTitle = this.formData.title.trim();
    if (!trimmedTitle) {
      alert('Title cannot be empty.');
      return;
    }

    this.save.emit({
      title: trimmedTitle,
      description: this.formData.description.trim(),
    });
  }

  /**
   * Handles the cancel action
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Handles clicking on the backdrop (overlay)
   * Closes the dialog when clicking outside
   */
  onBackdropClick(event: MouseEvent): void {
    // Only close if clicking directly on the backdrop, not on the dialog content
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onCancel();
    }
  }
}

