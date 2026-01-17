import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Matching Passwords Validator
 * 
 * A custom validator function that checks if two password fields match.
 * This validator is used in registration forms to ensure the user has
 * correctly confirmed their password.
 * 
 * How it works:
 * 1. Takes two form control names as parameters (password and confirmPassword)
 * 2. Returns a validator function that checks if both controls have the same value
 * 3. Returns a validation error if passwords don't match
 * 4. Returns null if passwords match (validation passes)
 * 
 * Usage:
 * ```typescript
 * this.registerForm = new FormGroup({
 *   password: new FormControl('', [Validators.required]),
 *   confirmPassword: new FormControl('', [Validators.required]),
 * }, { validators: matchingPasswordsValidator('password', 'confirmPassword') });
 * ```
 * 
 * @param passwordControlName - The name of the password FormControl
 * @param confirmPasswordControlName - The name of the confirm password FormControl
 * @returns A ValidatorFn that checks if the two password fields match
 */
export function matchingPasswordsValidator(
  passwordControlName: string,
  confirmPasswordControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get(passwordControlName);
    const confirmPasswordControl = control.get(confirmPasswordControlName);

    // If either control doesn't exist, return null (let other validators handle it)
    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    // If either control hasn't been touched yet, don't show validation error
    // This prevents showing errors before the user has had a chance to fill in both fields
    if (!passwordControl.touched && !confirmPasswordControl.touched) {
      return null;
    }

    // Check if passwords match
    if (passwordControl.value !== confirmPasswordControl.value) {
      // Return error object with the control name for easy access in templates
      return {
        matchingPasswords: {
          passwordControl: passwordControlName,
          confirmPasswordControl: confirmPasswordControlName,
        },
      };
    }

    // Passwords match, validation passes
    return null;
  };
}
