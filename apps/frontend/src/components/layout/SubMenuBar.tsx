'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
import Container from '../common/Container';
import { UnifiedIcon } from '../common/UnifiedIcon';
import { MenuItem, useMenu } from '../../hooks/useMenu';
import { MenuTarget, MenuType } from '@shared/enums/menu.enums';

const SUB_MENU_GROUP = 'sub';

type BadgeConfig = {
  text?: string;
  color?: string;
  backgroundColor?: string;
};

const getEnabledChildren = (item: MenuItem): MenuItem[] =>
  (item.children || [])
    .filter(child => child.isEnabled)
    .sort((a, b) => a.position - b.position);

const getBadgeConfig = (item: MenuItem): BadgeConfig | null => {
  const rawBadge = (item.config?.badge ?? null) as unknown;

  if (!rawBadge) {
    return null;
  }

  if (typeof rawBadge === 'string') {
    return { text: rawBadge };
  }

  if (typeof rawBadge === 'object') {
    const badgeObject = rawBadge as BadgeConfig;
    if (badgeObject.text) {
      return badgeObject;
    }
  }

  return null;
};

const SubMenuBar: React.FC = () => {
  const localeValue = useLocale();
  const normalizedLocale = localeValue.split('-')[0];
  const { treeData, isLoading, getLabel, getDescription, buildHref } = useMenu(SUB_MENU_GROUP);

  const rootItems = useMemo(() => (
    (treeData || [])
      .filter(item => item.isEnabled && (!item.parentId || item.parentId === null))
      .sort((a, b) => a.position - b.position)
  ), [treeData]);

  if (!isLoading && rootItems.length === 0) {
    return null;
  }

  const getTranslation = (item: MenuItem) => {
    const localeMatch = item.translations.find(
      translation => translation.locale === localeValue || translation.locale === normalizedLocale,
    );

    if (localeMatch) {
      return localeMatch;
    }

    return item.translations.find(translation => translation.locale === 'en') ?? null;
  };

  const renderChildLink = (child: MenuItem) => {
    const childHref = buildHref(child);
    const childLabel = getLabel(child) || childHref;
    const childDescription = getDescription(child);
    const grandChildren = getEnabledChildren(child);

    const linkNode = (
      <Link
        key={child.id}
        href={childHref || '#'}
        target={child.target ? child.target : undefined}
        rel={child.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
        className="block px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          {child.icon && <UnifiedIcon icon={child.icon} variant="nav" size={16} />}
          <span className="font-medium">{childLabel}</span>
        </span>
        {childDescription && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {childDescription}
          </span>
        )}
      </Link>
    );

    if (grandChildren.length === 0) {
      return (
        <div key={child.id} className="space-y-1">
          {linkNode}
        </div>
      );
    }

    return (
      <div key={child.id} className="space-y-1 px-3 py-2">
        {linkNode}
        <div className="border-l border-gray-100 dark:border-gray-700 ml-2 pl-3 space-y-1">
          {grandChildren.map(grandChild => {
            const grandHref = buildHref(grandChild);
            const grandLabel = getLabel(grandChild) || grandHref;
            const grandDescription = getDescription(grandChild);
            return (
              <Link
                key={grandChild.id}
                href={grandHref || '#'}
                target={grandChild.target ? grandChild.target : undefined}
                rel={grandChild.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                className="block text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              >
                {grandLabel}
                {grandDescription && (
                  <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {grandDescription}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const badge = getBadgeConfig(item);
    const label = getLabel(item);
    const description = getDescription(item);
    const href = buildHref(item);
    const hasChildren = getEnabledChildren(item).length > 0;
    const iconNode = item.icon ? <UnifiedIcon icon={item.icon} variant="nav" size={16} /> : null;
    const badgeNode = badge?.text ? (
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{
          color: badge.color || '#1d4ed8',
          backgroundColor: badge.backgroundColor || 'rgba(59, 130, 246, 0.15)',
        }}
      >
        {badge.text}
      </span>
    ) : null;

    const baseClasses = clsx(
      'flex items-center gap-2 text-sm font-medium whitespace-nowrap px-3 py-2 rounded-full transition-colors border border-transparent',
      'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
    );

    const style: React.CSSProperties = {
      color: item.textColor || undefined,
      backgroundColor: item.backgroundColor || undefined,
    };

    if (item.type === MenuType.CUSTOM_HTML) {
      const translation = getTranslation(item);
      if (!translation?.customHtml) {
        return null;
      }

      return (
        <div
          key={item.id}
          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: translation.customHtml }}
        />
      );
    }

    const content = (
      <span className="flex items-center gap-2">
        {iconNode}
        <span>{label || href || 'Untitled'}</span>
        {badgeNode}
      </span>
    );

    const linkTarget = item.target === MenuTarget.BLANK ? '_blank' : item.target || undefined;
    const linkRel = item.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined;
    const linkHref = href || '#';

    return (
      <div key={item.id} className="relative group/subnav focus-within:z-50">
        <Link
          href={linkHref}
          target={linkTarget}
          rel={linkRel}
          className={baseClasses}
          style={style}
        >
          {content}
        </Link>
        {description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-1 hidden md:block">
            {description}
          </p>
        )}

        {hasChildren && (
          <div
            className="absolute left-0 top-full mt-2 w-64 lg:w-72 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl opacity-0 pointer-events-none group-hover/subnav:opacity-100 group-hover/subnav:pointer-events-auto group-focus-within/subnav:opacity-100 group-focus-within/subnav:pointer-events-auto transition duration-150 z-40"
          >
            <div className="py-2 max-h-80 overflow-y-auto">
              {getEnabledChildren(item).map(renderChildLink)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/95 dark:bg-gray-950/85 border-b border-gray-200/80 dark:border-gray-800/70 shadow-sm">
      <Container className="py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {isLoading && rootItems.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`sub-menu-skeleton-${index}`}
                  className="h-8 w-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))
            : rootItems.map(renderMenuItem)}
        </div>
      </Container>
    </div>
  );
};

export default SubMenuBar;
