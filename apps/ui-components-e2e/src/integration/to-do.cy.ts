/**
 * E2E Tests for To-Do Component
 * 
 * These tests verify that the TodoComponent works correctly when rendered
 * in Storybook. The tests run against a live Storybook server and interact
 * with the component as a user would.
 * 
 * The tests verify:
 * - Component renders correctly
 * - Delete button is clickable and triggers the deleteTodo action
 * - Title can be edited (if edit-in-place is implemented)
 * 
 * To run these tests:
 * npx nx e2e ui-components-e2e
 * 
 * To run in watch mode:
 * npx nx e2e ui-components-e2e --watch
 */

describe('To-Do Component', () => {
  /**
   * Before each test, navigate to the Storybook iframe containing
   * the TodoComponent's primary story.
   * 
   * The `id` parameter is a slugified version of the story title
   * defined in the component's *.stories.ts file.
   * Format: <story-title-slug>--<story-name-slug>
   * The title 'Components/ToDo' becomes 'components-todo'
   * Example: 'components-todo--primary'
   */
  beforeEach(() => cy.visit('/iframe.html?id=components-todo--primary'));

  /**
   * Basic rendering test - ensures the component exists in the DOM.
   * This is the minimum test needed to verify the component loads.
   */
  it('should render the component', () => {
    cy.get('fst-todo').should('exist');
  });

  /**
   * Test that the delete button is clickable and triggers the deleteTodo action.
   * 
   * This test:
   * 1. Sets up a listener for the 'click' action using our custom command
   * 2. Clicks the delete button (identified by the .btn--danger class)
   * 3. Verifies that the action was triggered
   * 
   * Note: The button selector (.btn--danger) is used because it's the only
   * button with that class in the component. In a production environment,
   * you might want to use a more specific selector or data-testid attribute.
   */
  it('should detect clicks on the delete button', () => {
    /**
     * Use the custom command to add an event listener 
     * for the 'click' action at the `document`-level.
     *
     * Don't forget that with Javascript, unless you
     * have custom event handling code in place, 
     * events in the DOM bubble up - meaning our event
     * listener at the root level will detect a click
     * on a child element
     */ 
    cy.storyAction('deleteTodo');
    
    /**
     * Tell the browser to interact with (click) on the
     * button with a `.btn--danger` class. Is this really
     * reliable or the best way to refer to a specific element?
     * Not exactly, but for now that button is the only one
     * with that class on it
     */
    cy.get('.btn--danger').click();
    
    /**
     * Use Cypress' `should` syntax to ensure our event listener
     * detected the click - meaning the button was successfully
     * interacted with (an element with that class was found)
     */
    cy.get('@deleteTodo').should('have.been.calledOnce');
  });

  /**
   * Test that the title element exists and is visible.
   * 
   * Note: The original test expected edit-in-place functionality,
   * but the current TodoComponent implementation doesn't include
   * @ngneat/edit-in-place. The component emits an editTodo event
   * when the edit button is clicked, but doesn't support inline editing.
   * This test verifies the title is displayed correctly instead.
   */
  it('should display the title element', () => {
    /**
     * Verify the title element exists and is visible
     */
    cy.get('.todo__title').should('exist').and('be.visible');
    
    /**
     * Verify the title contains text (not empty)
     */
    cy.get('.todo__title').should('not.be.empty');
  });

  /**
   * Additional test: Verify that the component displays todo data correctly.
   * This ensures the component receives and displays the todo prop.
   */
  it('should display todo data', () => {
    // The component should have a title element
    cy.get('.todo__title').should('exist');
    
    // The component should have a description element
    cy.get('.todo__description').should('exist');
    
    // The component should have an ID element
    cy.get('.todo__id').should('exist');
  });

  /**
   * Test that the completion toggle button works.
   * This verifies the toggleComplete action is triggered.
   */
  it('should toggle completion status when completion button is clicked', () => {
    cy.storyAction('toggleComplete');
    
    // Click the completion toggle button
    cy.get('.todo__completed').click();
    
    // Verify the action was triggered
    cy.get('@toggleComplete').should('have.been.calledOnce');
  });

  /**
   * Test that the edit button works (if not disabled).
   * This verifies the editTodo action is triggered.
   */
  it('should trigger edit action when edit button is clicked', () => {
    // First, ensure we have an incomplete todo (edit is disabled for completed todos)
    // We'll visit the incomplete story for this test
    cy.visit('/iframe.html?id=components-todo--incomplete');
    
    cy.storyAction('editTodo');
    
    // Click the edit button
    cy.get('.btn--primary.btn--icon-only').click();
    
    // Verify the action was triggered
    cy.get('@editTodo').should('have.been.calledOnce');
  });
});

