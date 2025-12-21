'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from 'ui';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';

export interface ViewMoreButtonProps {
  href: string;
  label: string;
  config?: ViewMoreButtonConfig;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const DEFAULT_CONFIG: ViewMoreButtonConfig = {
  size: 'md',
  uppercase: false,
  bold: false,
  variant: 'default',
  lightMode: {
    textColor: 'text-gray-700',
    backgroundColor: 'bg-transparent',
    borderColor: 'border-gray-200',
    hoverTextColor: 'hover:text-gray-900',
    hoverBackgroundColor: 'hover:bg-gray-50',
    hoverBorderColor: 'hover:border-gray-300',
  },
  darkMode: {
    textColor: 'dark:text-gray-200',
    backgroundColor: 'dark:bg-transparent',
    borderColor: 'dark:border-gray-700',
    hoverTextColor: 'dark:hover:text-gray-100',
    hoverBackgroundColor: 'dark:hover:bg-gray-800',
    hoverBorderColor: 'dark:hover:border-gray-500',
  },
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const VARIANT_STYLES = {
  default: {
    lightMode: {
      textColor: 'text-gray-700',
      backgroundColor: 'bg-transparent',
      borderColor: 'border-gray-200',
      hoverTextColor: 'hover:text-gray-900',
      hoverBackgroundColor: 'hover:bg-gray-50',
      hoverBorderColor: 'hover:border-gray-300',
    },
    darkMode: {
      textColor: 'dark:text-gray-200',
      backgroundColor: 'dark:bg-transparent',
      borderColor: 'dark:border-gray-700',
      hoverTextColor: 'dark:hover:text-gray-100',
      hoverBackgroundColor: 'dark:hover:bg-gray-800',
      hoverBorderColor: 'dark:hover:border-gray-500',
    },
  },
  primary: {
    lightMode: {
      textColor: 'text-white',
      backgroundColor: 'bg-primary-600',
      borderColor: 'border-primary-600',
      hoverTextColor: 'hover:text-white',
      hoverBackgroundColor: 'hover:bg-primary-700',
      hoverBorderColor: 'hover:border-primary-700',
    },
    darkMode: {
      textColor: 'dark:text-white',
      backgroundColor: 'dark:bg-primary-500',
      borderColor: 'dark:border-primary-500',
      hoverTextColor: 'dark:hover:text-white',
      hoverBackgroundColor: 'dark:hover:bg-primary-600',
      hoverBorderColor: 'dark:hover:border-primary-600',
    },
  },
  ghost: {
    lightMode: {
      textColor: 'text-primary-600',
      backgroundColor: 'bg-transparent',
      borderColor: 'border-transparent',
      hoverTextColor: 'hover:text-primary-700',
      hoverBackgroundColor: 'hover:bg-primary-50',
      hoverBorderColor: 'hover:border-transparent',
    },
    darkMode: {
      textColor: 'dark:text-primary-400',
      backgroundColor: 'dark:bg-transparent',
      borderColor: 'dark:border-transparent',
      hoverTextColor: 'dark:hover:text-primary-300',
      hoverBackgroundColor: 'dark:hover:bg-primary-900/20',
      hoverBorderColor: 'dark:hover:border-transparent',
    },
  },
  outline: {
    lightMode: {
      textColor: 'text-primary-600',
      backgroundColor: 'bg-transparent',
      borderColor: 'border-primary-600',
      hoverTextColor: 'hover:text-white',
      hoverBackgroundColor: 'hover:bg-primary-600',
      hoverBorderColor: 'hover:border-primary-600',
    },
    darkMode: {
      textColor: 'dark:text-primary-400',
      backgroundColor: 'dark:bg-transparent',
      borderColor: 'dark:border-primary-400',
      hoverTextColor: 'dark:hover:text-white',
      hoverBackgroundColor: 'dark:hover:bg-primary-500',
      hoverBorderColor: 'dark:hover:border-primary-500',
    },
  },
};

export const ViewMoreButton: React.FC<ViewMoreButtonProps> = ({
  href,
  label,
  config,
  className,
  icon,
  iconPosition = 'right',
}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const size = mergedConfig.size || 'md';
  const variant = mergedConfig.variant || 'default';
  const variantStyles = VARIANT_STYLES[variant];

  const lightMode = { ...variantStyles.lightMode, ...mergedConfig.lightMode };
  const darkMode = { ...variantStyles.darkMode, ...mergedConfig.darkMode };

  const buttonClasses = cn(
    'inline-flex items-center justify-center',
    'rounded-lg border',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    SIZE_CLASSES[size],
    mergedConfig.uppercase && 'uppercase',
    mergedConfig.bold ? 'font-semibold' : 'font-medium',
    // Light mode colors
    lightMode.textColor,
    lightMode.backgroundColor,
    lightMode.borderColor,
    lightMode.hoverTextColor,
    lightMode.hoverBackgroundColor,
    lightMode.hoverBorderColor,
    // Dark mode colors
    darkMode.textColor,
    darkMode.backgroundColor,
    darkMode.borderColor,
    darkMode.hoverTextColor,
    darkMode.hoverBackgroundColor,
    darkMode.hoverBorderColor,
    className
  );

  return (
    <Link href={href} className={buttonClasses}>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {label}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </Link>
  );
};

export default ViewMoreButton;
