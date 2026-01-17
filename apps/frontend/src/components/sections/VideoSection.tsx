'use client';

import React, { type CSSProperties } from 'react';
import type { SectionTranslationContent } from './HeroSlider';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface VideoSlideConfig {
  id?: string;
  type?: 'embed' | 'upload';
  title?: string;
  description?: string;
  embedUrl?: string;
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  caption?: string;
  cta?: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  };
}

export interface VideoSectionConfig {
  embedUrl?: string;
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  caption?: string;
  backgroundColor?: string;
  backgroundColorDark?: string;
  cta?: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  };
  videos?: VideoSlideConfig[];
}

interface VideoSectionProps {
  config: VideoSectionConfig;
  translation?: SectionTranslationContent | null;
}

const ensureProtocol = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return `https://${url}`;
};

const buildYoutubeEmbed = (videoId: string, params?: URLSearchParams) => {
  const query = params && Array.from(params.keys()).length > 0 ? `?${params.toString()}` : '';
  return `https://www.youtube.com/embed/${videoId}${query}`;
};

const normalizeEmbedUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = ensureProtocol(trimmed);

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./i, '');
    const pathSegments = parsed.pathname.split('/').filter(Boolean);

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (parsed.pathname === '/watch') {
        const videoId = parsed.searchParams.get('v');
        if (videoId) {
          const params = new URLSearchParams(parsed.searchParams);
          params.delete('v');
          return buildYoutubeEmbed(videoId, params);
        }
      }

      if (pathSegments[0] === 'shorts' && pathSegments[1]) {
        const params = new URLSearchParams(parsed.searchParams);
        return buildYoutubeEmbed(pathSegments[1], params);
      }

      if (pathSegments[0] === 'live' && pathSegments[1]) {
        const params = new URLSearchParams(parsed.searchParams);
        return buildYoutubeEmbed(pathSegments[1], params);
      }
    }

    if (host === 'youtu.be' && pathSegments[0]) {
      const params = new URLSearchParams(parsed.searchParams);
      return buildYoutubeEmbed(pathSegments[0], params);
    }

    return parsed.toString();
  } catch {
    return withProtocol;
  }
};

const normalizeSlides = (slides: VideoSlideConfig[]) =>
  slides.map((slide) => ({
    ...slide,
    embedUrl: normalizeEmbedUrl(slide.embedUrl),
  }));

const parseColor = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim().toLowerCase();

  const hexMatch = trimmed.match(/^#([\da-f]{3,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }

  const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => Number(part.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every((num) => Number.isFinite(num))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }

  return undefined;
};

