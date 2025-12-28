'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from 'ui';
import type {
  ViewMoreButtonBorderWidth,
  ViewMoreButtonConfig,
  ViewMoreButtonTextTransform,
} from '@shared/types/component.types';

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
  textTransform: 'uppercase',
  isBold: true,
  backgroundColor: {
    light: 'transparent',
    dark: 'transparent',
  },
  textColor: {
    light: '#4338ca', // indigo-600
    dark: '#c7d2fe', // indigo-200
  },
  border: {
    width: 'thin',
    color: {
      light: '#4338ca',
      dark: '#818cf8',
    },
  },
  hover: {
    textColor: {
      light: '#312e81',
      dark: '#ede9fe',
    },
    backgroundColor: {
      light: 'rgba(79, 70, 229, 0.08)',
      dark: 'rgba(99, 102, 241, 0.25)',
    },
    borderColor: {
      light: '#312e81',
      dark: '#a5b4fc',
    },
  },
};

const SIZE_CLASSES: Record<NonNullable<ViewMoreButtonConfig['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
const TEXT_TRANSFORM_CLASSES: Record<ViewMoreButtonTextTransform, string> = {
  none: 'normal-case',
  uppercase: 'uppercase tracking-[0.2em]',
  capitalize: 'capitalize',
};
const BORDER_WIDTH_CLASSES: Record<ViewMoreButtonBorderWidth, string> = {
  none: 'border-0',
  thin: 'border',
  medium: 'border-2',
  thick: 'border-4',
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
  const textTransform = mergedConfig.textTransform || 'uppercase';
  const textColorLight = mergedConfig.textColor?.light ?? DEFAULT_CONFIG.textColor?.light ?? '#4338ca';
  const textColorDark = mergedConfig.textColor?.dark ?? textColorLight;
  const backgroundColorLight = mergedConfig.backgroundColor?.light ?? DEFAULT_CONFIG.backgroundColor?.light ?? 'transparent';
  const backgroundColorDark = mergedConfig.backgroundColor?.dark ?? backgroundColorLight;
  const borderWidth = mergedConfig.border?.width || 'thin';
  const borderColorLight = mergedConfig.border?.color?.light
    ?? DEFAULT_CONFIG.border?.color?.light
    ?? textColorLight;
  const borderColorDark = mergedConfig.border?.color?.dark
    ?? DEFAULT_CONFIG.border?.color?.dark
    ?? borderColorLight;
  const hoverTextColorLight = mergedConfig.hover?.textColor?.light
    ?? DEFAULT_CONFIG.hover?.textColor?.light
    ?? textColorLight;
  const hoverTextColorDark = mergedConfig.hover?.textColor?.dark
    ?? DEFAULT_CONFIG.hover?.textColor?.dark
    ?? hoverTextColorLight;
  const hoverBgLight = mergedConfig.hover?.backgroundColor?.light
    ?? DEFAULT_CONFIG.hover?.backgroundColor?.light
    ?? backgroundColorLight;
  const hoverBgDark = mergedConfig.hover?.backgroundColor?.dark
    ?? DEFAULT_CONFIG.hover?.backgroundColor?.dark
    ?? hoverBgLight;
  const hoverBorderLight = mergedConfig.hover?.borderColor?.light
    ?? DEFAULT_CONFIG.hover?.borderColor?.light
    ?? borderColorLight;
  const hoverBorderDark = mergedConfig.hover?.borderColor?.dark
    ?? DEFAULT_CONFIG.hover?.borderColor?.dark
    ?? hoverBorderLight;

  const cssVariables: React.CSSProperties = {
    '--view-more-text-light': textColorLight,
    '--view-more-text-dark': textColorDark,
    '--view-more-bg-light': backgroundColorLight,
    '--view-more-bg-dark': backgroundColorDark,
    '--view-more-border-light': borderColorLight,
    '--view-more-border-dark': borderColorDark,
    '--view-more-hover-text-light': hoverTextColorLight,
    '--view-more-hover-text-dark': hoverTextColorDark,
    '--view-more-hover-bg-light': hoverBgLight,
    '--view-more-hover-bg-dark': hoverBgDark,
    '--view-more-hover-border-light': hoverBorderLight,
    '--view-more-hover-border-dark': hoverBorderDark,
  };

  const fontWeightClass = mergedConfig.isBold === false ? 'font-medium' : 'font-semibold';

  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded-lg border-solid transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    SIZE_CLASSES[size],
    TEXT_TRANSFORM_CLASSES[textTransform],
    fontWeightClass,
    BORDER_WIDTH_CLASSES[borderWidth],
    'text-[var(--view-more-text-light)] dark:text-[var(--view-more-text-dark)]',
    'bg-[var(--view-more-bg-light)] dark:bg-[var(--view-more-bg-dark)]',
    'border-[var(--view-more-border-light)] dark:border-[var(--view-more-border-dark)]',
    'hover:text-[var(--view-more-hover-text-light)] dark:hover:text-[var(--view-more-hover-text-dark)]',
    'hover:bg-[var(--view-more-hover-bg-light)] dark:hover:bg-[var(--view-more-hover-bg-dark)]',
    'hover:border-[var(--view-more-hover-border-light)] dark:hover:border-[var(--view-more-hover-border-dark)]',
    className
  );

  return (
    <Link href={href} className={buttonClasses} style={cssVariables}>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {label}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </Link>
  );
};

export default ViewMoreButton;
