import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className 
}) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-md';
  
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-200 text-gray-700 bg-white',
    secondary: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={clsx(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
};