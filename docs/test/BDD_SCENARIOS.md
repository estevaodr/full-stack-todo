# BDD Scenarios

This document outlines the Behavior-Driven Development (BDD) scenarios for the Full-Stack Todo application. These scenarios define the expected behavior of the application from a user's perspective and serve as the foundation for automated End-to-End (E2E) tests.

## 1. Authentication

### Feature: User Registration
**As a** new user  
**I want to** register for an account  
**So that** I can securely manage my todo items  

**Scenario: Successful registration**
- **Given** I am on the registration page
- **When** I enter a valid email and a strong password
- **And** I submit the registration form
- **Then** I should be redirected to the dashboard
- **And** I should see a success message "Account created successfully"

**Scenario: Registration with existing email**
- **Given** an account already exists with the email "user@example.com"
- **And** I am on the registration page
- **When** I enter "user@example.com" and a valid password
- **And** I submit the registration form
- **Then** I should see an error message "Email already in use"
- **And** I should remain on the registration page

### Feature: User Login
**As a** registered user  
**I want to** log in to my account  
**So that** I can access my tasks  

**Scenario: Successful login**
- **Given** I have a registered account
- **And** I am on the login page
- **When** I enter my valid credentials
- **And** I submit the login form
- **Then** I should be redirected to the dashboard
- **And** I should see my todo list

**Scenario: Failed login with invalid credentials**
- **Given** I am on the login page
- **When** I enter an invalid email or password
- **And** I submit the login form
- **Then** I should see an error message "Invalid credentials"

## 2. Todo Management

### Feature: Task Lifecycle
**As an** authenticated user  
**I want to** manage my tasks  
**So that** I can stay organized  

**Scenario: Creating a new task**
- **Given** I am logged in and on the dashboard
- **When** I enter "Finish documentation" in the new task input
- **And** I press "Add Task"
- **Then** "Finish documentation" should appear in my task list
- **And** the total task count should increase by one

**Scenario: Completing a task**
- **Given** I have a task "Finish documentation" in my list
- **When** I click the checkbox next to "Finish documentation"
- **Then** the task should be visually marked as completed
- **And** the status should be persisted on the server

**Scenario: Deleting a task**
- **Given** I have a task "Finish documentation" in my list
- **When** I click the delete icon next to "Finish documentation"
- **Then** the task should be removed from the list
- **And** I should see a confirmation message

## 3. Security

### Feature: Route Protection
**As a** system administrator  
**I want to** ensure protected routes are only accessible to authenticated users  
**So that** user data remains private  

**Scenario: Unauthorized access to dashboard**
- **Given** I am not logged in
- **When** I attempt to navigate to `/dashboard` directly
- **Then** I should be redirected to the `/login` page
- **And** I should be prompted to log in before proceeding
