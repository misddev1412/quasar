import React from 'react';
import clsx from 'clsx';

type BadgeVariant =
  | 'default'
  | 'outline'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseClasses = clsx(
    'inline-flex items-center font-medium rounded-md',
    {
      'px-2 py-1 text-xs': size === 'sm' || size === 'md',
      'px-3 py-1 text-sm': size === 'lg'
    }
  );
  
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-200 text-gray-700 bg-white',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span className={clsx(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
};
