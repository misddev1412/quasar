import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FiPlus,
    FiMoreVertical,
    FiEdit2,
    FiRefreshCw,
    FiEye,
    FiFileText,
    FiTruck,
    FiCheckCircle,
} from 'react-icons/fi';
import {
    Button,
    Card,
    Dropdown,
    StandardListPage,
    Table,
} from '@admin/components/common';
import type { Column, SortDescriptor } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import type { PurchaseOrder, PurchaseOrderFiltersType } from '@admin/types/purchase-order';
import { PurchaseOrderStatus } from '@admin/types/purchase-order';

const PurchaseOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();

    const [filters, setFilters] = useState<PurchaseOrderFiltersType>({});

    const pageParam = Number(searchParams.get('page'));
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = 20;

    const { data: response, isLoading, refetch } = trpc.adminPurchaseOrders.list.useQuery({
        status: filters.status,
        supplierId: filters.supplierId,
        warehouseId: filters.warehouseId,
    });

    const orders = useMemo(() => {
        return (response as any)?.data || [];
    }, [response]);

    const handleCreate = () => navigate('/purchase-orders/create');

    const getStatusColor = (status: PurchaseOrderStatus) => {
        switch (status) {
            case PurchaseOrderStatus.DRAFT: return 'bg-gray-100 text-gray-800';
            case PurchaseOrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case PurchaseOrderStatus.APPROVED: return 'bg-blue-100 text-blue-800';
            case PurchaseOrderStatus.ORDERED: return 'bg-indigo-100 text-indigo-800';
            case PurchaseOrderStatus.RECEIVED: return 'bg-green-100 text-green-800';
            case PurchaseOrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns: Column<PurchaseOrder>[] = useMemo(() => [
        {
            id: 'orderNumber',
            header: t('purchase_orders.order_number', 'Order #'),
            accessor: 'orderNumber',
            render: (value) => <span className="font-medium text-blue-600">{value as string}</span>,
            isSortable: true,
        },
        {
            id: 'supplier',
            header: t('purchase_orders.supplier', 'Supplier'),
            accessor: (order) => (order as any).supplier?.name || t('common.unknown', 'Unknown'),
        },
        {
            id: 'orderDate',
            header: t('purchase_orders.order_date', 'Order Date'),
            accessor: 'orderDate',
            render: (value) => new Date(value as string).toLocaleDateString(),
        },
        {
            id: 'totalAmount',
            header: t('purchase_orders.total_amount', 'Total'),
            accessor: 'totalAmount',
            render: (value) => `$${Number(value).toLocaleString()}`,
            align: 'right',
        },
        {
            id: 'status',
            header: t('purchase_orders.status', 'Status'),
            accessor: 'status',
            render: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value as PurchaseOrderStatus)}`}>
                    {value as string}
                </span>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions', 'Actions'),
            accessor: (order) => (
                <Dropdown
                    button={
                        <Button variant="ghost" size="sm">
                            <FiMoreVertical className="w-4 h-4" />
                        </Button>
                    }
                    items={[
                        {
                            label: t('common.view', 'View'),
                            icon: <FiEye />,
                            onClick: () => navigate(`/purchase-orders/${order.id}`),
                        },
                        {
                            label: t('common.edit', 'Edit'),
                            icon: <FiEdit2 />,
                            onClick: () => navigate(`/purchase-orders/${order.id}/edit`),
                            disabled: status !== PurchaseOrderStatus.DRAFT && status !== PurchaseOrderStatus.PENDING,
                        },
                    ]}
                />
            ),
        },
    ], [t, navigate]);

    return (
        <StandardListPage
            title={t('purchase_orders.title', 'Purchase Orders')}
            description={t('purchase_orders.description', 'Manage procurement and supply orders')}
            actions={[
                {
                    label: t('purchase_orders.create', 'Create Order'),
                    onClick: handleCreate,
                    primary: true,
                    icon: <FiPlus className="w-4 h-4" />,
                },
                {
                    label: t('common.refresh', 'Refresh'),
                    onClick: () => refetch(),
                    icon: <FiRefreshCw className="w-4 h-4" />,
                }
            ]}
            fullWidth
        >
            <Card>
                <Table<PurchaseOrder>
                    tableId="purchase-orders-table"
                    columns={columns}
                    data={orders}
                    isLoading={isLoading}
                    emptyMessage={t('purchase_orders.empty', 'No purchase orders found')}
                />
            </Card>
        </StandardListPage>
    );
};

export default PurchaseOrdersPage;
