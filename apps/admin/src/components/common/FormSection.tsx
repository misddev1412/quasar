import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Section Header */}
      <div 
        className={clsx(
          'flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700',
          collapsible && 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors'
        )}
        onClick={toggleExpanded}
      >
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {collapsible && (
          <div className="flex-shrink-0">
            <svg
              className={clsx(
                'w-5 h-5 transition-transform duration-200',
                isExpanded ? 'rotate-180' : 'rotate-0'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Section Content */}
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;
