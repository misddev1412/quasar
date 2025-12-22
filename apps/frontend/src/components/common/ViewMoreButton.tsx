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
  weight: 'medium',
  backgroundColor: 'bg-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-900/40',
  textColor: 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200',
};

const SIZE_CLASSES: Record<NonNullable<ViewMoreButtonConfig['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
const WEIGHT_CLASSES: Record<NonNullable<ViewMoreButtonConfig['weight']>, string> = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
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

  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded-lg border border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    SIZE_CLASSES[size],
    WEIGHT_CLASSES[mergedConfig.weight || 'medium'],
    mergedConfig.textColor,
    mergedConfig.backgroundColor,
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
