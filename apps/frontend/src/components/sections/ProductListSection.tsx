'use client';

import React from 'react';
import ProductsContainer from '../ecommerce/ProductsContainer';
import type { SectionTranslationContent } from './HeroSlider';

export interface ProductListSectionConfig {
  showSidebar?: boolean;
  stickySidebar?: boolean;
  pageSize?: number;
  gridColumns?: number;
  showSort?: boolean;
  showHeader?: boolean;
}

interface ProductListSectionProps {
  config: ProductListSectionConfig;
  translation?: SectionTranslationContent | null;
}

export const ProductListSection: React.FC<ProductListSectionProps> = ({ config, translation }) => {
  const heading = translation?.title === null ? '' : translation?.title;
  const subtitleHidden = translation?.subtitle === null;
  const descriptionHidden = translation?.description === null;
  const subheadingValue = translation?.subtitle ?? translation?.description;
  const subheading = subtitleHidden && descriptionHidden ? '' : subheadingValue;
  const showHeader = config.showHeader !== false && !(heading === '' && subheading === '');

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductsContainer
          showSidebar={config.showSidebar}
          stickySidebar={config.stickySidebar}
          pageSize={config.pageSize}
          gridColumns={config.gridColumns}
          showSort={config.showSort}
          showHeader={showHeader}
          heading={heading}
          subheading={subheading}
        />
      </div>
    </section>
  );
};

export default ProductListSection;
