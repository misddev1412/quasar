'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
import { createPortal } from 'react-dom';
import Container from '../common/Container';
import { UnifiedIcon } from '../common/UnifiedIcon';
import { MenuItem, useMenu } from '../../hooks/useMenu';
import { MenuTarget, MenuType } from '@shared/enums/menu.enums';
import { useSettings } from '../../hooks/useSettings';

const SUB_MENU_GROUP = 'sub';
const SUB_MENU_VISIBILITY_SETTING_KEY = 'storefront.sub_menu_enabled';
type SubMenuVariant = 'link' | 'button';
type SubMenuButtonSize = 'small' | 'medium' | 'large';

const resolveButtonSizeClass = (item: MenuItem): string => {
  const size = (item.config?.buttonSize as SubMenuButtonSize) || 'medium';

  switch (size) {
    case 'small':
      return 'px-2.5 py-1.5 h-8 text-xs';
    case 'large':
      return 'px-4 py-2.5 sm:px-5 sm:py-3 h-12 text-[15px]';
    default: // medium
      return 'px-3 py-2 h-10 text-sm';
  }
};

const resolveSubMenuVariant = (item: MenuItem): SubMenuVariant => {
  const variant = item.config?.subMenuVariant;
  return variant === 'button' ? 'button' : 'link';
};

const resolveButtonBorderRadius = (item: MenuItem, variant: SubMenuVariant): string | undefined => {
  const configuredRadius =
    typeof item.config?.buttonBorderRadius === 'string' ? item.config.buttonBorderRadius.trim() : '';
  if (configuredRadius.length > 0) {
    return configuredRadius;
  }
  return variant === 'button' ? '9999px' : undefined;
};

const resolveButtonAnimationClass = (item: MenuItem, variant: SubMenuVariant): string => {
  if (variant !== 'button') {
    return '';
  }

  const animation =
    typeof item.config?.buttonAnimation === 'string' ? item.config.buttonAnimation : undefined;

  switch (animation) {
    case 'pulse':
      return 'animate-pulse';
    case 'float':
      return 'subnav-float';
    case 'ring':
      return ''; // Handle ring on icon separately
    default:
      return '';
  }
};

const DEFAULT_ACCENT_COLOR = '#2563eb';
const DEFAULT_BUTTON_GRADIENT = 'linear-gradient(135deg, #2563eb, #7c3aed)';

const isGradientValue = (value?: string | null): boolean =>
  typeof value === 'string' && value.toLowerCase().includes('gradient');

const resolveAccentColor = (item: MenuItem): string => {
  const accent =
    typeof item.config?.accentColor === 'string' ? item.config.accentColor.trim() : '';

  if (accent.length > 0) {
    return accent;
  }

  if (typeof item.textColor === 'string' && item.textColor.trim().length > 0) {
    return item.textColor;
  }

  return DEFAULT_ACCENT_COLOR;
};

const getTopLevelStyles = (
  item: MenuItem,
  variant: SubMenuVariant,
  borderRadius?: string,
): React.CSSProperties => {
  const backgroundValue =
    typeof item.backgroundColor === 'string' ? item.backgroundColor.trim() : '';

  const style: React.CSSProperties = {
    borderRadius,
  };

  const configuredBorderColor = typeof item.borderColor === 'string' ? item.borderColor.trim() : '';
  const configuredBorderWidth = typeof item.borderWidth === 'string' ? item.borderWidth.trim() : '';

  if (configuredBorderColor.length > 0) {
    style.borderColor = configuredBorderColor;
  }
  if (configuredBorderWidth.length > 0) {
    style.borderWidth = configuredBorderWidth;
  }
  if (configuredBorderColor.length > 0 || configuredBorderWidth.length > 0) {
    style.borderStyle = style.borderStyle || 'solid';
    if (!style.borderWidth) {
      style.borderWidth = '1px';
    }
  }

  if (variant === 'button') {
    if (backgroundValue.length > 0) {
      if (isGradientValue(backgroundValue)) {
        style.backgroundImage = backgroundValue;
      } else {
        style.background = backgroundValue;
      }
    } else {
      style.backgroundImage = DEFAULT_BUTTON_GRADIENT;
    }

    style.color = item.textColor || '#ffffff';
    return style;
  }

  if (backgroundValue.length > 0) {
    if (isGradientValue(backgroundValue)) {
      style.backgroundImage = backgroundValue;
    } else {
      style.backgroundColor = backgroundValue;
    }
  }

  style.color = item.textColor || undefined;
  return style;
};

type BadgeConfig = {
  text?: string;
  color?: string;
  backgroundColor?: string;
};

const getEnabledChildren = (item: MenuItem): MenuItem[] =>
  (item.children || [])
    .filter(child => child.isEnabled)
    .sort((a, b) => a.position - b.position);

