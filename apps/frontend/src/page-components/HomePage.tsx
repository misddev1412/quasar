'use client';

import React from 'react';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  const features = [
    {
      title: t('pages.home.features.modern.title'),
      description: t('pages.home.features.modern.description'),
    },
    {
      title: t('pages.home.features.responsive.title'),
      description: t('pages.home.features.responsive.description'),
    },
    {
      title: t('pages.home.features.performance.title'),
      description: t('pages.home.features.performance.description'),
    },
  ];
  const videos = [
    {
      id: 'overview',
      title: t('pages.home.video_section.videos.overview.title'),
      description: t('pages.home.video_section.videos.overview.description'),
      url: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    },
    {
      id: 'components',
      title: t('pages.home.video_section.videos.components.title'),
      description: t('pages.home.video_section.videos.components.description'),
      url: 'https://www.youtube.com/embed/LXb3EKWsInQ',
    },
    {
      id: 'automation',
      title: t('pages.home.video_section.videos.automation.title'),
      description: t('pages.home.video_section.videos.automation.description'),
      url: 'https://www.youtube.com/embed/oUFJJNQGwhk',
    },
  ];
  const [activeVideoIndex, setActiveVideoIndex] = React.useState(0);
  const activeVideo = videos[activeVideoIndex];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl text-white">
        <h1 className="text-5xl font-bold mb-6">{t('pages.home.hero.title')}</h1>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          {t('pages.home.hero.description')}
        </p>
        <Button size="lg" color="secondary" variant="solid" className="font-semibold px-8 py-3">
          {t('pages.home.hero.cta')}
        </Button>
      </div>

      {/* Features Section */}
      <div className="py-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">{t('pages.home.features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:scale-105 transition-transform duration-200"
              shadow="md"
            >
              <CardHeader className="pb-2">
                <h3 className="text-xl font-semibold text-blue-600">{feature.title}</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Video Section */}
      <div className="py-12 px-4 bg-gray-50 rounded-3xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pages.home.video_section.title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('pages.home.video_section.description')}
          </p>
        </div>

        <div className="mt-10 max-w-5xl mx-auto">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
            <iframe
              key={activeVideo.id}
              src={activeVideo.url}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="w-full h-full"
            ></iframe>
          </div>

          <div className="mt-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{activeVideo.title}</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">{activeVideo.description}</p>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            {videos.map((video, index) => {
              const isActive = index === activeVideoIndex;
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveVideoIndex(index)}
                  aria-label={t('pages.home.video_section.pagination_label', { index: index + 1 })}
                  className={`h-3 rounded-full transition-all duration-200 ${
                    isActive ? 'w-10 bg-blue-600' : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                >
                  <span className="sr-only">{video.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
