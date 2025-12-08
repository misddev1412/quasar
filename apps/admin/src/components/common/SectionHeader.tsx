import React from 'react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  description,
  className = "mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-700"
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {icon && (
        <div className="pr-3 border-r border-neutral-200 dark:border-neutral-700">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
    </div>
  );
};