const getLuminance = (color?: { r: number; g: number; b: number }) => {
  if (!color) {
    return undefined;
  }
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(Math.min(255, Math.max(0, color.r)));
  const g = toLinear(Math.min(255, Math.max(0, color.g)));
  const b = toLinear(Math.min(255, Math.max(0, color.b)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getCtaColors = (background: string, lightFallback: string, darkFallback: string) => {
  const luminance = getLuminance(parseColor(background));
  if (typeof luminance === 'number') {
    if (luminance > 0.7) {
      return { background: '#0f172a', text: '#f8fafc' };
    }
    if (luminance < 0.2) {
      return { background: '#f8fafc', text: '#0f172a' };
    }
  }
  return { background: lightFallback, text: darkFallback };
};

const fallbackSlides: VideoSlideConfig[] = [
  {
    id: 'atelier-film',
    type: 'embed',
    title: 'Behind the Atelier',
    description: 'Walk through the Saigon studio and watch how each piece is constructed.',
    embedUrl: 'https://www.youtube.com/embed/mNFVvHxkNNM?rel=0&showinfo=0',
    posterImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    caption: 'Filmed on-site with the atelier team',
  },
  {
    id: 'showroom-tour',
    type: 'embed',
    title: 'Lookbook in Motion',
    description: 'Styling team showcases how to layer key looks for the season.',
    embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    posterImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    caption: 'Captured during the private showroom preview',
  },
  {
    id: 'material-story',
    type: 'embed',
    title: 'Material Origins',
    description: 'Take a closer look at the fabrics and trims sourced for this collection.',
    embedUrl: 'https://www.youtube.com/embed/oUFJJNQGwhk',
    posterImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    caption: 'Shot with partners across Hanoi and Da Lat',
  },
];

export const VideoSection: React.FC<VideoSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const slides = React.useMemo(() => {
    const providedSlides =
      config.videos?.map((video, index) => ({
        ...video,
        id: video.id || `video-${index + 1}`,
        type: video.type || 'embed',
      })) || [];
    const validSlides = providedSlides.filter((video) => Boolean(video.embedUrl || video.videoUrl));

    if (validSlides.length > 0) {
      return normalizeSlides(validSlides);
    }

    if (config.embedUrl || config.videoUrl) {
      return normalizeSlides([
        {
          id: 'primary-video',
          type: 'embed',
          title: translation?.title || fallbackSlides[0].title,
          description: translation?.description || fallbackSlides[0].description,
          embedUrl: config.embedUrl,
          videoUrl: config.videoUrl,
          posterImage: config.posterImage || fallbackSlides[0].posterImage,
          autoplay: config.autoplay,
          caption: config.caption,
          cta: config.cta,
        },
      ]);
    }

    return normalizeSlides(fallbackSlides);
  }, [config, translation]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);
  const activeSlide = slides[activeIndex] || slides[0];
  const isEmbed = (activeSlide?.type || 'embed') !== 'upload';
  const firstSlide = slides[0];
  const fallbackTitle = activeSlide?.title || firstSlide?.title || '';
  const fallbackSubtitle = activeSlide?.description || '';
  const fallbackDescription = '';
  const title =
    translation?.title === null
      ? ''
      : translation?.title?.trim()
        ? translation.title
        : fallbackTitle || t('sections.video.title');
  const subtitle =
    translation?.subtitle === null
      ? ''
      : translation?.subtitle?.trim()
        ? translation.subtitle
        : fallbackSubtitle || t('sections.video.subtitle');
  const description =
    translation?.description === null
      ? ''
      : translation?.description?.trim()
        ? translation.description
        : fallbackDescription || t('sections.video.description');
  const slideCta = activeSlide?.cta || config.cta;
  const backgroundLight = (config.backgroundColor || '').trim() || '#0f172a';
  const backgroundDark = (config.backgroundColorDark || '').trim() || backgroundLight || '#030712';
  const sectionStyle = React.useMemo(
    () => {
      const ctaLight = getCtaColors(backgroundLight, '#f8fafc', '#0f172a');
      const ctaDark = getCtaColors(backgroundDark, '#f8fafc', '#0f172a');
      return {
        '--video-bg-light': backgroundLight,
        '--video-bg-dark': backgroundDark,
        '--video-cta-bg-light': ctaLight.background,
        '--video-cta-text-light': ctaLight.text,
        '--video-cta-bg-dark': ctaDark.background,
        '--video-cta-text-dark': ctaDark.text,
      } as CSSProperties;
    },
    [backgroundLight, backgroundDark],
  );

  return (
    <section className="bg-[var(--video-bg-light)] py-4 lg:py-16 text-white dark:bg-[var(--video-bg-dark)]" style={sectionStyle}>
      <SectionContainer className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {isEmbed ? (
              <div className="aspect-video w-full">
                <iframe
                  title={activeSlide?.title || title || 'Embedded video'}
                  src={activeSlide?.embedUrl || fallbackSlides[0].embedUrl}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                className="h-full w-full"
                controls
                autoPlay={Boolean(activeSlide?.autoplay ?? config.autoplay)}
                poster={activeSlide?.posterImage || config.posterImage || fallbackSlides[0].posterImage}
              >
                <source src={activeSlide?.videoUrl} />
              </video>
            )}
          </div>
          {slideCta?.label && slideCta.href && (
            <div className="mt-6 flex justify-center">
              <a
                href={slideCta.href}
                target={slideCta.openInNewTab ? '_blank' : undefined}
                rel={slideCta.openInNewTab ? 'noreferrer' : undefined}
                className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold shadow-lg ring-1 ring-black/5 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-[var(--video-cta-bg-light)] text-[var(--video-cta-text-light)] dark:bg-[var(--video-cta-bg-dark)] dark:text-[var(--video-cta-text-dark)] dark:ring-white/10"
              >
                {slideCta.label}
              </a>
            </div>
          )}
          {slides.length > 1 && (
            <div className="mt-6 flex justify-center gap-3">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={slide.id || `slide-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-200 ${isActive ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
                      }`}
                    aria-label={t('sections.video.pagination_label', { index: index + 1 })}
                    aria-current={isActive}
                  >
                    <span className="sr-only">{slide.title || `${t('sections.video.pagination_label', { index: index + 1 })}`}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="text-center">
          {subtitle && <p className="text-base font-medium text-blue-200">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>}
          {description && <p className="mt-4 text-base text-blue-100">{description}</p>}

        </div>
      </SectionContainer>
    </section>
  );
};

export default VideoSection;
