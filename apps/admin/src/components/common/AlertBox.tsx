import React from 'react';
import { AlertIcon } from './Icons';

export interface AlertBoxProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  description?: string;
  footer?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const alertStyles = {
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-800/30',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-800 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
    description: 'text-red-600 dark:text-red-400',
    footer: 'text-red-500 dark:text-red-400 border-red-200 dark:border-red-700',
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-800 dark:text-yellow-200',
    message: 'text-yellow-700 dark:text-yellow-300',
    description: 'text-yellow-600 dark:text-yellow-400',
    footer: 'text-yellow-500 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
  },
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-800/30',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-800 dark:text-green-200',
    message: 'text-green-700 dark:text-green-300',
    description: 'text-green-600 dark:text-green-400',
    footer: 'text-green-500 dark:text-green-400 border-green-200 dark:border-green-700',
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-800/30',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
    description: 'text-blue-600 dark:text-blue-400',
    footer: 'text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-700',
  },
};

const sizeStyles = {
  sm: {
    container: 'p-4',
    iconWrapper: 'p-1',
    icon: 'h-5 w-5',
    title: 'text-sm font-semibold',
    message: 'text-sm',
    description: 'text-xs',
    footer: 'text-xs',
  },
  md: {
    container: 'p-6',
    iconWrapper: 'p-2',
    icon: 'h-6 w-6',
    title: 'text-base font-bold',
    message: 'text-base font-semibold',
    description: 'text-sm',
    footer: 'text-xs',
  },
  lg: {
    container: 'p-8',
    iconWrapper: 'p-3',
    icon: 'h-8 w-8',
    title: 'text-lg font-bold',
    message: 'text-base font-semibold',
    description: 'text-sm',
    footer: 'text-xs',
  },
};

export const AlertBox: React.FC<AlertBoxProps> = ({
  type = 'error',
  title,
  message,
  description,
  footer,
  className = '',
  size = 'lg',
  children,
}) => {
  const alertStyle = alertStyles[type];
  const sizeStyle = sizeStyles[size];

  return (
    <div 
      className={`
        ${sizeStyle.container} 
        rounded-xl 
        border-2 
        ${alertStyle.container} 
        shadow-xl 
        animate-pulse-slow 
        transition-all 
        duration-500 
        transform 
        hover:scale-105 
        ${className}
      `}
      role="alert"
      style={{
        animation: type === 'error' ? 'pulse 2s infinite, shadow-pulse 3s infinite' : undefined,
        boxShadow: type === 'error' 
          ? '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1)' 
          : undefined
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`${alertStyle.iconBg} ${sizeStyle.iconWrapper} rounded-full`}>
            <AlertIcon className={`${sizeStyle.icon} ${alertStyle.icon}`} />
          </div>
        </div>
        <div className="ml-4 flex-1">
          {title && (
            <div className="flex items-center mb-2">
              <h3 className={`${sizeStyle.title} ${alertStyle.title}`}>
                {title}
              </h3>
            </div>
          )}
          <div className="space-y-2">
            <p className={`${sizeStyle.message} ${alertStyle.message} leading-relaxed`}>
              {message}
            </p>
            {description && (
              <p className={`${sizeStyle.description} ${alertStyle.description} leading-relaxed`}>
                {description}
              </p>
            )}
            {children}
            {footer && (
              <div className={`mt-4 pt-3 border-t ${alertStyle.footer.split(' ').pop()}`}>
                <p className={`${sizeStyle.footer} ${alertStyle.footer} font-medium`}>
                  {footer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;