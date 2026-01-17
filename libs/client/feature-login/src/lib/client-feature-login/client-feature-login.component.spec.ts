/**
 * Unit Tests for Login Component
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the Login component separately from the actual Auth service, Router,
 * and other parts of the app.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 5. Ensure form validation and submission work correctly
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like Auth service, Router) that we control.
 * Instead of making real API calls or navigating to real routes, we use mocks that
 * pretend to be these services. This makes tests:
 * - Fast (no network calls, no navigation)
 * - Reliable (no network issues or routing side effects)
 * - Isolated (tests don't affect each other)
 * - Predictable (we control what the mocks return)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClientFeatureLoginComponent } from './client-feature-login.component';
import { Auth } from '@full-stack-todo/client/data-access';
import { ILoginPayload, ITokenResponse } from '@full-stack-todo/shared/domain';

/**
 * Mock Auth Service
 * 
 * Provides a mock implementation of the Auth service for testing.
 * Allows us to control login behavior without making real API calls.
 */
class MockAuthService {
  loginUser = jest.fn();
}

/**
 * Mock Router
 * 
 * Provides a mock implementation of the Router for testing.
 * Allows us to verify navigation calls without actually navigating.
 */
class MockRouter {
  navigate = jest.fn().mockResolvedValue(true);
}

describe('ClientFeatureLoginComponent', () => {
  let component: ClientFeatureLoginComponent;
  let fixture: ComponentFixture<ClientFeatureLoginComponent>;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    // Create fresh mocks for each test
    authService = new MockAuthService();
    router = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [ClientFeatureLoginComponent, ReactiveFormsModule],
      providers: [
        { provide: Auth, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientFeatureLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form fields', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have email control with required and email validators', () => {
      const emailControl = component.emailControl;
      expect(emailControl.hasError('required')).toBe(true);
      
      // Set invalid email format
      emailControl.setValue('invalid-email');
      expect(emailControl.hasError('email')).toBe(true);
      
      // Set valid email format
      emailControl.setValue('test@example.com');
      expect(emailControl.hasError('email')).toBe(false);
    });

    it('should have password control with required validator', () => {
      const passwordControl = component.passwordControl;
      expect(passwordControl.hasError('required')).toBe(true);
      
      // Set password value
      passwordControl.setValue('password123');
      expect(passwordControl.hasError('required')).toBe(false);
    });

    it('should provide getters for form controls', () => {
      expect(component.emailControl).toBeDefined();
      expect(component.passwordControl).toBeDefined();
      expect(component.emailControl).toBe(component.loginForm.get('email'));
      expect(component.passwordControl).toBe(component.loginForm.get('password'));
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when email is empty', () => {
      component.loginForm.patchValue({ email: '', password: 'password123' });
      expect(component.loginForm.invalid).toBe(true);
      expect(component.emailControl.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when password is empty', () => {
      component.loginForm.patchValue({ email: 'test@example.com', password: '' });
      expect(component.loginForm.invalid).toBe(true);
      expect(component.passwordControl.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when email format is invalid', () => {
      component.loginForm.patchValue({ email: 'invalid-email', password: 'password123' });
      expect(component.loginForm.invalid).toBe(true);
      expect(component.emailControl.hasError('email')).toBe(true);
    });

    it('should mark form as valid when all fields are valid', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(component.loginForm.valid).toBe(true);
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.loginForm.patchValue({ email: '', password: '' });
      component.submitForm();
      
      expect(component.emailControl.touched).toBe(true);
      expect(component.passwordControl.touched).toBe(true);
    });
  });

  describe('Form Submission', () => {
    const validLoginData: ILoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockTokenResponse: ITokenResponse = {
      access_token: 'mock-jwt-token',
    };

    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({ email: '', password: '' });
      component.submitForm();
      
      expect(authService.loginUser).not.toHaveBeenCalled();
    });

    it('should call authService.loginUser with form data when form is valid', () => {
      authService.loginUser.mockReturnValue(of(mockTokenResponse));
      component.loginForm.patchValue(validLoginData);
      
      component.submitForm();
      
      expect(authService.loginUser).toHaveBeenCalledWith(validLoginData);
      expect(authService.loginUser).toHaveBeenCalledTimes(1);
    });

    it('should navigate to dashboard on successful login', (done) => {
      authService.loginUser.mockReturnValue(of(mockTokenResponse));
      component.loginForm.patchValue(validLoginData);
      
      component.submitForm();
      
      // Wait for async operations to complete
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        done();
      }, 0);
    });

    it('should set isSubmitting to true when submitting', () => {
      authService.loginUser.mockReturnValue(of(mockTokenResponse));
      component.loginForm.patchValue(validLoginData);
      
      component.submitForm();
      
      component.isSubmitting$.subscribe((isSubmitting) => {
        expect(isSubmitting).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    const validLoginData: ILoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should handle login error and display error message', (done) => {
      const errorResponse = {
        error: {
          message: 'Invalid email or password',
        },
      };
      authService.loginUser.mockReturnValue(throwError(() => errorResponse));
      component.loginForm.patchValue(validLoginData);
      
      component.submitForm();
      
      // Wait for async operations to complete
      setTimeout(() => {
        component.errorMessage$.subscribe((errorMessage) => {
          expect(errorMessage).toBe('Invalid email or password');
          done();
        });
      }, 0);
    });

    it('should display default error message when error has no message', (done) => {
      const errorResponse = {
        error: {},
      };
      authService.loginUser.mockReturnValue(throwError(() => errorResponse));
      component.loginForm.patchValue(validLoginData);
      
      component.submitForm();
      
      // Wait for async operations to complete
      setTimeout(() => {
        component.errorMessage$.subscribe((errorMessage) => {
          expect(errorMessage).toBe('Login failed. Please check your credentials and try again.');
          done();
        });
      }, 0);
    });

    it('should set isSubmitting to false after error', (done) => {
      const errorResponse = {
        error: {
          message: 'Invalid credentials',
        },
      };
      authService.loginUser.mockReturnValue(throwError(() => errorResponse));
      component.loginForm.patchValue(validLoginData);
      
      component.submitForm();
      
      // Wait for async operations to complete
      setTimeout(() => {
        component.isSubmitting$.subscribe((isSubmitting) => {
          expect(isSubmitting).toBe(false);
          done();
        });
      }, 0);
    });

    it('should clear previous error message on new submission', (done) => {
      // First, set an error
      const errorResponse = {
        error: {
          message: 'First error',
        },
      };
      authService.loginUser.mockReturnValue(throwError(() => errorResponse));
      component.loginForm.patchValue(validLoginData);
      component.submitForm();
      
      setTimeout(() => {
        // Clear error and submit again
        const successResponse: ITokenResponse = {
          access_token: 'mock-token',
        };
        authService.loginUser.mockReturnValue(of(successResponse));
        component.submitForm();
        
        setTimeout(() => {
          component.errorMessage$.subscribe((errorMessage) => {
            expect(errorMessage).toBeNull();
            done();
          });
        }, 0);
      }, 0);
    });
  });

  describe('Observables', () => {
    it('should expose errorMessage$ as Observable', (done) => {
      component.errorMessage$.subscribe((errorMessage) => {
        expect(errorMessage).toBeNull(); // Initially null
        done();
      });
    });

    it('should expose isSubmitting$ as Observable', (done) => {
      component.isSubmitting$.subscribe((isSubmitting) => {
        expect(isSubmitting).toBe(false); // Initially false
        done();
      });
    });
  });
});
