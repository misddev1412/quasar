import React from 'react';
import Link from 'next/link';
import { SectionTranslationContent } from './HeroSlider';

export interface ProductsByCategoryConfig {
  categoryId?: string;
  limit?: number;
  sort?: string;
}

interface ProductsByCategoryProps {
  config: ProductsByCategoryConfig;
  translation?: SectionTranslationContent | null;
}

export const ProductsByCategory: React.FC<ProductsByCategoryProps> = ({ config, translation }) => {
  const limit = config.limit ?? 6;
  const categoryLabel = config.categoryId ? `Category ${config.categoryId}` : 'Curated category';
  const placeholderItems = Array.from({ length: limit }).map((_, index) => ({
    id: `${config.categoryId || 'category'}-${index}`,
    name: `Item ${index + 1}`,
    badge: config.sort ? config.sort.replace(/_/g, ' ') : 'Popular',
  }));

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-500">{categoryLabel}</p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">
              {translation?.title || 'Products by category'}
            </h2>
            {translation?.description && <p className="mt-2 text-gray-500">{translation.description}</p>}
          </div>
          <Link
            href={config.categoryId ? `/categories/${config.categoryId}` : '/categories'}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            View category
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {placeholderItems.map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="aspect-video rounded-t-xl bg-gradient-to-br from-blue-100 via-white to-blue-200" />
              <div className="p-5 space-y-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  {item.badge}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  Quickly adapt this section to surface top-rated content, seasonal bundles, or merchandising campaigns.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsByCategory;
