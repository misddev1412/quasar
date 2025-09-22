import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import clsx from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <FiChevronRight className="w-4 h-4" />,
  showHomeIcon = true
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const isClickable = (item: BreadcrumbItem) => {
    return item.href || item.onClick;
  };

  return (
    <nav
      className={clsx(
        'flex items-center space-x-1 text-sm bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const clickable = isClickable(item);

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-neutral-400 dark:text-neutral-600 flex-shrink-0">
                  {separator}
                </span>
              )}

              {clickable ? (
                <span
                  onClick={() => handleItemClick(item)}
                  className={clsx(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer',
                    isLast
                      ? 'text-neutral-900 dark:text-neutral-100 font-medium cursor-default hover:bg-transparent dark:hover:bg-transparent'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  )}
                >
                  {item.icon && (
                    <span className={clsx(
                      'flex-shrink-0',
                      index === 0 && showHomeIcon && !item.icon ? 'hidden' : 'block'
                    )}>
                      {item.icon}
                    </span>
                  )}
                  {index === 0 && showHomeIcon && !item.icon && (
                    <FiHome className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              ) : (
                <span
                  className={clsx(
                    'flex items-center gap-1.5 px-2 py-1',
                    isLast
                      ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400'
                  )}
                >
                  {item.icon && (
                    <span className={clsx(
                      'flex-shrink-0',
                      index === 0 && showHomeIcon && !item.icon ? 'hidden' : 'block'
                    )}>
                      {item.icon}
                    </span>
                  )}
                  {index === 0 && showHomeIcon && !item.icon && (
                    <FiHome className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;