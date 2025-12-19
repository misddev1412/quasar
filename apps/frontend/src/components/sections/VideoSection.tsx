'use client';

import React from 'react';
import type { SectionTranslationContent } from './HeroSlider';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface VideoSectionConfig {
  type?: 'embed' | 'upload';
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

interface VideoSectionProps {
  config: VideoSectionConfig;
  translation?: SectionTranslationContent | null;
}

const fallbackVideo: VideoSectionConfig = {
  type: 'embed',
  embedUrl: 'https://www.youtube.com/embed/_nBlN9yp9R8',
  posterImage: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80',
};

export const VideoSection: React.FC<VideoSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const videoConfig = config.embedUrl || config.videoUrl ? config : fallbackVideo;
  const isEmbed = videoConfig.type !== 'upload';
  const title = translation?.title === null ? '' : (translation?.title || t('sections.video.title'));
  const subtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.video.subtitle'));
  const description = translation?.description === null ? '' : (translation?.description || t('sections.video.description'));
  const hasTextContent = title || subtitle || description;
  const cta = videoConfig.cta;

  return (
    <section className="bg-gray-900 py-20 text-white">
      <SectionContainer className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {isEmbed ? (
              <div className="aspect-video w-full">
                <iframe
                  title={title || 'Embedded video'}
                  src={videoConfig.embedUrl || fallbackVideo.embedUrl}
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
                autoPlay={videoConfig.autoplay}
                poster={videoConfig.posterImage || fallbackVideo.posterImage}
              >
                <source src={videoConfig.videoUrl} />
              </video>
            )}
          </div>
          {videoConfig.caption && (
            <p className="mt-4 text-sm text-blue-100">{videoConfig.caption}</p>
          )}
        </div>
        <div>
          {subtitle && <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>}
          {description && <p className="mt-4 text-base text-blue-100">{description}</p>}

          {cta?.label && cta.href && (
            <a
              href={cta.href}
              target={cta.openInNewTab ? '_blank' : undefined}
              rel={cta.openInNewTab ? 'noreferrer' : undefined}
              className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              {cta.label}
            </a>
          )}
        </div>
      </SectionContainer>
    </section>
  );
};

export default VideoSection;
