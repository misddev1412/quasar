import React from 'react';
import Link from 'next/link';
import { SectionTranslationContent } from './HeroSlider';

export interface NewsSectionConfig {
  limit?: number;
  categories?: string[];
}

interface NewsSectionProps {
  config: NewsSectionConfig;
  translation?: SectionTranslationContent | null;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ config, translation }) => {
  const limit = config.limit ?? 3;
  const categories = config.categories ?? [];
  const placeholderPosts = Array.from({ length: limit }).map((_, index) => ({
    id: `news-${index}`,
    title: `Editorial update ${index + 1}`,
    excerpt: 'Share company milestones, product launch notes, or curated editorials for your community.',
    date: new Date(Date.now() - index * 1000 * 60 * 60 * 24).toLocaleDateString(),
  }));

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-500">
              {categories.length > 0 ? categories.join(', ') : 'Latest news'}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">
              {translation?.title || 'Latest stories'}
            </h2>
            {translation?.description && <p className="mt-2 text-gray-500">{translation.description}</p>}
          </div>
          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View newsroom
          </Link>
        </div>

        <div className="space-y-6">
          {placeholderPosts.map((post) => (
            <article key={post.id} className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 hover:shadow-md transition">
              <p className="text-xs uppercase tracking-wide text-gray-400">{post.date}</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">{post.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>
              <Link href={`/news/${post.id}`} className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Read story →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
