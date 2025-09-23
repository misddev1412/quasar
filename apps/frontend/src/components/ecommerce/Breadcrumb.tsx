import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  homeHref?: string;
  showHome?: boolean;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  separator = <ChevronRightIcon className="h-4 w-4 text-gray-400" />,
  homeHref = '/',
  showHome = true,
  maxItems,
  onItemClick,
}) => {
  const handleItemClick = (item: BreadcrumbItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Process items to handle maxItems limitation
  const processedItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    // Always show the first item and the last (maxItems - 2) items
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 2));
    
    // Insert an ellipsis item between the first and last items
    return [
      firstItem,
      { label: '...', href: undefined },
      ...lastItems
    ];
  }, [items, maxItems]);

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home Link */}
        {showHome && (
          <li>
            <div>
              <Link
                to={homeHref}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={() => handleItemClick({ label: 'Home', href: homeHref })}
              >
                <span className="sr-only">Home</span>
                <HomeIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </li>
        )}

        {/* Breadcrumb Items */}
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <li key={index}>
              <div className="flex items-center">
                {/* Separator */}
                {index > 0 || showHome ? (
                  <span className="mx-2 text-gray-400" aria-hidden="true">
                    {separator}
                  </span>
                ) : null}

                {/* Item */}
                {isEllipsis ? (
                  <span className="text-gray-500">{item.label}</span>
                ) : item.href && !item.current ? (
                  <Link
                    to={item.href}
                    className={`text-sm font-medium ${
                      isLast
                        ? 'text-gray-500'
                        : 'text-gray-500 hover:text-gray-700 transition-colors'
                    }`}
                    onClick={() => handleItemClick(item)}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      isLast ? 'text-gray-900' : 'text-gray-500'
                    }`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;