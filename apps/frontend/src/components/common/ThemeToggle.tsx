'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { useTheme } from '../../contexts/ThemeContext';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  disableHover?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  size = 'sm',
  style,
  disableHover = false
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      isIconOnly={!showLabel}
      variant="light"
      size={size}
      onPress={toggleTheme}
      style={style}
      className={`
        ${!disableHover ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-transparent'}
        transition-all duration-200
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <div className={`
          absolute inset-0 transition-all duration-300
          ${theme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0'}
        `}>
          <SunIcon />
        </div>
        <div className={`
          absolute inset-0 transition-all duration-300
          ${theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0'}
        `}>
          <MoonIcon />
        </div>
      </div>
      {showLabel && (
        <span className="ml-2">
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </Button>
  );
};

export default ThemeToggle;