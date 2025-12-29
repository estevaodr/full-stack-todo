Feature: Todo Management
  As a user
  I want to manage my todos
  So that I can track and organize my tasks

  Background:
    Given the application is running
    And I am on the todo application page

  Scenario: View empty todo list
    Given there are no todos in the system
    When I view the todo list
    Then I should see an empty state message
    And I should see "No todos yet. Create your first todo!"

  Scenario: Create a new todo
    Given I am on the todo application page
    When I fill in the title field with "Buy groceries"
    And I fill in the description field with "Milk, eggs, bread"
    And I click the "Create Todo" button
    Then I should see a new todo in the list
    And the todo should have title "Buy groceries"
    And the todo should have description "Milk, eggs, bread"
    And the todo should not be completed

  Scenario: Create todo with empty fields
    Given I am on the todo application page
    When I click the "Create Todo" button without filling any fields
    Then I should see an error message "Title and description are required"
    And the "Create Todo" button should be disabled

  Scenario: Toggle todo completion status
    Given I have created a todo with title "Complete project"
    When I click the checkbox for that todo
    Then the todo should be marked as completed
    And the todo should have a completed styling

  Scenario: Delete a todo
    Given I have created a todo with title "Delete me"
    When I click the "Delete" button for that todo
    And I confirm the deletion
    Then the todo should be removed from the list

  Scenario: Cancel todo deletion
    Given I have created a todo with title "Keep me"
    When I click the "Delete" button for that todo
    And I cancel the deletion confirmation
    Then the todo should still be in the list

  Scenario: View multiple todos
    Given I have created 3 todos
    When I view the todo list
    Then I should see all 3 todos displayed
    And each todo should show its title and description
    And each todo should show creation and update timestamps

  Scenario: Create multiple todos sequentially
    Given I am on the todo application page
    When I create a todo with title "First task"
    And I create a todo with title "Second task"
    And I create a todo with title "Third task"
    Then I should see all 3 todos in the list
    And the todos should be displayed in the order they were created

  Scenario: Handle server errors gracefully
    Given the server is unavailable
    When I try to create a todo
    Then I should see an error message
    And the error message should indicate the operation failed

