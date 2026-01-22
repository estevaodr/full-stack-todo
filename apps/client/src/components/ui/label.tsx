/**
 * Label Component
 *
 * An accessible label component built on Radix UI Label primitive.
 * Automatically handles disabled states and peer element relationships.
 * Used for form field labels with proper accessibility attributes.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <Label htmlFor="password" className="text-sm">Password</Label>
 * ```
 */

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Label variant styles.
 * Currently uses default styling but can be extended with variants.
 */
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

/**
 * Label component with accessibility features.
 * Properly associates with form inputs and handles disabled states.
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
