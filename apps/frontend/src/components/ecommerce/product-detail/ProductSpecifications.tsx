import React from 'react';
import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';

import type { ProductSpecification } from '@frontend/types/product';

interface ProductSpecificationsProps {
    specificationItems: ProductSpecification[];
}

const typography = {
    subsectionTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
    meta: 'text-sm text-gray-500 dark:text-gray-400',
} as const;

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
    specificationItems,
}) => {
    const t = useTranslations('product.detail');

    const formatSpecificationLabel = (label: string) => {
        const withSpaces = label
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const normalized = withSpaces.toLocaleLowerCase('vi-VN');

        return normalized
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0).toLocaleUpperCase('vi-VN') + word.slice(1))
            .join(' ');
    };

    return (
        <Card className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
            <div className="space-y-2">
                <h4 className={typography.subsectionTitle}>{t('specifications.title')}</h4>
                <p className={typography.meta}>{t('specifications.subtitle')}</p>
            </div>

            {specificationItems.length > 0 ? (
                <div className="flex flex-col">
                    {specificationItems.map((spec, index) => (
                        <div
                            key={spec.id || spec.name}
                            className={`flex items-start justify-between gap-4 py-3 text-sm ${index !== specificationItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                                }`}
                        >
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {formatSpecificationLabel(spec.name)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-right">
                                {spec.value}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('specifications.empty')}</p>
            )}
        </Card>
    );
};
