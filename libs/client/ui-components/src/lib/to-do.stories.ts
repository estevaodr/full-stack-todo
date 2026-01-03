/**
 * Storybook Stories for ToDo Component
 * 
 * Storybook stories allow us to develop and test components in isolation
 * without running the full application. Each story represents a different
 * state or use case of the component.
 * 
 * This file uses:
 * - @ngneat/falso for generating random test data
 * - Storybook's Meta and StoryObj types for type safety
 * - Action handlers to log component interactions
 * 
 * Stories Defined:
 * - Primary: Default story with a randomly generated todo item
 * - Completed: Story showing a completed todo
 * - Incomplete: Story showing an incomplete todo
 * 
 * To view these stories, run:
 * npx nx run ui-components:storybook
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { ToDoComponent } from './to-do';
import { randBoolean, randProduct } from '@ngneat/falso';
import { ITodo } from '@full-stack-todo/shared/domain';

/**
 * Helper function to generate a random todo item for testing.
 * 
 * Uses @ngneat/falso to generate realistic test data:
 * - randProduct() provides realistic product names for title/description
 * - randBoolean() randomly sets the completed status
 * 
 * This allows us to see how the component looks with different data
 * without needing to connect to a real API.
 * 
 * @returns {ITodo} A randomly generated todo item
 */
const randTodo = (): ITodo => {
  const { id, title, description } = randProduct();
  return {
    id: id.toString(),
    title: title || 'Sample Todo',
    description: description || 'This is a sample todo description',
    completed: randBoolean(),
  };
};

/**
 * Storybook Meta configuration for the ToDo component.
 * 
 * This defines:
 * - Component to display
 * - Default arguments (props)
 * - Action handlers for component outputs
 * - Story categorization and documentation
 */
const meta: Meta<ToDoComponent> = {
  title: 'Components/ToDo',
  component: ToDoComponent,
  parameters: {
    // Documentation and controls
    docs: {
      description: {
        component: 'A standalone Angular component that displays a single todo item with interactive controls for toggling completion status, editing, and deletion.',
      },
    },
  },
  // Define action handlers for component outputs
  // These will log to the Storybook Actions panel when events are emitted
  argTypes: {
    toggleComplete: {
      action: 'toggleComplete',
      description: 'Emitted when the user toggles the completion status',
    },
    editTodo: {
      action: 'editTodo',
      description: 'Emitted when the user clicks the edit button',
    },
    deleteTodo: {
      action: 'deleteTodo',
      description: 'Emitted when the user clicks the delete button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ToDoComponent>;

/**
 * Primary story - the default representation of the component.
 * 
 * This story shows the component with a randomly generated todo item.
 * It's useful for seeing how the component looks with various data.
 */
export const Primary: Story = {
  args: {
    todo: randTodo(),
  },
};

/**
 * Completed story - shows a todo item that is marked as complete.
 * 
 * This story demonstrates the completed state of the component,
 * including the visual indicator and styling differences.
 */
export const Completed: Story = {
  args: {
    todo: {
      id: '1',
      title: 'Completed Task',
      description: 'This task has been completed successfully.',
      completed: true,
    },
  },
};

/**
 * Incomplete story - shows a todo item that is not yet complete.
 * 
 * This story demonstrates the incomplete state of the component,
 * showing the default styling and empty completion indicator.
 */
export const Incomplete: Story = {
  args: {
    todo: {
      id: '2',
      title: 'Incomplete Task',
      description: 'This task still needs to be completed.',
      completed: false,
    },
  },
};

