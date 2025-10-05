import React from 'react';
import { SectionTranslationContent } from './HeroSlider';

export interface CustomHtmlConfig {
  html?: string;
}

interface CustomHtmlSectionProps {
  config: CustomHtmlConfig;
  translation?: SectionTranslationContent | null;
}

export const CustomHtmlSection: React.FC<CustomHtmlSectionProps> = ({ config, translation }) => {
  const html = config.html || '<div class="p-6 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white">\n  <h2 class="text-2xl font-semibold">Compose custom sections</h2>\n  <p class="mt-2 text-sm opacity-90">Inject bespoke marketing content, embed live widgets, or hand-off to your CMS.</p>\n</div>';

  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {translation?.title && (
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-900">{translation.title}</h2>
            {translation.description && <p className="mt-2 text-gray-500">{translation.description}</p>}
          </div>
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
};

export default CustomHtmlSection;
