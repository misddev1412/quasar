'use client';

import * as React from 'react';
import { Toggle } from './Toggle';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  CheckboxProps
>(({ checked = false, onCheckedChange, disabled, className, id, 'aria-label': ariaLabel, ...props }, ref) => (
  <Toggle
    checked={checked}
    onChange={onCheckedChange || (() => {})}
    disabled={disabled}
    size="sm"
    className={className}
    id={id}
    aria-label={ariaLabel}
    {...props}
  />
));

Checkbox.displayName = 'Checkbox';

export { Checkbox };