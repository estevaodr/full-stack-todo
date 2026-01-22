/**
 * Input Component
 *
 * A styled input field component that extends the native HTML input element.
 * Includes proper focus states, disabled states, and file input styling.
 * Uses Tailwind CSS for styling with theme-aware colors.
 *
 * @example
 * ```tsx
 * <Input type="text" placeholder="Enter your name" />
 * <Input type="email" required />
 * <Input type="password" disabled />
 * ```
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Input component props.
 * Extends all standard HTML input attributes.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component with consistent styling and accessibility.
 * Supports all input types (text, email, password, file, etc.).
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base input styles with focus, disabled, and file input support
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
