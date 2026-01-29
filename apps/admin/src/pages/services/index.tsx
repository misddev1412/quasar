import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiRefreshCw, FiActivity, FiXCircle, FiList, FiTag } from 'react-icons/fi';
import { Button, Card, Dropdown, Select, StatisticsGrid, Table, StandardListPage, Loading, Alert, AlertDescription, AlertTitle } from '../../components/common';
import type { StatisticData, Column } from '../../components/common';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';

// Temporary interface until backend types are synced
interface Service {
    id: string;
    unitPrice: number;
    isContactPrice: boolean;
    thumbnail?: string;
    isActive: boolean;
    currency?: {
        code: string;
        symbol: string;
    };
    translations: {
        locale: string;
        name: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

const ServiceListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const [showFilters, setShowFilters] = useState(false);

    const parseNumberParam = (value: string | null, fallback: number): number => {
        const parsed = value ? parseInt(value, 10) : NaN;
        if (Number.isNaN(parsed) || parsed <= 0) return fallback;
        return parsed;
    };

    const page = parseNumberParam(searchParams.get('page'), 1);
    const limit = parseNumberParam(searchParams.get('limit'), 10);
    const searchValue = searchParams.get('search') || '';
    const statusParam = searchParams.get('isActive');
    const isActiveFilter = statusParam === 'true' ? true : statusParam === 'false' ? false : undefined;

    useEffect(() => {
        if (isActiveFilter !== undefined && !showFilters) {
            setShowFilters(true);
        }
    }, [isActiveFilter, showFilters]);

    const updateQueryParams = useCallback((updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    }, [searchParams, setSearchParams]);

    // Fetch services
    const servicesQuery = trpc.services.getServices.useQuery({
        page,
        limit,
        search: searchValue || undefined,
        isActive: isActiveFilter,
    });

    const deleteMutation = trpc.services.deleteService.useMutation({
        onSuccess: () => {
            addToast({ title: t('services.delete_success', 'Service deleted successfully'), type: 'success' });
            servicesQuery.refetch();
        },
        onError: (error) => {
            addToast({ title: error.message || 'Failed to delete service', type: 'error' });
        }
    });

    const handleDelete = async (id: string) => {
        if (!confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) return;
        deleteMutation.mutate({ id });
    };

    const services = (servicesQuery.data as any)?.data?.items || [];
    const total = (servicesQuery.data as any)?.data?.total || 0;
    const totalPages = (servicesQuery.data as any)?.data?.totalPages || 0;
    const activeCount = services.filter((service: Service) => service.isActive).length;
    const inactiveCount = services.length - activeCount;
    const contactPriceCount = services.filter((service: Service) => service.isContactPrice).length;

    const statisticsCards: StatisticData[] = useMemo(() => ([
        {
            id: 'services-total',
            title: t('services.stats.total', 'Total Services'),
            value: total.toString(),
            icon: <FiList className="w-5 h-5" />,
            enableChart: false,
        },
        {
            id: 'services-active',
            title: t('services.stats.active', 'Active'),
            value: activeCount.toString(),
            icon: <FiActivity className="w-5 h-5" />,
            enableChart: false,
        },
        {
            id: 'services-inactive',
            title: t('services.stats.inactive', 'Inactive'),
            value: inactiveCount.toString(),
            icon: <FiXCircle className="w-5 h-5" />,
            enableChart: false,
        },
        {
            id: 'services-contact-price',
            title: t('services.stats.contact_price', 'Contact Price'),
            value: contactPriceCount.toString(),
            icon: <FiTag className="w-5 h-5" />,
            enableChart: false,
        },
    ]), [activeCount, contactPriceCount, inactiveCount, t, total]);

    const columns: Column<Service>[] = useMemo(() => [
        {
            id: 'thumbnail',
            header: t('services.thumbnail', 'Image'),
            accessor: (item) => (
                item.thumbnail ? (
                    <img src={item.thumbnail} alt="thumbnail" className="w-10 h-10 object-cover rounded" />
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        No Img
                    </div>
                )
            ),
            isSortable: false,
        },
        {
            id: 'name',
            header: t('services.name', 'Translation'), // Using 'Translation' temporarily or specific key
            accessor: (item) => {
                // Fallback to first translation or specific locale logic (frontend usually handles locale)
                return item.translations?.[0]?.name || 'Untitled';
            },
            isSortable: true,
        },
        {
            id: 'price',
            header: t('services.price', 'Price'),
            accessor: (item) => (
                item.isContactPrice
                    ? <span className="text-gray-500 italic">{t('services.contact_price', 'Contact Price')}</span>
                    : <span>{item.unitPrice} {item.currency?.symbol}</span>
            ),
            isSortable: true,
        },
        {
            id: 'isActive',
            header: t('common.status', 'Status'),
            accessor: (item) => (
                <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </span>
            ),
            isSortable: true
        },
        {
            id: 'actions',
            header: t('common.actions', 'Actions'),
            width: '80px',
            accessor: (item) => (
                <Dropdown
                    button={
                        <Button variant="ghost" size="sm">
                            <FiMoreVertical className="w-4 h-4" />
                        </Button>
                    }
                    items={[
                        {
                            label: t('common.edit', 'Edit'),
                            icon: <FiEdit2 className="w-4 h-4" />,
                            onClick: () => navigate(`/services/${item.id}/edit`),
                        },
                        {
                            label: t('common.delete', 'Delete'),
                            icon: <FiTrash2 className="w-4 h-4" />,
                            onClick: () => handleDelete(item.id),
                            className: 'text-red-600',
                        },
                    ]}
                />
            ),
        },
    ], [navigate, t]);

    const actions = [
        {
            label: t('services.create', 'Create Service'),
            onClick: () => navigate('/services/create'),
            primary: true,
            icon: <FiPlus />,
        },
        {
            label: t('common.refresh', 'Refresh'),
            onClick: () => servicesQuery.refetch(),
            icon: <FiRefreshCw />,
        },
    ];

    const handleSearchChange = useCallback((value: string) => {
        updateQueryParams({
            search: value ? value : undefined,
            page: '1',
        });
    }, [updateQueryParams]);

    const handleStatusFilterChange = useCallback((value: string) => {
        updateQueryParams({
            isActive: value === 'all' ? undefined : value,
            page: '1',
        });
    }, [updateQueryParams]);

    const handleResetFilters = useCallback(() => {
        updateQueryParams({
            isActive: undefined,
            page: '1',
        });
    }, [updateQueryParams]);

    const handlePageChange = useCallback((nextPage: number) => {
        updateQueryParams({ page: nextPage.toString() });
    }, [updateQueryParams]);

    const handleItemsPerPageChange = useCallback((newLimit: number) => {
        updateQueryParams({
            limit: newLimit.toString(),
            page: '1',
        });
    }, [updateQueryParams]);

    if (servicesQuery.isLoading) {
        return (
            <StandardListPage
                title={t('services.title', 'Services')}
                description={t('services.description', 'Manage your services list')}
                actions={actions}
                fullWidth
            >
                <div className="flex items-center justify-center h-64">
                    <Loading />
                </div>
            </StandardListPage>
        );
    }
    if (servicesQuery.error) {
        return (
            <StandardListPage
                title={t('services.title', 'Services')}
                description={t('services.description', 'Manage your services list')}
                actions={actions}
                fullWidth
            >
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{servicesQuery.error.message}</AlertDescription>
                </Alert>
            </StandardListPage>
        );
    }

    return (
        <StandardListPage
            title={t('services.title', 'Services')}
            description={t('services.description', 'Manage your services list')}
            actions={actions}
            fullWidth
        >
            <div className="space-y-6">
                <StatisticsGrid
                    statistics={statisticsCards}
                    isLoading={servicesQuery.isFetching}
                    skeletonCount={4}
                />

                {showFilters && (
                    <Card>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                label={t('services.filters.status', 'Status')}
                                value={statusParam ?? 'all'}
                                onChange={handleStatusFilterChange}
                                options={[
                                    { value: 'all', label: t('services.filters.all', 'All statuses') },
                                    { value: 'true', label: t('common.active', 'Active') },
                                    { value: 'false', label: t('common.inactive', 'Inactive') },
                                ]}
                            />
                        </div>
                        <div className="mt-4 flex flex-wrap justify-end gap-3">
                            <Button variant="secondary" onClick={handleResetFilters}>
                                {t('common.reset_filters', 'Reset Filters')}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowFilters(false)}>
                                {t('common.hide_filters', 'Hide Filters')}
                            </Button>
                        </div>
                    </Card>
                )}

                <Table<Service>
                    tableId="services-table"
                    columns={columns}
                    data={services}
                    isLoading={servicesQuery.isFetching}
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onFilterClick={() => setShowFilters(!showFilters)}
                    isFilterActive={showFilters}
                    searchPlaceholder={t('services.search_placeholder', 'Search services...')}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages,
                        totalItems: total,
                        itemsPerPage: limit,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                />
            </div>
        </StandardListPage>
    );
};

export default ServiceListPage;
