import React, { type CSSProperties } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import type { NormalizedSidebarItem, NormalizedSidebarSection } from './ProductsByCategory';
import { UnifiedIcon } from '../common/UnifiedIcon';

const SECTION_TITLE_FONT_WEIGHT_CLASSES: Record<NormalizedSidebarSection['titleFontWeight'], string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const SECTION_TITLE_FONT_SIZE_CLASSES: Record<NormalizedSidebarSection['titleFontSize'], string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

interface ProductsByCategorySidebarProps {
  sidebarLabel: string;
  title: string;
  headerBackgroundColor?: string;
  description?: string | null;
  showTitle: boolean;
  showSidebarHeader: boolean;
  showDescription: boolean;
  sections: NormalizedSidebarSection[];
  sectionFallbackTitle: string;
  getLinkAriaLabel: (item: NormalizedSidebarItem) => string;
}

interface SidebarMenuItemProps {
  item: NormalizedSidebarItem;
  depth?: number;
  getLinkAriaLabel: (item: NormalizedSidebarItem) => string;
  isInsideHoverPanel?: boolean;
  showIcon?: boolean;
  itemFontSize?: NormalizedSidebarSection['titleFontSize'];
  itemFontWeight?: NormalizedSidebarSection['titleFontWeight'];
  itemFontColor?: string;
  itemTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  item,
  depth = 0,
  getLinkAriaLabel,
  isInsideHoverPanel = false,
  showIcon = true,
  itemFontSize = 'sm',
  itemFontWeight = 'normal',
  itemFontColor,
  itemTextTransform = 'none',
}) => {
  const hasChildren = item.children.length > 0;
  const isRootWithChildren = depth === 0 && hasChildren;
  const containerOffsetClass = !isInsideHoverPanel && depth > 0 ? 'pl-4' : '';
  const linkWrapperClasses = clsx(
    'group block w-full text-left transition duration-150',
    depth === 0 ? 'py-2.5' : 'py-2',
  );
  const staticWrapperClasses = clsx(
    'block w-full py-2 text-left text-gray-600 dark:text-gray-300',
    depth === 0 && 'py-2.5',
  );
  const hasCustomColor = Boolean(itemFontColor);

  // Icon wrapper classes - inherit color from parent
  const iconWrapperClass = clsx(
    'rounded-full p-1.5',
    hasCustomColor ? '' : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 group-focus-visible:text-blue-600 dark:group-hover:text-blue-300 dark:group-focus-visible:text-blue-300'
  );

  const customStyle: CSSProperties | undefined = hasCustomColor || itemTextTransform !== 'none'
    ? {
      ...(hasCustomColor ? { color: itemFontColor } : {}),
      ...(itemTextTransform === 'uppercase' ? { textTransform: 'uppercase', letterSpacing: '0.05em' } : {}),
      ...(itemTextTransform === 'capitalize' ? { textTransform: 'capitalize' } : {}),
      ...(itemTextTransform === 'lowercase' ? { textTransform: 'lowercase' } : {}),
    }
    : undefined;

  const textClasses = clsx(
    'mb-0 transition-colors duration-150',
    SECTION_TITLE_FONT_SIZE_CLASSES[itemFontSize] || 'text-sm',
    SECTION_TITLE_FONT_WEIGHT_CLASSES[itemFontWeight] || 'font-normal',
    hasCustomColor ? '' : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 group-focus-visible:text-blue-600 dark:group-hover:text-blue-300 dark:group-focus-visible:text-blue-300',
    itemTextTransform === 'uppercase' && 'uppercase',
    itemTextTransform === 'capitalize' && 'capitalize',
    itemTextTransform === 'lowercase' && 'lowercase'
  );


  const content = (
    <div className="flex items-center gap-2.5 transition-colors duration-150 group-hover:text-blue-600 group-focus-visible:text-blue-600 dark:group-hover:text-blue-300 dark:group-focus-visible:text-blue-200">
      {showIcon && item.icon && (
        <div className={iconWrapperClass} style={customStyle}>
          <UnifiedIcon
            icon={item.icon}
            variant="nav"
            className="h-4 w-4"
            {...(hasCustomColor ? { color: itemFontColor } : {})}
          />
        </div>
      )}
      <div className="flex-1">
        <p className={textClasses} style={customStyle}>
          {item.label}
        </p>
        {item.description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0 group-hover:text-blue-500 group-focus-visible:text-blue-500 dark:group-hover:text-blue-200 dark:group-focus-visible:text-blue-200">
            {item.description}
          </p>
        )}
      </div>
      {item.href && (
        <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:text-blue-500 group-focus-visible:text-blue-500" />
      )}
    </div>
  );

  return (
    <div className={clsx(containerOffsetClass)}>
      <div className={clsx(isRootWithChildren && 'relative z-20 group')}>
        {item.href ? (
          <Link
            href={item.href}
            className={linkWrapperClasses}
            aria-label={getLinkAriaLabel(item)}
          >
            {content}
          </Link>
        ) : (
          <div className={staticWrapperClasses}>{content}</div>
        )}

        {hasChildren && isRootWithChildren && (
          <div
            className={clsx(
              'pointer-events-none absolute left-full top-0 hidden min-w-[240px] max-w-sm translate-x-4 opacity-0 transition-all duration-200 ease-out delay-150 pl-4',
              'flex-col',
              'group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-hover:flex group-hover:delay-0',
              'group-focus-within:pointer-events-auto group-focus-within:flex group-focus-within:translate-x-0 group-focus-within:opacity-100 group-focus-within:delay-0',
              'z-30',
            )}
          >
            <div className="flex-1 rounded-2xl border border-blue-100/80 bg-white p-4 shadow-xl ring-1 ring-black/5 dark:border-blue-900/40 dark:bg-gray-900 dark:ring-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-300 mb-3">
                {item.label}
              </p>
              <div className="space-y-3">
                {item.children.map((child) => (
                  <SidebarMenuItem
                    key={child.id}
                    item={child}
                    depth={depth + 1}
                    getLinkAriaLabel={getLinkAriaLabel}
                    isInsideHoverPanel
                    showIcon={showIcon}
                    itemFontSize={itemFontSize}
                    itemFontWeight={itemFontWeight}
                    itemFontColor={itemFontColor}
                    itemTextTransform={itemTextTransform}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {hasChildren && !isRootWithChildren && (
        <div
          className={clsx(
            'divide-y divide-blue-100/70 border-l border-blue-100/70 dark:divide-blue-900/30 dark:border-blue-900/40',
            depth === 0 ? 'ml-4 pl-4' : 'ml-3 pl-3',
          )}
        >
          {item.children.map((child) => (
            <SidebarMenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              getLinkAriaLabel={getLinkAriaLabel}
              isInsideHoverPanel={isInsideHoverPanel}
              showIcon={showIcon}
              itemFontSize={itemFontSize}
              itemFontWeight={itemFontWeight}
              itemFontColor={itemFontColor}
              itemTextTransform={itemTextTransform}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProductsByCategorySidebar: React.FC<ProductsByCategorySidebarProps> = ({
  sidebarLabel,
  title,
  headerBackgroundColor,
  description,
  showTitle,
  showSidebarHeader,
  showDescription,
  sections,
  sectionFallbackTitle,
  getLinkAriaLabel,
}) => {
  if (!sections.length) {
    return null;
  }

  return (
    <aside className="relative z-40 w-full lg:w-1/5">
      <div className="lg:sticky lg:top-24 space-y-6">
        {showSidebarHeader && (
          <div
            className="rounded-2xl border border-gray-200/80 bg-white/95 p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900/70"
            style={headerBackgroundColor ? { backgroundColor: headerBackgroundColor } : undefined}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500 dark:text-blue-300">{sidebarLabel}</p>
            {showTitle && (
              <h3 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {showDescription && description && (
              <p className={clsx(showTitle ? 'mt-2' : 'mt-3', 'text-sm text-gray-600 dark:text-gray-400')}>
                {description}
              </p>
            )}
          </div>
        )}
        {sections.map((section) => {
          const sectionTitle = section.title || sectionFallbackTitle;
          const sectionDescription = section.description?.trim();
          const hasCustomBackground = Boolean(section.backgroundColor);
          const hasCustomHeaderBackground = Boolean(section.headerBackgroundColor);
          const sectionCardStyle: CSSProperties | undefined = hasCustomBackground
            ? { backgroundColor: section.backgroundColor }
            : undefined;
          const hasCustomTitleColor = Boolean(section.titleFontColor);
          const sectionTitleStyle: CSSProperties | undefined = hasCustomTitleColor || section.titleTextTransform !== 'none'
            ? {
              ...(hasCustomTitleColor ? { color: section.titleFontColor } : {}),
              ...(section.titleTextTransform === 'uppercase' ? { textTransform: 'uppercase', letterSpacing: '0.2em' } : {}),
              ...(section.titleTextTransform === 'capitalize' ? { textTransform: 'capitalize' } : {}),
              ...(section.titleTextTransform === 'lowercase' ? { textTransform: 'lowercase' } : {}),
            }
            : undefined;
          const sectionTitleClasses = clsx(
            'flex items-center gap-2 mb-0',
            hasCustomTitleColor ? '' : 'text-gray-900 dark:text-gray-100',
            SECTION_TITLE_FONT_SIZE_CLASSES[section.titleFontSize] || 'text-sm',
            SECTION_TITLE_FONT_WEIGHT_CLASSES[section.titleFontWeight] || 'font-semibold',
            SECTION_TITLE_FONT_WEIGHT_CLASSES[section.titleFontWeight] || 'font-semibold',
            section.titleTextTransform === 'uppercase' && 'uppercase',
            section.titleTextTransform === 'capitalize' && 'capitalize',
            section.titleTextTransform === 'lowercase' && 'lowercase',
          );
          return (
            <div
              key={section.id}
              className={clsx(
                'rounded-2xl border border-gray-200/80 shadow-sm dark:border-gray-800/60 overflow-hidden',
                hasCustomBackground ? '' : 'bg-white/95 dark:bg-gray-900/70',
              )}
              style={sectionCardStyle}
            >
              <div
                className="border-b border-gray-100 px-5 py-4 dark:border-gray-800/80"
                style={hasCustomHeaderBackground ? { backgroundColor: section.headerBackgroundColor } : undefined}
              >
                <p className={sectionTitleClasses} style={sectionTitleStyle}>
                  {section.showTitleIcon && section.titleIcon && (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full">
                      <UnifiedIcon
                        icon={section.titleIcon}
                        className="h-3.5 w-3.5"
                        {...(hasCustomTitleColor ? { color: section.titleFontColor } : {})}
                      />
                    </span>
                  )}
                  <span>{sectionTitle}</span>
                </p>
                {sectionDescription && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 mb-0">{sectionDescription}</p>
                )}
              </div>
              <div className="px-5 py-2 divide-y divide-gray-100 dark:divide-gray-800">
                {section.items.map((item) => (
                  <SidebarMenuItem
                    key={item.id}
                    item={item}
                    getLinkAriaLabel={getLinkAriaLabel}
                    showIcon={section.showItemIcons}
                    itemFontSize={section.itemFontSize}
                    itemFontWeight={section.itemFontWeight}
                    itemFontColor={section.itemFontColor}
                    itemTextTransform={section.itemTextTransform}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ProductsByCategorySidebar;
