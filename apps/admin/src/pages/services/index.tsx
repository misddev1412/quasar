import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, Column } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';

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
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    // Fetch services
    const servicesQuery = trpc.services.getServices.useQuery({
        page,
        limit,
        search: search || undefined,
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

    if (servicesQuery.isLoading) return <Loading />;
    if (servicesQuery.error) {
        return (
            <BaseLayout title={t('services.title', 'Services')} actions={actions}>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{servicesQuery.error.message}</AlertDescription>
                </Alert>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout
            title={t('services.title', 'Services')}
            description={t('services.description', 'Manage your services list')}
            actions={actions}
        >
            <Table<Service>
                columns={columns}
                data={services}
                searchValue={search}
                onSearchChange={setSearch}
                pagination={{
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    onPageChange: setPage,
                    onItemsPerPageChange: (newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                    }
                }}
            />
        </BaseLayout>
    );
};

export default ServiceListPage;
