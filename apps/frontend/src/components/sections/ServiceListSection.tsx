'use client';

import React from 'react';
import ServicesContainer from '../services/ServicesContainer';
import SectionContainer from './SectionContainer';
import type { SectionTranslationContent } from './HeroSlider';

export interface ServiceListSectionConfig {
    serviceIds?: string[];
    showHeader?: boolean;
}

interface ServiceListSectionProps {
    config: ServiceListSectionConfig;
    translation?: SectionTranslationContent | null;
}

export const ServiceListSection: React.FC<ServiceListSectionProps> = ({ config, translation }) => {
    const heading = translation?.title === null ? '' : translation?.title;
    const subtitleHidden = translation?.subtitle === null;
    const descriptionHidden = translation?.description === null;
    const subheadingValue = translation?.subtitle ?? translation?.description;
    const subheading = subtitleHidden && descriptionHidden ? '' : subheadingValue;
    const showHeader = config.showHeader !== false && !(heading === '' && subheading === '');

    // If no specific IDs are selected, pass undefined to show all (implied empty array in backend filter check?)
    // Actually, backend checks `if (ids && ids.length > 0)`.
    // So if config.serviceIds is empty/undefined, it shows ALL services, which is desired default behavior.

    return (
        <section className="py-12 lg:py-16">
            <SectionContainer>
                {showHeader && (
                    <div className="mb-10 text-center max-w-3xl mx-auto">
                        {heading && (
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                                {heading}
                            </h2>
                        )}
                        {subheading && (
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                {subheading}
                            </p>
                        )}
                    </div>
                )}
                <ServicesContainer serviceIds={config.serviceIds} />
            </SectionContainer>
        </section>
    );
};

export default ServiceListSection;
