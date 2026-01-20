'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import ServiceCard from './ServiceCard';
import { Pagination } from '@heroui/react';
import { Spinner } from '@heroui/react';

interface ServicesContainerProps {
    serviceIds?: string[];
}

const ServicesContainer: React.FC<ServicesContainerProps> = ({ serviceIds }) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const limit = 12;

    const { data, isLoading, error } = trpc.clientServices.getServices.useQuery({
        page,
        limit,
        ids: serviceIds,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spinner size="lg" color="primary" label={t('common.loading', 'Loading...')} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>{t('services.error.failedToLoad', 'Failed to load services.')}</p>
                <p className="text-sm mt-2">{error.message}</p>
            </div>
        );
    }

    const services = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    return (
        <div className="space-y-8">
            {services.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t('services.list.noServices', 'No services available at the moment.')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-10">
                    <Pagination
                        total={pagination.totalPages}
                        page={page}
                        onChange={setPage}
                        showControls
                        color="primary"
                        variant="flat"
                    />
                </div>
            )}
        </div>
    );
};

export default ServicesContainer;
