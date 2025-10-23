import * as React from 'react';
import { cn } from './utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isCurrent?: boolean;
  current?: boolean;
  disabled?: boolean;
}

export interface BreadcrumbLinkComponentProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  'aria-current'?: 'page';
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  homeHref?: string;
  homeLabel?: string;
  homeIcon?: React.ReactNode;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  linkComponent?: React.ComponentType<BreadcrumbLinkComponentProps>;
}

type InternalBreadcrumbItem = BreadcrumbItem & { __isTruncation?: boolean };

const DefaultSeparator = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600"
    aria-hidden="true"
  >
    <path d="M6 3.5L10 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const createHomeItem = (
  label: string,
  href?: string,
  icon?: React.ReactNode
): InternalBreadcrumbItem => ({
  label,
  href,
  icon,
});

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator,
  showHome = false,
  homeHref = '/',
  homeLabel = 'Home',
  homeIcon,
  maxItems,
  onItemClick,
  linkComponent,
}) => {
  const resolvedSeparator = separator ?? <DefaultSeparator />;

  const augmentedItems = React.useMemo<InternalBreadcrumbItem[]>(() => {
    if (!showHome) {
      return items;
    }

    const homeItem = createHomeItem(homeLabel, homeHref, homeIcon);

    if (items.length === 0 || items[0].label !== homeLabel || items[0].href !== homeHref) {
      return [homeItem, ...items];
    }

    return items;
  }, [showHome, items, homeLabel, homeHref, homeIcon]);

  const processedItems = React.useMemo<InternalBreadcrumbItem[]>(() => {
    if (!maxItems || augmentedItems.length <= maxItems) {
      return augmentedItems;
    }

    if (maxItems < 3) {
      const first = augmentedItems[0];
      const last = augmentedItems[augmentedItems.length - 1];
      return [first, { label: '...', __isTruncation: true }, last];
    }

    const first = augmentedItems[0];
    const remaining = maxItems - 2;
    const tail = augmentedItems.slice(-remaining);

    return [first, { label: '...', __isTruncation: true }, ...tail];
  }, [augmentedItems, maxItems]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/90 p-2 text-sm text-neutral-500 shadow-sm backdrop-blur-sm transition-colors dark:border-neutral-700/60 dark:bg-neutral-900/70 dark:text-neutral-400 mb-6',
        className
      )}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {processedItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === processedItems.length - 1;
          const isEllipsis = Boolean(item.__isTruncation);
          const isCurrent = item.isCurrent ?? item.current ?? isLast;
          const isDisabled = item.disabled || isEllipsis;
          const clickable = Boolean(!isDisabled && (item.href || item.onClick || onItemClick));
          const LinkComponent = linkComponent;

          const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            if (isDisabled) {
              event.preventDefault();
              return;
            }

            item.onClick?.();
            onItemClick?.(item, index);
          };

          const content = (
            <>
              {item.icon && (
                <span className="flex h-5 w-5 items-center justify-center text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300">
                  {item.icon}
                </span>
              )}
              <span className="truncate whitespace-nowrap">
                {item.label}
              </span>
            </>
          );

          const itemClasses = cn(
            'group relative inline-flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all duration-200',
            clickable
              ? 'cursor-pointer text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100'
              : 'text-neutral-500 dark:text-neutral-400',
            isCurrent && 'bg-neutral-900/5 text-neutral-900 dark:bg-neutral-100/10 dark:text-neutral-50 shadow-inner font-semibold',
            isEllipsis && 'cursor-default text-neutral-400 dark:text-neutral-600'
          );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {!isFirst && (
                <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
                  {resolvedSeparator}
                </span>
              )}

              {isEllipsis ? (
                <span className={itemClasses}>...</span>
              ) : LinkComponent && item.href ? (
                <LinkComponent
                  href={item.href}
                  className={itemClasses}
                  onClick={handleClick}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {content}
                </LinkComponent>
              ) : item.href ? (
                <a
                  href={item.href}
                  className={itemClasses}
                  onClick={handleClick}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {content}
                </a>
              ) : clickable ? (
                <button
                  type="button"
                  className={itemClasses}
                  onClick={handleClick}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {content}
                </button>
              ) : (
                <span className={itemClasses} aria-current={isCurrent ? 'page' : undefined}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
export default Breadcrumb;
