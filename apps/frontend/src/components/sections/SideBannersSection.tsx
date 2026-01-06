'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SectionTranslationContent } from './HeroSlider';

export type SideBannerBreakpoint = 'lg' | 'xl' | '2xl';

export interface SideBannerCardConfig {
  id?: string;
  slot?: 'left' | 'right';
  label?: string;
  title?: string;
  description?: string;
  highlight?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  background?: string;
  textColor?: string;
  badgeBackground?: string;
  badgeTextColor?: string;
  footerBackground?: string;
  footerTextColor?: string;
}

export interface SideBannersConfig {
  width?: number;
  height?: number;
  gap?: number;
  hideBelowBreakpoint?: SideBannerBreakpoint;
  stickyTop?: number;
  footerGap?: number;
  minViewportWidth?: number;
  minContentWidth?: number;
  cardBorderRadius?: string;
  showCtaButton?: boolean;
  imageOverlayEnabled?: boolean;
  cards?: SideBannerCardConfig[];
}

const FALLBACK_CARDS: SideBannerCardConfig[] = [
  {
    id: 'side-banner-left',
    slot: 'left',
    label: 'ƯU ĐÃI ĐẶC BIỆT',
    title: 'Ưu đãi thành viên mới',
    description: 'Nhận ngay voucher 15% cho đơn hàng đầu tiên cùng quà tặng giới hạn.',
    highlight: 'Giảm đến 40%',
    ctaLabel: 'Khám phá',
    ctaUrl: '/collections/new-arrivals',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=900&q=80',
    background: 'linear-gradient(180deg, #fb7185 0%, #f97316 50%, #fcd34d 100%)',
    textColor: '#ffffff',
    badgeBackground: 'rgba(255, 255, 255, 0.18)',
    badgeTextColor: '#ffffff',
    footerBackground: 'rgba(255,255,255,0.92)',
    footerTextColor: '#0f172a',
  },
  {
    id: 'side-banner-right',
    slot: 'right',
    label: 'FLASH SALE',
    title: 'Bộ sưu tập công nghệ',
    description: 'Sở hữu thiết bị mới nhất với ưu đãi độc quyền trong 48 giờ.',
    highlight: 'Chỉ 48h',
    ctaLabel: 'Mua ngay',
    ctaUrl: '/collections/tech',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    background: 'linear-gradient(180deg, #38bdf8 0%, #6366f1 50%, #0f172a 100%)',
    textColor: '#ffffff',
    badgeBackground: 'rgba(255, 255, 255, 0.18)',
    badgeTextColor: '#ffffff',
    footerBackground: 'rgba(15,23,42,0.9)',
    footerTextColor: '#f8fafc',
  },
];

const breakpointVisibilityClass: Record<SideBannerBreakpoint, string> = {
  lg: 'hidden lg:block',
  xl: 'hidden xl:block',
  '2xl': 'hidden 2xl:block',
};

interface SideBannersSectionProps {
  config?: SideBannersConfig;
  translation?: SectionTranslationContent;
}

const DEFAULT_WIDTH = 140;
const DEFAULT_HEIGHT = 470;
const DEFAULT_GAP = 24;
const DEFAULT_BREAKPOINT: SideBannerBreakpoint = 'xl';

