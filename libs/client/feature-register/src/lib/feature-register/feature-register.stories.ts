/**
 * Storybook Stories for Registration Component
 * 
 * Storybook stories allow us to develop and test the registration component in isolation
 * without running the full application. Each story represents a different state
 * or use case of the component.
 * 
 * This file uses:
 * - Mocked User service to simulate user creation behavior
 * - Mocked Router to prevent actual navigation
 * - Storybook's Meta and StoryObj types for type safety
 * - ApplicationConfig to provide mocked dependencies
 * 
 * Stories Defined:
 * - Default: Default registration form state
 * - WithValidationErrors: Form showing validation errors
 * - Loading: Form in loading/submitting state
 * - WithServerError: Form showing server error message
 * 
 * To view these stories, run:
 * npx nx run FeatureRegister:storybook
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FeatureRegister } from './feature-register';
import { User } from '@full-stack-todo/client/data-access';
import { IPublicUserData } from '@full-stack-todo/shared/domain';

/**
 * Mock User Service
 * 
 * Provides a mock implementation of the User service for Storybook.
 * Allows us to simulate different user creation scenarios without making real API calls.
 */
class MockUserService {
  // Simulate successful user creation
  createUserSuccess = true;

  createUser(data: { email: string; password: string }) {
    if (this.createUserSuccess) {
      const mockUser: IPublicUserData = {
        id: `user-${Date.now()}`,
        email: data.email,
        todos: [],
      };

      // Simulate async response
      return of(mockUser);
    } else {
      // Simulate user creation failure
      return throwError(() => ({
        error: {
          message: 'Email already exists',
        },
      }));
    }
  }

  getUser(userId: string) {
    // Not used in registration, but required by interface
    return of({} as IPublicUserData);
  }
}

/**
 * Mock Router
 * 
 * Provides a mock implementation of Angular Router for Storybook.
 * Prevents actual navigation and allows us to verify navigation calls.
 */
class MockRouter {
  navigateCalled = false;
  navigatePath: string[] | null = null;

  navigate(path: string[]): Promise<boolean> {
    this.navigateCalled = true;
    this.navigatePath = path;
    return Promise.resolve(true);
  }

  initialNavigation(): void {
    // Mock implementation for Storybook - no-op
  }
}

/**
 * Storybook Meta configuration for the Registration component.
 * 
 * This defines:
 * - Component to display
 * - Application configuration with mocked services
 * - Story categorization and documentation
 */
const meta: Meta<FeatureRegister> = {
  title: 'Features/Register',
  component: FeatureRegister,
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: User,
          useClass: MockUserService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A standalone Angular component for user registration. Provides a form with email, password, and confirm password fields, validation including password matching, error handling, and automatic navigation on successful registration.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FeatureRegister>;

/**
 * Default Story
 * 
 * Shows the registration form in its default state with empty fields.
 */
export const Default: Story = {
  args: {},
};

/**
 * With Validation Errors Story
 * 
 * Shows the registration form with validation errors displayed.
 * This demonstrates how the form looks when users interact with invalid fields.
 */
export const WithValidationErrors: Story = {
  args: {},
  // Note: In a real implementation, you might use play functions to interact
  // with the form and trigger validation errors
};

/**
 * Loading Story
 * 
 * Shows the registration form in a loading/submitting state.
 * This demonstrates the loading indicator during form submission.
 */
export const Loading: Story = {
  args: {},
  // Note: In a real implementation, you might need to trigger the form submission
  // and then capture the loading state.
};

/**
 * With Server Error Story
 * 
 * Shows the registration form with a server error message displayed.
 * This demonstrates how server-side errors are handled and displayed.
 */
export const WithServerError: Story = {
  args: {},
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: User,
          useFactory: () => {
            const mockUser = new MockUserService();
            mockUser.createUserSuccess = false; // Simulate user creation failure
            return mockUser;
          },
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ],
    }),
  ],
};
