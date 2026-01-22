/**
 * Utility Functions
 *
 * This file contains shared utility functions used throughout the application.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges Tailwind CSS class names.
 *
 * This function intelligently merges class names using clsx for conditional
 * classes and tailwind-merge to resolve Tailwind class conflicts (e.g., if
 * both 'p-2' and 'p-4' are provided, only 'p-4' will be in the final output).
 *
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', isActive && 'bg-primary', className)
 * cn('p-2', 'p-4') // Returns 'p-4' (conflict resolved)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
