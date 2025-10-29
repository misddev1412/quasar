import React from 'react';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem } from 'ui';

export interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showBackground?: boolean;
  fullWidth?: boolean;
}

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({
  items,
  className,
  showBackground = true,
  fullWidth = false,
}) => {
  const containerClasses = fullWidth
    ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  if (!showBackground) {
    return (
      <div className={containerClasses}>
        <Breadcrumb
          items={items}
          linkComponent={Link}
          className="bg-white/95 p-3 dark:bg-neutral-900/80 mb-6"
        />
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-900/70 border-b border-gray-200/70 dark:border-gray-800/70 backdrop-blur">
      <div className={containerClasses}>
        <div className="py-4">
          <Breadcrumb
            items={items}
            linkComponent={Link}
            className="bg-white/95 p-3 dark:bg-neutral-900/80"
          />
        </div>
      </div>
    </div>
  );
};

export default PageBreadcrumbs;