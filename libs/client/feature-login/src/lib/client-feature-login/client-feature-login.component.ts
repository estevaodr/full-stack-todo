import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Auth } from '@full-stack-todo/client/data-access';
import { ILoginPayload } from '@full-stack-todo/shared/domain';

/**
 * Login Component
 * 
 * A standalone component for user authentication.
 * Provides a form with email and password fields for logging in.
 * 
 * Features:
 * - Reactive forms with validation
 * - Error handling and display
 * - Loading state during submission
 * - Automatic navigation on successful login
 */
@Component({
  selector: 'lib-client-feature-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-feature-login.component.html',
  styleUrl: './client-feature-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFeatureLoginComponent {
  /**
   * Injected Auth service for authentication operations
   */
  private readonly authService = inject(Auth);

  /**
   * Injected Router for navigation after successful login
   */
  private readonly router = inject(Router);

  /**
   * Reactive form group for login form
   * Contains email and password form controls with validation
   */
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  /**
   * BehaviorSubject for managing error messages
   * Used to display server-side errors (e.g., invalid credentials)
   */
  private errorMessageSubject$ = new BehaviorSubject<string | null>(null);

  /**
   * Observable for error messages
   * Components can subscribe to this to display errors
   */
  readonly errorMessage$: Observable<string | null> = this.errorMessageSubject$.asObservable();

  /**
   * BehaviorSubject for managing submission state
   * Used to show loading state during login request
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
    return this.loginForm.get('email') as FormControl<string | null>;
  }

  /**
   * Getter for password FormControl
   * Provides convenient access to the password control for template binding
   */
  get passwordControl(): FormControl<string | null> {
    return this.loginForm.get('password') as FormControl<string | null>;
  }

  /**
   * Handles form submission
   * 
   * Validates the form, calls the auth service to login,
   * handles errors, and navigates to dashboard on success.
   */
  submitForm(): void {
    // Clear any previous errors
    this.errorMessageSubject$.next(null);

    // Check if form is valid
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
      return;
    }

    // Get form values
    const formValue = this.loginForm.value;
    const loginPayload: ILoginPayload = {
      email: formValue.email || '',
      password: formValue.password || '',
    };

    // Set submitting state
    this.isSubmittingSubject$.next(true);

    // Call auth service to login
    this.authService
      .loginUser(loginPayload)
      .pipe(
        tap(() => {
          // On success, navigate to dashboard
          this.router.navigate(['/dashboard']);
        }),
        catchError((error) => {
          // Handle errors
          this.isSubmittingSubject$.next(false);
          
          // Extract error message from response
          const errorMessage = error?.error?.message || 'Login failed. Please check your credentials and try again.';
          this.errorMessageSubject$.next(errorMessage);
          
          // Return empty observable to prevent error propagation
          return of(null);
        })
      )
      .subscribe();
  }
}
