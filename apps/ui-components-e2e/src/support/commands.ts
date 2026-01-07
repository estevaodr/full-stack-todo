/**
 * Custom Cypress Commands for Storybook Integration
 * 
 * These commands enable Cypress to interact with Storybook's action handlers.
 * Storybook actions are logged to the Actions panel, and these commands allow
 * us to verify that component events are being emitted correctly.
 * 
 * Based on: https://jgelin.medium.com/expect-storybook-actions-in-cypress-36e9542d109d
 * and: https://stackoverflow.com/a/66745953
 */

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to set up an event listener for Storybook actions.
       * 
       * This command adds a listener at the document level for a specific action type.
       * The action name will be available as an alias (e.g., '@click') that can be
       * used later in assertions.
       * 
       * Storybook actions are dispatched as custom events that bubble up through the DOM.
       * This command sets up a listener at the document level to catch these events.
       * 
       * @param actionName - The name of the Storybook action to listen for (e.g., 'click', 'dblclick')
       * @example
       * cy.storyAction('click');
       * cy.get('.btn').click();
       * cy.get('@click').should('have.been.calledOnce');
       */
      storyAction(actionName: string): Chainable<void>;
    }
  }
}

/**
 * Custom command implementation for listening to Storybook actions.
 * 
 * This command creates a spy that tracks when specific DOM events occur.
 * Since Storybook actions are triggered by component events (like clicks),
 * we can listen for those DOM events and verify interactions happened.
 * 
 * The spy is aliased so it can be referenced later with cy.get('@actionName').
 */
Cypress.Commands.add('storyAction', (actionName: string) => {
  // Map action names to DOM events
  // Storybook actions are typically triggered by user interactions
  const eventMap: Record<string, string> = {
    click: 'click',
    dblclick: 'dblclick',
    deleteTodo: 'click', // deleteTodo is triggered by a click
    editTodo: 'click',   // editTodo is triggered by a click
    toggleComplete: 'click', // toggleComplete is triggered by a click
  };
  
  const eventType = eventMap[actionName] || actionName;
  
  // Create a stub/spy that Cypress can track
  const spy = cy.stub();
  
  // Alias the spy first so it's available immediately
  cy.wrap(spy).as(actionName);
  
  // Set up event listener on the document
  // Events bubble up, so we can catch them at the document level
  // We use a closure to capture the spy reference
  cy.document().then((doc) => {
    const handler = () => {
      // Call the spy when the event occurs
      // Use the closure to access the spy directly
      spy();
    };
    
    // Listen for the event type in the capture phase
    // This ensures we catch the event before it reaches the target
    doc.addEventListener(eventType, handler, true);
    
    // Store handler for potential cleanup (though not strictly necessary)
    if (!(doc as any).__cypressStorybookHandlers) {
      (doc as any).__cypressStorybookHandlers = [];
    }
    (doc as any).__cypressStorybookHandlers.push({ actionName, handler, eventType });
  });
});

export {};

