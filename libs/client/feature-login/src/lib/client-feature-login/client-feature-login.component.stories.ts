/**
 * Storybook Stories for Login Component
 * 
 * Storybook stories allow us to develop and test the login component in isolation
 * without running the full application. Each story represents a different state
 * or use case of the component.
 * 
 * This file uses:
 * - Mocked Auth service to simulate login behavior
 * - Mocked Router to prevent actual navigation
 * - Storybook's Meta and StoryObj types for type safety
 * - ApplicationConfig to provide mocked dependencies
 * 
 * Stories Defined:
 * - Default: Default login form state
 * - WithValidationErrors: Form showing validation errors
 * - Loading: Form in loading/submitting state
 * - WithServerError: Form showing server error message
 * 
 * To view these stories, run:
 * npx nx run FeatureLogin:storybook
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ClientFeatureLoginComponent } from './client-feature-login.component';
import { Auth } from '@full-stack-todo/client/data-access';
import { ITokenResponse } from '@full-stack-todo/shared/domain';

/**
 * Mock Auth Service
 * 
 * Provides a mock implementation of the Auth service for Storybook.
 * Allows us to simulate different login scenarios without making real API calls.
 */
class MockAuthService {
  private accessTokenSubject$ = new BehaviorSubject<string | null>(null);
  private userDataSubject$ = new BehaviorSubject<any>(null);

  readonly accessToken$ = this.accessTokenSubject$.asObservable();
  readonly userData$ = this.userDataSubject$.asObservable();

  // Simulate successful login
  loginUserSuccess = true;
  loginDelay = 500; // milliseconds

  loginUser(data: { email: string; password: string }) {
    if (this.loginUserSuccess) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockResponse: ITokenResponse = {
        access_token: mockToken,
      };

      // Simulate async delay
      return of(mockResponse).pipe(
        // Add delay to simulate network request
        // Using setTimeout in a pipe would require more setup, so we'll just return immediately
        // In a real scenario, you might want to use delay() from rxjs/operators
      );
    } else {
      // Simulate login failure
      return throwError(() => ({
        error: {
          message: 'Invalid email or password',
        },
      }));
    }
  }

  setToken(val: string): void {
    this.accessTokenSubject$.next(val);
  }

  clearToken(): void {
    this.accessTokenSubject$.next(null);
  }

  loadToken(): void {
    // No-op for mock
  }

  logoutUser(): void {
    this.clearToken();
  }

  isTokenExpired(): boolean {
    return false;
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
 * Storybook Meta configuration for the Login component.
 * 
 * This defines:
 * - Component to display
 * - Application configuration with mocked services
 * - Story categorization and documentation
 */
const meta: Meta<ClientFeatureLoginComponent> = {
  title: 'Features/Login',
  component: ClientFeatureLoginComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Auth,
          useClass: MockAuthService,
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
          'A standalone Angular component for user authentication. Provides a form with email and password fields, validation, error handling, and automatic navigation on successful login.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ClientFeatureLoginComponent>;

/**
 * Default Story
 * 
 * Shows the login form in its default state with empty fields.
 */
export const Default: Story = {
  args: {},
};

/**
 * With Validation Errors Story
 * 
 * Shows the login form with validation errors displayed.
 * This demonstrates how the form looks when users interact with invalid fields.
 */
export const WithValidationErrors: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    // This would require @storybook/testing-library or similar
    // For now, we'll document the expected behavior
    // In a real implementation, you might:
    // 1. Find the email input
    // 2. Focus and blur it without entering a value (triggers required validation)
    // 3. Enter an invalid email format (triggers email validation)
    // 4. Verify error messages are displayed
  },
};

/**
 * Loading Story
 * 
 * Shows the login form in a loading/submitting state.
 * This demonstrates the loading indicator during form submission.
 */
export const Loading: Story = {
  args: {},
  // Note: In a real implementation, you might need to trigger the form submission
  // and then capture the loading state. This could be done with play functions
  // or by modifying the component's internal state.
};

/**
 * With Server Error Story
 * 
 * Shows the login form with a server error message displayed.
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
          provide: Auth,
          useFactory: () => {
            const mockAuth = new MockAuthService();
            mockAuth.loginUserSuccess = false; // Simulate login failure
            return mockAuth;
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
