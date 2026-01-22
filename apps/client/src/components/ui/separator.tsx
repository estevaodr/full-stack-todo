/**
 * Separator Component
 *
 * A visual separator component built on Radix UI Separator primitive.
 * Can be used horizontally or vertically to divide content sections.
 * Supports decorative mode (for visual separation only) or semantic mode
 * (for accessibility purposes).
 *
 * @example
 * ```tsx
 * <div>Content above</div>
 * <Separator />
 * <div>Content below</div>
 *
 * <Separator orientation="vertical" />
 * ```
 */

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@/lib/utils';

/**
 * Separator component with horizontal/vertical orientation support.
 *
 * @param orientation - 'horizontal' (default) or 'vertical'
 * @param decorative - If true, separator is decorative only (not announced by screen readers)
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        // Apply different dimensions based on orientation
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