type SubMenuItemProps = {
  item: MenuItem;
  getLabel: (item: MenuItem) => string | null;
  getDescription: (item: MenuItem) => string | null;
  buildHref: (item: MenuItem) => string | null;
  getTranslation: (item: MenuItem) => any;
  getEnabledChildren: (item: MenuItem) => MenuItem[];
  renderChildLink: (child: MenuItem) => React.ReactNode;
};

const SubMenuItem: React.FC<SubMenuItemProps> = ({
  item,
  getLabel,
  getDescription,
  buildHref,
  getTranslation,
  getEnabledChildren,
  renderChildLink,
}) => {
  const badge = getBadgeConfig(item);
  const label = getLabel(item);
  const description = getDescription(item);
  const href = buildHref(item);
  const hasChildren = getEnabledChildren(item).length > 0;
  const variant = resolveSubMenuVariant(item);
  const animationClass = resolveButtonAnimationClass(item, variant);
  const resolvedBorderRadius = resolveButtonBorderRadius(item, variant);
  const accentColor = resolveAccentColor(item);
  const linkTarget = item.target === MenuTarget.BLANK ? '_blank' : item.target || undefined;
  const linkRel = item.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined;
  const linkHref = href || '#';
  const topLevelStyle = getTopLevelStyles(item, variant, resolvedBorderRadius);

  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ left: number; top: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasChildren || !isHovered) {
      setDropdownPosition(null);
      return;
    }

    let rafId: number | null = null;
    let isActive = true;

    const updatePosition = () => {
      if (!isActive || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        left: rect.left,
        top: rect.bottom + 12,
      });
    };

    const handleScroll = () => {
      if (!isActive) return;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    // Initial position update
    updatePosition();

    // Continuous update loop - runs every frame to keep position accurate
    const continuousUpdate = () => {
      if (!isActive || !isHovered) return;
      updatePosition();
      rafId = requestAnimationFrame(continuousUpdate);
    };

    // Start continuous update
    rafId = requestAnimationFrame(continuousUpdate);

    // Listen to scroll on all scrollable containers
    const scrollOptions = { capture: true, passive: true };
    document.addEventListener('scroll', handleScroll, scrollOptions);
    window.addEventListener('scroll', handleScroll, scrollOptions);
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      isActive = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener('scroll', handleScroll, scrollOptions);
      window.removeEventListener('scroll', handleScroll, scrollOptions);
      window.removeEventListener('resize', updatePosition);
    };
  }, [hasChildren, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          left: rect.left,
          top: rect.bottom + 12,
        });
      }
    };
    updatePosition();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Don't close if moving to dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('[data-dropdown-menu]')) {
      return;
    }
    setIsHovered(false);
    setDropdownPosition(null);
  };

  const handleDropdownMouseEnter = () => {
    setIsHovered(true);
  };

  const handleDropdownMouseLeave = () => {
    setIsHovered(false);
    setDropdownPosition(null);
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

  const isCallButton = item.type === MenuType.CALL_BUTTON;
  const animationAnimation = item.config?.buttonAnimation;
  const isRingAnimation = animationAnimation === 'ring';

  const iconElement = item.icon ? (
    <span
      className={clsx(
        'flex flex-shrink-0 items-center justify-center text-sm',
        isCallButton
          ? 'h-6 w-6 rounded-full border-2 border-white/30 bg-white/10'
          : variant === 'button'
            ? 'h-6 w-6 rounded-lg bg-white/15'
            : 'h-6 w-6 rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/30',
        isRingAnimation && 'subnav-ring'
      )}
      style={{ color: 'inherit' }}
    >
      <UnifiedIcon
        icon={item.icon}
        variant="nav"
        size={isCallButton ? 14 : 14}
        className="!text-inherit"
      />
    </span>
  ) : null;

  const badgeNode = badge?.text ? (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide flex-shrink-0"
      style={{
        color: badge.color || (variant === 'button' ? '#ffffff' : accentColor),
        backgroundColor:
          badge.backgroundColor ||
          (variant === 'button' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(37, 99, 235, 0.12)'),
      }}
    >
      {badge.text}
    </span>
  ) : null;

  const buttonSizeClass = resolveButtonSizeClass(item);

  return (
    <div
      key={item.id}
      className="relative group/subnav focus-within:z-50 flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        ref={buttonRef}
        href={linkHref}
        target={linkTarget}
        rel={linkRel}
        className={clsx(
          'relative flex items-center w-auto min-w-0 max-w-[200px] sm:max-w-[220px] md:max-w-[240px] gap-2 rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
          variant === 'button'
            ? buttonSizeClass
            : 'px-2.5 py-2 sm:px-3 sm:py-2 h-10',
          variant === 'button'
            ? 'text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-2xl border-transparent'
            : 'bg-white/80 dark:bg-gray-950/60 text-gray-800 dark:text-gray-100 border-gray-200/70 dark:border-gray-800/70 hover:-translate-y-0.5 hover:border-blue-200/70 hover:shadow-lg backdrop-blur',
          animationClass,
        )}
        style={topLevelStyle}
      >
        {iconElement}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          {isCallButton ? (
            <>
              <p className="text-[90%] font-medium leading-[1.1] mb-0 opacity-90">
                {label || href || 'Untitled'}
              </p>
              {description && (
                <p className="text-[110%] font-bold leading-[1.2] tracking-tight mb-0">
                  {description}
                </p>
              )}
            </>
          ) : (
            <p className="truncate font-semibold leading-tight mb-0">
              {label || href || 'Untitled'}
            </p>
          )}
        </div>
        {hasChildren && (
          <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {badgeNode}
      </Link>

      {hasChildren && isHovered && dropdownPosition && mounted && createPortal(
        <div
          data-dropdown-menu
          className="fixed w-[min(400px,calc(100vw-2rem))] rounded-2xl border border-gray-200/90 dark:border-gray-700/80 bg-white/98 dark:bg-gray-950/95 shadow-2xl shadow-slate-900/20 dark:shadow-black/40 z-[9999] backdrop-blur-xl"
          style={{
            left: `${dropdownPosition.left}px`,
            top: `${dropdownPosition.top}px`,
            position: 'fixed',
            willChange: 'transform',
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="max-h-[420px] overflow-y-auto p-3.5 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {getEnabledChildren(item).map(renderChildLink)}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

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
  const { getSettingAsBoolean } = useSettings();
  const isSubMenuEnabled = getSettingAsBoolean(SUB_MENU_VISIBILITY_SETTING_KEY, true);
  const { treeData, isLoading, getLabel, getDescription, buildHref } = useMenu(SUB_MENU_GROUP);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isSubMenuEnabled) {
    return null;
  }

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
    const accentColor = resolveAccentColor(child);
    const hasGrandChildren = grandChildren.length > 0;

    return (
      <div
        key={child.id}
        className="group/child relative rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/90 shadow-sm hover:shadow-lg hover:border-blue-200/60 dark:hover:border-blue-700/60 transition-all duration-200 p-3.5 space-y-2.5 hover:-translate-y-0.5"
      >
        <Link
          href={childHref || '#'}
          target={child.target ? child.target : undefined}
          rel={child.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
          className="flex items-start gap-3 text-left"
        >
          {child.icon && (
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-800/20 shadow-sm group-hover/child:shadow-md group-hover/child:scale-105 transition-all duration-200 text-gray-900 dark:text-gray-100 group-hover/child:text-blue-600 dark:group-hover/child:text-blue-400"
            >
              <UnifiedIcon icon={child.icon} variant="nav" size={16} />
            </span>
          )}

          <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover/child:text-blue-600 dark:group-hover/child:text-blue-400 transition-colors duration-200 leading-tight mb-0">
              {childLabel}
            </p>
            {childDescription && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-0">
                {childDescription}
              </p>
            )}
          </div>

          {hasGrandChildren && (
            <svg
              className="mt-1 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover/child:text-blue-500 dark:group-hover/child:text-blue-400 transition-colors duration-200 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>

        {hasGrandChildren && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100/80 dark:border-gray-800/60">
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
                  className="group/tag inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 dark:border-gray-700/70 bg-gradient-to-r from-gray-50/80 to-gray-50/60 dark:from-gray-800/50 dark:to-gray-800/30 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <span className="truncate max-w-[120px]">{grandLabel}</span>
                  {grandDescription && (
                    <span className="text-[10px] font-normal text-gray-500 dark:text-gray-500 group-hover/tag:text-gray-600 dark:group-hover/tag:text-gray-400">
                      · {grandDescription}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    return (
      <SubMenuItem
        key={item.id}
        item={item}
        getLabel={getLabel}
        getDescription={getDescription}
        buildHref={buildHref}
        getTranslation={getTranslation}
        getEnabledChildren={getEnabledChildren}
        renderChildLink={renderChildLink}
      />
    );
  };

  return (
    <>
      <div className="z-30 w-full border-b border-gray-200/70 dark:border-gray-800/70 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-950/95 dark:via-gray-950/90 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute inset-0 w-full bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10" />
        <Container className="relative z-10 py-2.5" aria-label="secondary storefront navigation">
          <div className="subnav-scroll-area flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-transparent pb-1 pr-3">
            {isLoading && rootItems.length === 0
              ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`sub-menu-skeleton-${index}`}
                  className="h-10 w-28 rounded-2xl bg-gray-100/70 dark:bg-gray-800/70 animate-pulse"
                />
              ))
              : rootItems.map(renderMenuItem)}
          </div>
        </Container>
      </div>
      <style jsx>{`
        :global(.subnav-float) {
          animation: subnavFloat 3s ease-in-out infinite;
        }

        @keyframes subnavFloat {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        :global(.subnav-ring) {
          animation: subnavRing 2s infinite;
        }

        @keyframes subnavRing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </>
  );
};

export default SubMenuBar;
