/**
 * Unit Tests for Registration Component
 * 
 * WHAT ARE UNIT TESTS?
 * ====================
 * Unit tests check that individual pieces of code (units) work correctly in isolation.
 * We test the Registration component separately from the actual User service, Router,
 * and other parts of the app.
 * 
 * WHY DO WE TEST?
 * ===============
 * 1. Catch bugs before they reach production
 * 2. Document how code should behave
 * 3. Make refactoring safer (tests tell you if you broke something)
 * 4. Build confidence when making changes
 * 5. Ensure form validation, password matching, and submission work correctly
 * 
 * WHAT ARE MOCKS?
 * ===============
 * A "mock" is a fake version of something (like User service, Router) that we control.
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
import { FeatureRegister } from './feature-register';
import { User } from '@full-stack-todo/client/data-access';
import { ICreateUser, IPublicUserData } from '@full-stack-todo/shared/domain';

/**
 * Mock User Service
 * 
 * Provides a mock implementation of the User service for testing.
 * Allows us to control user creation behavior without making real API calls.
 */
class MockUserService {
  createUser = jest.fn();
  getUser = jest.fn();
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

describe('FeatureRegister', () => {
  let component: FeatureRegister;
  let fixture: ComponentFixture<FeatureRegister>;
  let userService: MockUserService;
  let router: MockRouter;

  beforeEach(async () => {
    // Create fresh mocks for each test
    userService = new MockUserService();
    router = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [FeatureRegister, ReactiveFormsModule],
      providers: [
        { provide: User, useValue: userService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form fields', () => {
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
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

    it('should have confirmPassword control with required validator', () => {
      const confirmPasswordControl = component.confirmPasswordControl;
      expect(confirmPasswordControl.hasError('required')).toBe(true);

      // Set confirmPassword value
      confirmPasswordControl.setValue('password123');
      expect(confirmPasswordControl.hasError('required')).toBe(false);
    });

    it('should provide getters for form controls', () => {
      expect(component.emailControl).toBeDefined();
      expect(component.passwordControl).toBeDefined();
      expect(component.confirmPasswordControl).toBeDefined();
      expect(component.emailControl).toBe(component.registerForm.get('email'));
      expect(component.passwordControl).toBe(component.registerForm.get('password'));
      expect(component.confirmPasswordControl).toBe(
        component.registerForm.get('confirmPassword')
      );
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when email is empty', () => {
      component.registerForm.patchValue({
        email: '',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(component.registerForm.invalid).toBe(true);
      expect(component.emailControl.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when password is empty', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: '',
        confirmPassword: 'password123',
      });
      expect(component.registerForm.invalid).toBe(true);
      expect(component.passwordControl.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when confirmPassword is empty', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: '',
      });
      expect(component.registerForm.invalid).toBe(true);
      expect(component.confirmPasswordControl.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when email format is invalid', () => {
      component.registerForm.patchValue({
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(component.registerForm.invalid).toBe(true);
      expect(component.emailControl.hasError('email')).toBe(true);
    });

    it('should mark form as invalid when passwords do not match', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword',
      });
      // Mark both password fields as touched to trigger matching validator
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();
      expect(component.registerForm.invalid).toBe(true);
      expect(component.registerForm.hasError('matchingPasswords')).toBe(true);
    });

    it('should mark form as valid when all fields are valid and passwords match', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      // Mark both password fields as touched to trigger matching validator
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();
      expect(component.registerForm.valid).toBe(true);
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.registerForm.patchValue({
        email: '',
        password: '',
        confirmPassword: '',
      });
      component.submitForm();

      expect(component.emailControl.touched).toBe(true);
      expect(component.passwordControl.touched).toBe(true);
      expect(component.confirmPasswordControl.touched).toBe(true);
    });
  });

  describe('Password Matching Validation', () => {
    it('should not show matching error when passwords match', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      expect(component.registerForm.hasError('matchingPasswords')).toBe(false);
    });

    it('should show matching error when passwords do not match', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword',
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      expect(component.registerForm.hasError('matchingPasswords')).toBe(true);
    });

    it('should not show matching error until both fields are touched', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword',
      });
      // Only touch one field
      component.passwordControl.markAsTouched();

      // Should not show error until both are touched
      expect(component.registerForm.hasError('matchingPasswords')).toBe(false);
    });
  });

  describe('Form Submission', () => {
    const validRegisterData: ICreateUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUserResponse: IPublicUserData = {
      id: 'user-123',
      email: 'test@example.com',
      todos: [],
    };

    it('should not submit when form is invalid', () => {
      component.registerForm.patchValue({
        email: '',
        password: '',
        confirmPassword: '',
      });
      component.submitForm();

      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should call userService.createUser with form data when form is valid', () => {
      userService.createUser.mockReturnValue(of(mockUserResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      // Mark password fields as touched to satisfy matching validator
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      component.submitForm();

      expect(userService.createUser).toHaveBeenCalledWith(validRegisterData);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should navigate to login on successful registration', (done) => {
      userService.createUser.mockReturnValue(of(mockUserResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      component.submitForm();

      // Wait for async operations to complete
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        done();
      }, 0);
    });

    it('should set isSubmitting to true when submitting', () => {
      userService.createUser.mockReturnValue(of(mockUserResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      component.submitForm();

      component.isSubmitting$.subscribe((isSubmitting) => {
        expect(isSubmitting).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    const validRegisterData: ICreateUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should handle registration error and display error message', (done) => {
      const errorResponse = {
        error: {
          message: 'Email already exists',
        },
      };
      userService.createUser.mockReturnValue(throwError(() => errorResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      component.submitForm();

      // Wait for async operations to complete
      setTimeout(() => {
        component.errorMessage$.subscribe((errorMessage) => {
          expect(errorMessage).toBe('Email already exists');
          done();
        });
      }, 0);
    });

    it('should display default error message when error has no message', (done) => {
      const errorResponse = {
        error: {},
      };
      userService.createUser.mockReturnValue(throwError(() => errorResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

      component.submitForm();

      // Wait for async operations to complete
      setTimeout(() => {
        component.errorMessage$.subscribe((errorMessage) => {
          expect(errorMessage).toBe(
            'Registration failed. Please check your information and try again.'
          );
          done();
        });
      }, 0);
    });

    it('should set isSubmitting to false after error', (done) => {
      const errorResponse = {
        error: {
          message: 'Registration failed',
        },
      };
      userService.createUser.mockReturnValue(throwError(() => errorResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();

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
      userService.createUser.mockReturnValue(throwError(() => errorResponse));
      component.registerForm.patchValue({
        email: validRegisterData.email,
        password: validRegisterData.password,
        confirmPassword: validRegisterData.password,
      });
      component.passwordControl.markAsTouched();
      component.confirmPasswordControl.markAsTouched();
      component.submitForm();

      setTimeout(() => {
        // Clear error and submit again
        const successResponse: IPublicUserData = {
          id: 'user-123',
          email: validRegisterData.email,
          todos: [],
        };
        userService.createUser.mockReturnValue(of(successResponse));
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
