'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionTranslationContent } from './HeroSlider';

export interface CustomHtmlConfig {
  html?: string;
}

interface CustomHtmlSectionProps {
  config: CustomHtmlConfig;
  translation?: SectionTranslationContent | null;
}

export const CustomHtmlSection: React.FC<CustomHtmlSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const html = config.html || `<div class="p-6 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
  <h2 class="text-2xl font-semibold">${t('sections.custom_html.default_title')}</h2>
  <p class="mt-2 text-sm opacity-90">${t('sections.custom_html.default_description')}</p>
</div>`;

  return (
    <section className="py-16 bg-transparent text-gray-900 dark:text-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        {(translation?.title || translation?.description) && (
          <div className="mb-6 max-w-3xl">
            {translation.title && <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{translation.title}</h2>}
            {translation.description && <p className="mt-2 text-gray-600 dark:text-gray-400">{translation.description}</p>}
          </div>
        )}
        <div
          className="custom-html-content prose prose-lg max-w-none text-black prose-headings:text-black prose-p:text-gray-800 dark:text-gray-100 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
};

export default CustomHtmlSection;
