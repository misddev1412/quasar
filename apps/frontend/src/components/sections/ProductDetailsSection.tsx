import React from 'react';
import { SectionTranslation } from '../../types/sections';
import { SectionContainer } from './SectionContainer';

export interface ProductDetailsConfig { }

interface ProductDetailsSectionProps {
    config: ProductDetailsConfig;
    translation?: SectionTranslation;
}

export const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
    config,
    translation,
}) => {
    return (
        <SectionContainer>
            <div className="py-12 text-center">
                <h2 className="text-2xl font-bold">{translation?.title || 'Product Details'}</h2>
                <p className="text-gray-500">Coming Soon</p>
            </div>
        </SectionContainer>
    );
};
