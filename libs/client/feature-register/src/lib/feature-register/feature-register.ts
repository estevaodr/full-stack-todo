import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { User } from '@full-stack-todo/client/data-access';
import { ICreateUser } from '@full-stack-todo/shared/domain';
import { matchingPasswordsValidator } from '../matching-passwords.validator';

/**
 * Registration Component
 * 
 * A standalone component for user registration.
 * Provides a form with email, password, and confirm password fields for creating new accounts.
 * 
 * Features:
 * - Reactive forms with validation
 * - Password matching validation
 * - Error handling and display
 * - Loading state during submission
 * - Automatic navigation on successful registration
 */
@Component({
  selector: 'lib-feature-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feature-register.html',
  styleUrl: './feature-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureRegister {
  /**
   * Injected User service for user creation operations
   */
  private readonly userService = inject(User);

  /**
   * Injected Router for navigation after successful registration
   */
  private readonly router = inject(Router);

  /**
   * Reactive form group for registration form
   * Contains email, password, and confirmPassword form controls with validation
   * Uses matchingPasswordsValidator at the form level to ensure passwords match
   */
  registerForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: matchingPasswordsValidator('password', 'confirmPassword'),
    }
  );

  /**
   * BehaviorSubject for managing error messages
   * Used to display server-side errors (e.g., email already exists)
   */
  private errorMessageSubject$ = new BehaviorSubject<string | null>(null);

  /**
   * Observable for error messages
   * Components can subscribe to this to display errors
   */
  readonly errorMessage$: Observable<string | null> = this.errorMessageSubject$.asObservable();

  /**
   * BehaviorSubject for managing submission state
   * Used to show loading state during registration request
   */
  private isSubmittingSubject$ = new BehaviorSubject<boolean>(false);

  /**
   * Observable for submission state
   * Components can subscribe to this to show loading indicators
   */
  readonly isSubmitting$: Observable<boolean> = this.isSubmittingSubject$.asObservable();

  /**
   * Getter for email FormControl
   * Provides convenient access to the email control for template binding
   */
  get emailControl(): FormControl<string | null> {
    return this.registerForm.get('email') as FormControl<string | null>;
  }

  /**
   * Getter for password FormControl
   * Provides convenient access to the password control for template binding
   */
  get passwordControl(): FormControl<string | null> {
    return this.registerForm.get('password') as FormControl<string | null>;
  }

  /**
   * Getter for confirmPassword FormControl
   * Provides convenient access to the confirmPassword control for template binding
   */
  get confirmPasswordControl(): FormControl<string | null> {
    return this.registerForm.get('confirmPassword') as FormControl<string | null>;
  }

  /**
   * Handles form submission
   * 
   * Validates the form, calls the user service to create a new user,
   * handles errors, and navigates to login on success.
   */
  submitForm(): void {
    // Clear any previous errors
    this.errorMessageSubject$.next(null);

    // Check if form is valid
    if (this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
      return;
    }

    // Get form values
    const formValue = this.registerForm.value;
    const createUserPayload: ICreateUser = {
      email: formValue.email || '',
      password: formValue.password || '',
    };

    // Set submitting state
    this.isSubmittingSubject$.next(true);

    // Call user service to create user
    this.userService
      .createUser(createUserPayload)
      .pipe(
        tap(() => {
          // On success, navigate to login page
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          // Handle errors
          this.isSubmittingSubject$.next(false);

          // Extract error message from response
          const errorMessage =
            error?.error?.message ||
            'Registration failed. Please check your information and try again.';
          this.errorMessageSubject$.next(errorMessage);

          // Return empty observable to prevent error propagation
          return of(null);
        })
      )
      .subscribe();
  }
}