export const SideBannersSection: React.FC<SideBannersSectionProps> = ({ config }) => {
  const [portalNode, setPortalNode] = useState<Element | null>(null);
  const [stickyTop, setStickyTop] = useState(0);
  const [isViewportWide, setIsViewportWide] = useState(true);
  const width = typeof config?.width === 'number' ? config.width : DEFAULT_WIDTH;
  const height = typeof config?.height === 'number' ? config.height : DEFAULT_HEIGHT;
  const gap = typeof config?.gap === 'number' ? config.gap : DEFAULT_GAP;
  const cardBorderRadius =
    typeof config?.cardBorderRadius === 'string' && config.cardBorderRadius.trim().length > 0
      ? config.cardBorderRadius.trim()
      : '42px';
  const showCtaButton = config?.showCtaButton !== false;
  const imageOverlayEnabled = config?.imageOverlayEnabled !== false;
  const breakpoint = config?.hideBelowBreakpoint && breakpointVisibilityClass[config.hideBelowBreakpoint]
    ? config.hideBelowBreakpoint
    : DEFAULT_BREAKPOINT;

  const cards = Array.isArray(config?.cards) && config.cards.length > 0 ? config.cards : FALLBACK_CARDS;
  const orderedCards = [...cards]
    .slice(0, 2)
    .sort((a, b) => (a.slot === 'right' ? 1 : -1) - (b.slot === 'right' ? 1 : -1))
    .map((card, index) => ({
      ...card,
      slot: card.slot ?? (index === 0 ? 'left' : 'right'),
    }));

  const visibilityClass = breakpointVisibilityClass[breakpoint];

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    const footerGap = typeof (config as Record<string, any>)?.footerGap === 'number'
      ? (config as Record<string, any>).footerGap
      : 24;

    const updateStickyTop = () => {
      const fallbackTop =
        typeof (config as Record<string, any>)?.stickyTop === 'number'
          ? (config as Record<string, any>).stickyTop
          : 16;
      const headerElement = document.querySelector('[data-main-header]');
      const submenuElement = document.querySelector('[data-submenu-bar]');
      const footerElement = document.querySelector('[data-footer-stats]') || document.querySelector('[data-main-footer]');

      let computedTop = fallbackTop;
      if (headerElement) {
        const headerRect = headerElement.getBoundingClientRect();
        computedTop = Math.max(computedTop, headerRect.bottom + 8);
      }
      if (submenuElement) {
        const submenuRect = submenuElement.getBoundingClientRect();
        computedTop = Math.max(computedTop, submenuRect.bottom + 8);
      }

      if (footerElement) {
        const footerRect = footerElement.getBoundingClientRect();
        const maxTop = footerRect.top - height - footerGap;
        computedTop = Math.min(computedTop, maxTop);
      }

      setStickyTop(computedTop);
    };

    updateStickyTop();
    window.addEventListener('scroll', updateStickyTop, { passive: true });
    window.addEventListener('resize', updateStickyTop);
    const observerTargets = ['[data-submenu-bar]', '[data-main-header]', '[data-main-footer]', '[data-footer-stats]']
      .map(selector => document.querySelector(selector))
      .filter((el): el is Element => Boolean(el));
    const observer = new MutationObserver(updateStickyTop);
    observerTargets.forEach((el) => observer.observe(el, { attributes: true, childList: true, subtree: true }));

    return () => {
      window.removeEventListener('scroll', updateStickyTop);
      window.removeEventListener('resize', updateStickyTop);
      observer.disconnect();
    };
  }, [config, height]);

  useEffect(() => {
    const minViewportWidth = typeof (config as Record<string, any>)?.minViewportWidth === 'number'
      ? (config as Record<string, any>).minViewportWidth
      : 1800;
    const minContentWidth = typeof (config as Record<string, any>)?.minContentWidth === 'number'
      ? (config as Record<string, any>).minContentWidth
      : 1024;
    const requiredPerSide = width + gap + 140;
    const fallbackRequiredWidth = minContentWidth + requiredPerSide * 2;

    const handleResize = () => {
      const requiredWidth = Math.max(minViewportWidth, fallbackRequiredWidth);
      setIsViewportWide(window.innerWidth >= requiredWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [config, width, gap]);

  if (orderedCards.length === 0 || !portalNode) {
    return null;
  }

  const gapPx = `${gap}px`;
  const innerHorizontalInset = Math.max(0, gap - 12);
  const verticalOffset = Math.max(16, gap - 4);
  const renderCard = (card: SideBannerCardConfig) => {
    const textColor = card.textColor || '#ffffff';
    const badgeBackground = card.badgeBackground || 'rgba(255, 255, 255, 0.2)';
    const badgeTextColor = card.badgeTextColor || textColor;
    const footerBackground = card.footerBackground || 'rgba(255,255,255,0.9)';
    const footerTextColor = card.footerTextColor || '#0f172a';
    const imageUrl = card.imageUrl && card.imageUrl.trim().length > 0 ? card.imageUrl : null;
    const horizontalTranslate =
      card.slot === 'left'
        ? `translateX(calc(-100% - ${innerHorizontalInset}px))`
        : `translateX(calc(100% + ${innerHorizontalInset}px))`;
    const transform = horizontalTranslate;

    return (
      <article
        key={card.id || card.slot}
        className="absolute z-[5] flex flex-col justify-between border border-white/50 dark:border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.25)] overflow-hidden text-white pointer-events-auto"
        style={{
          width,
          height,
          top: verticalOffset,
          left: card.slot === 'left' ? innerHorizontalInset : undefined,
          right: card.slot === 'right' ? innerHorizontalInset : undefined,
          transform,
          borderRadius: cardBorderRadius,
        }}
      >
        <div
          className="relative flex-1 p-4"
          style={{
            color: textColor,
            background: card.background || 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderTopLeftRadius: cardBorderRadius,
            borderTopRightRadius: cardBorderRadius,
          }}
        >
          {imageUrl ? (
            <div className="absolute inset-0">
              <img src={imageUrl} alt={card.title || card.label || 'Side banner'} className="w-full h-full object-cover" />
              {imageOverlayEnabled ? (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
              ) : null}
            </div>
          ) : (
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle at top, rgba(255,255,255,0.9), transparent 60%)' }}
              aria-hidden
            />
          )}
          <div className="relative flex flex-col h-full">
            {card.label ? (
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-80">{card.label}</div>
            ) : null}
            {card.title ? <h3 className="mt-4 text-lg font-bold leading-tight">{card.title}</h3> : null}
            {card.description ? (
              <p className="mt-2 text-xs leading-relaxed opacity-80">{card.description}</p>
            ) : null}
            {card.highlight ? (
              <div className="mt-auto">
                <div
                  className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: badgeBackground, color: badgeTextColor }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badgeTextColor }} />
                  {card.highlight}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {showCtaButton ? (
          <div
            className="p-4 backdrop-blur border-t border-white/40 dark:border-white/5"
            style={{
              background: footerBackground,
              borderBottomLeftRadius: cardBorderRadius,
              borderBottomRightRadius: cardBorderRadius,
            }}
          >
            <a
              href={card.ctaUrl || '#'}
              className="w-full inline-flex justify-center text-[13px] font-semibold py-2 rounded-2xl transition"
              style={{
                background: '#ffffff',
                color: footerTextColor,
                opacity: card.ctaUrl ? 1 : 0.6,
                pointerEvents: card.ctaUrl ? 'auto' : 'none',
              }}
              aria-disabled={!card.ctaUrl}
            >
              {card.ctaLabel || 'Xem chi tiết'}
            </a>
          </div>
        ) : null}
      </article>
    );
  };

  const portalContent = (
    <div
      className={`${visibilityClass}`}
      style={{
        position: 'fixed',
        top: stickyTop,
        left: 0,
        right: 0,
        width: '100%',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <div className="relative mx-auto max-w-7xl" style={{ minHeight: height }}>
        {orderedCards.map((card) => renderCard(card))}
      </div>
    </div>
  );

  if (!portalNode || !isViewportWide) {
    return null;
  }

  return createPortal(portalContent, portalNode);
};

export default SideBannersSection;
