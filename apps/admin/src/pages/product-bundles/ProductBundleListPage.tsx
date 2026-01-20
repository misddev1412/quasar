import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../services/api';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BaseLayout from '../../components/layout/BaseLayout';
import { format } from 'date-fns';
import { Table, Column } from '../../components/common/Table';

const ProductBundleListPage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Query bundles
    const { data, isLoading, refetch } = (trpc as any).productBundles.list.useQuery({
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    // Delete mutation
    const deleteMutation = (trpc as any).productBundles.delete.useMutation({
        onSuccess: () => {
            refetch();
        },
    });

    const handleDelete = async (id: string) => {
        if (window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this item?'))) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    const columns: Column<any>[] = [
        { id: 'name', header: t('common.name', 'Name'), accessor: 'name' },
        { id: 'slug', header: t('common.slug', 'Slug'), accessor: 'slug' },
        {
            id: 'isActive',
            header: t('common.status', 'Status'),
            accessor: (row) => (
                <Chip
                    label={row.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    color={row.isActive ? 'success' : 'default'}
                    size="small"
                />
            ),
        },
        {
            id: 'items',
            header: t('product_bundles.items_count', 'Items'),
            accessor: (row) => row.items?.length || 0
        },
        {
            id: 'updatedAt',
            header: t('common.updatedAt', 'Updated At'),
            accessor: (row) => row.updatedAt ? format(new Date(row.updatedAt), 'yyyy-MM-dd HH:mm') : '',
        },
        {
            id: 'actions',
            header: t('common.actions', 'Actions'),
            accessor: (row) => (
                <Box>
                    <Tooltip title={t('common.edit', 'Edit')}>
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/product-bundles/${row.id}/edit`)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete', 'Delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <BaseLayout title={t('product_bundles.title', 'Product Bundles')}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/product-bundles/create')}
                >
                    {t('common.create', 'Create')}
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <Table
                        data={data?.items || []}
                        columns={columns}
                        isLoading={isLoading}
                        pagination={{
                            currentPage: page,
                            totalPages: Math.ceil((data?.total || 0) / pageSize),
                            totalItems: data?.total || 0,
                            itemsPerPage: pageSize,
                            onPageChange: setPage,
                            onItemsPerPageChange: setPageSize
                        }}
                    />
                </CardContent>
            </Card>
        </BaseLayout>
    );
};

export default ProductBundleListPage;
