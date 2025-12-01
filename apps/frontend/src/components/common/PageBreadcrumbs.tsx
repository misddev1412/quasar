import React from 'react';
import Link from 'next/link';
import { BreadcrumbItem } from 'ui';
import { cn } from 'ui';

export interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showBackground?: boolean;
  fullWidth?: boolean;
}

const ArrowIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-neutral-300 dark:text-neutral-600"
    aria-hidden="true"
  >
    <path
      d="M6 3.5L10 8L6 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({
  items,
  className,
  showBackground = true,
  fullWidth = false,
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const wrapperClasses = cn(
    'w-full border-b border-neutral-100/70 dark:border-neutral-800/70',
    showBackground
      ? 'bg-white/80 dark:bg-neutral-900/70 backdrop-blur'
      : 'bg-transparent border-none'
  );

  const navClasses = cn(
    'flex flex-wrap items-center text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 gap-1.5 sm:gap-2',
    className
  );

  const containerClasses = cn(
    'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4',
    fullWidth && 'w-full'
  );

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        <nav aria-label="Breadcrumb" className={navClasses}>
          <ol className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const isCurrent = item.isCurrent ?? item.current ?? isLast;
              const isDisabled = item.disabled;
              const Icon = item.icon;

              const commonClasses = cn(
                'inline-flex items-center gap-1.5 font-medium transition-colors',
                isCurrent
                  ? 'text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50',
                isDisabled && 'cursor-default opacity-60 hover:text-inherit',
              );

              const handleClick = () => {
                if (!isDisabled) {
                  item.onClick?.();
                }
              };

              const content = (
                <>
                  {Icon && <span className="text-base leading-none">{Icon}</span>}
                  <span className="truncate">{item.label}</span>
                </>
              );

              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="flex items-center">
                      <ArrowIcon />
                    </span>
                  )}

                  {item.href && !isDisabled ? (
                    <Link
                      href={item.href}
                      className={commonClasses}
                      aria-current={isCurrent ? 'page' : undefined}
                      onClick={item.onClick ? handleClick : undefined}
                    >
                      {content}
                    </Link>
                  ) : item.onClick && !isDisabled ? (
                    <button
                      type="button"
                      className={commonClasses}
                      onClick={handleClick}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {content}
                    </button>
                  ) : (
                    <span
                      className={commonClasses}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageBreadcrumbs;
