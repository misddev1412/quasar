import React from 'react';
import { SectionTranslation } from '../../types/sections';
import { SectionContainer } from './SectionContainer';

export interface NewsDetailsConfig { }

interface NewsDetailsSectionProps {
    config: NewsDetailsConfig;
    translation?: SectionTranslation;
}

export const NewsDetailsSection: React.FC<NewsDetailsSectionProps> = ({
    config,
    translation,
}) => {
    return (
        <SectionContainer>
            <div className="py-12 text-center">
                <h2 className="text-2xl font-bold">{translation?.title || 'News Details'}</h2>
                <p className="text-gray-500">Coming Soon</p>
            </div>
        </SectionContainer>
    );
};
