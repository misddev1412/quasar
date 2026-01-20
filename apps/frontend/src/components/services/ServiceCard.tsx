'use client';

import React from 'react';
import Link from 'next/link';
import { Image, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Service } from '../../types/service';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

interface ServiceCardProps {
    service: Service;
    className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, className = '' }) => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language.split('-')[0];
    const { formatCurrency } = useCurrencyFormatter();

    // Helper to get translated content
    const getTranslation = (field: 'name' | 'description' | 'content') => {
        const translation = service.translations.find(t => t.locale === currentLocale) ||
            service.translations.find(t => t.locale === 'en'); // Fallback to EN
        return translation ? translation[field] : '';
    };

    const name = getTranslation('name') || t('services.common.unnamedService', 'Unnamed Service');
    const description = getTranslation('description');

    // Truncate description
    const shortDescription = description && description.length > 100
        ? `${description.substring(0, 100)}...`
        : description;

    return (
        <div className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full ${className}`}>
            {/* Thumbnail */}
            <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-900">
                <Link href={`/services/${service.id}`}>
                    <Image
                        src={service.thumbnail || '/placeholder-service.jpg'}
                        alt={name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        removeWrapper
                    />
                </Link>
                {service.isContactPrice && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        {t('services.common.contactForPrice', 'Contact for Price')}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <Link href={`/services/${service.id}`} className="block mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {name}
                    </h3>
                </Link>

                {shortDescription && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                        {shortDescription}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{t('services.common.price', 'Price')}</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {service.isContactPrice
                                ? t('services.common.contactUs', 'Contact Us')
                                : formatCurrency(service.unitPrice)}
                        </span>
                    </div>

                    <Button
                        as={Link}
                        href={`/services/${service.id}`}
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium px-4 rounded-lg hover:opacity-90 transition-opacity"
                        size="sm"
                    >
                        {t('services.common.viewDetails', 'View Details')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
