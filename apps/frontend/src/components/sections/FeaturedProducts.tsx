import React from 'react';
import Link from 'next/link';
import { SectionTranslationContent } from './HeroSlider';

export interface FeaturedProductsConfig {
  productIds?: string[];
  displayStyle?: 'grid' | 'carousel';
  itemsPerRow?: number;
}

interface FeaturedProductsProps {
  config: FeaturedProductsConfig;
  translation?: SectionTranslationContent | null;
}

const placeholderProducts = (ids: string[], count: number) => {
  if (ids.length > 0) {
    return ids.map((id) => ({ id, name: `Product ${id}`, price: Math.random() * 80 + 20 }));
  }
  return Array.from({ length: count }).map((_, index) => ({
    id: `placeholder-${index}`,
    name: `Placeholder product ${index + 1}`,
    price: 39 + index * 12,
  }));
};

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ config, translation }) => {
  const itemsPerRow = config.itemsPerRow ?? 4;
  const products = placeholderProducts(config.productIds || [], itemsPerRow);

  return (
    <section id="sections" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              {translation?.title || 'Featured products'}
            </h2>
            {translation?.subtitle && (
              <p className="mt-2 text-gray-500">{translation.subtitle}</p>
            )}
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          >
            Browse catalog
          </Link>
        </div>

        <div
          className={`grid gap-6 ${
            itemsPerRow >= 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : itemsPerRow === 3
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {translation?.description || 'Highlight flagship items or curated bundles for quick discovery.'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base font-semibold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/products/${product.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
