'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@admin/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles with enhanced contrast
      'peer h-4 w-4 shrink-0 rounded-sm border-2 transition-all duration-200',
      // Unchecked state - stronger border
      'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800',
      // Hover state
      'hover:border-primary-600 dark:hover:border-primary-400 hover:shadow-sm',
      // Focus state
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      // Checked state - enhanced contrast and visibility
      'data-[state=checked]:bg-primary-600 dark:data-[state=checked]:bg-primary-500',
      'data-[state=checked]:border-primary-600 dark:data-[state=checked]:border-primary-500',
      'data-[state=checked]:text-white data-[state=checked]:shadow-md',
      // Enhanced checked state with subtle glow
      'data-[state=checked]:shadow-primary-500/30 dark:data-[state=checked]:shadow-primary-400/30',
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-400',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        'flex items-center justify-center text-current',
        // Enhanced checkmark visibility
        'transition-all duration-200'
      )}
    >
      <Check
        className="h-3.5 w-3.5 font-bold"
        strokeWidth={3}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };