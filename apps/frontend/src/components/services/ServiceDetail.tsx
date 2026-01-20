'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Spinner, Button, Image } from '@heroui/react';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';
import Link from 'next/link';

interface ServiceDetailProps {
    id: string;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ id }) => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language.split('-')[0];
    const { formatCurrency } = useCurrencyFormatter();

    const { data, isLoading, error } = trpc.clientServices.getServiceById.useQuery({ id });

    const service = data?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Spinner size="lg" color="primary" label={t('common.loading', 'Loading...')} />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="text-center py-20 text-red-500 min-h-[50vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-2">{t('services.error.notFound', 'Service Not Found')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('services.error.notFoundDesc', 'The service you are looking for does not exist or has been removed.')}</p>
                <Button as={Link} href="/services" color="primary">
                    {t('services.common.backToServices', 'Back to Services')}
                </Button>
            </div>
        );
    }

    const getTranslation = (field: 'name' | 'description' | 'content') => {
        const translation = service.translations.find(t => t.locale === currentLocale) ||
            service.translations.find(t => t.locale === 'en');
        return translation ? translation[field] : '';
    };

    const name = getTranslation('name') || t('services.common.unnamedService', 'Unnamed Service');
    const description = getTranslation('description');
    const content = getTranslation('content');

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-64 sm:h-96 lg:h-auto bg-gray-100 dark:bg-gray-800">
                    <Image
                        src={service.thumbnail || '/placeholder-service.jpg'}
                        alt={name}
                        className="w-full h-full object-cover rounded-none"
                        removeWrapper
                    />
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {name}
                    </h1>

                    <div className="mb-6">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {service.isContactPrice
                                ? t('services.common.contactUs', 'Contact Us')
                                : formatCurrency(service.unitPrice)}
                        </span>
                        {!service.isContactPrice && (
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">/ {t('services.common.perSession', 'per session')}</span>
                        )}
                    </div>

                    {description && (
                        <div className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                            {description}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            as={Link}
                            href="/contact"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transform transition hover:scale-105"
                            size="lg"
                        >
                            {t('services.common.bookNow', 'Inquire Now')}
                        </Button>
                        <Button
                            as={Link}
                            href="/services"
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-3 px-8 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            size="lg"
                            variant="flat"
                        >
                            {t('services.common.backToList', 'Back to List')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Rich Content / Details Section */}
            {content && (
                <div className="p-8 lg:p-12 border-t border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('services.common.serviceDetails', 'Service Details')}
                    </h2>
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            )}

            {/* Service Items List (e.g. tiers or sub-options) */}
            {service.items && service.items.length > 0 && (
                <div className="p-8 lg:p-12 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('services.common.pricingOptions', 'Pricing Options')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {service.items.map((item) => {
                            const itemTranslation = item.translations.find(t => t.locale === currentLocale) || item.translations.find(t => t.locale === 'en');
                            const itemName = itemTranslation?.name || t('services.common.unnamedOption', 'Option');
                            const itemDesc = itemTranslation?.description;

                            return (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{itemName}</h3>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {item.price ? formatCurrency(item.price) : t('services.common.included', 'Included')}
                                        </span>
                                    </div>
                                    {itemDesc && (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{itemDesc}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceDetail;
