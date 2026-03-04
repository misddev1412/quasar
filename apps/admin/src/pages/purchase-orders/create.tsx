import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { FiShoppingBag } from 'react-icons/fi';
import {
    Button,
    Card,
    StandardFormPage,
    Alert,
    AlertDescription,
} from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useAdminCurrencyFormatter } from '@admin/hooks/useAdminCurrencyFormatter';

const CreatePurchaseOrderPage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { formatCurrency } = useAdminCurrencyFormatter();

    const [supplierId, setSupplierId] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<{ productVariantId: string; quantityOrdered: number; unitCost: number }[]>([]);

    // Fetch suppliers and warehouses for dropdowns
    const { data: suppliersData } = trpc.adminSuppliers.getAll.useQuery({ page: 1, limit: 100 });
    const { data: warehousesData } = trpc.adminWarehouses.getAll.useQuery();
    const { data: productsData } = trpc.adminProducts.list.useQuery({ limit: 100 });

    const createMutation = trpc.adminPurchaseOrders.create.useMutation({
        onSuccess: () => {
            addToast({ type: 'success', title: t('purchase_orders.created', 'Order created successfully') });
            navigate('/purchase-orders');
        },
        onError: (error) => {
            addToast({ type: 'error', title: t('common.error', 'Error'), description: error.message });
        },
    });

    const handleAddItem = () => {
        setItems([...items, { productVariantId: '', quantityOrdered: 1, unitCost: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || !warehouseId || items.length === 0) {
            addToast({ type: 'error', title: t('common.validation_error', 'Please fill all required fields') });
            return;
        }

        createMutation.mutate({
            supplierId,
            warehouseId,
            notes,
            items: items.map(item => ({
                productVariantId: item.productVariantId,
                quantityOrdered: Number(item.quantityOrdered),
                unitCost: Number(item.unitCost),
            })),
        });
    };

    const suppliers = (suppliersData as any)?.data?.items || [];
    const warehouses = (warehousesData as any)?.data || [];
    const products = (productsData as any)?.data?.items || [];

    return (
        <StandardFormPage
            title={t('purchase_orders.create_title', 'Create Purchase Order')}
            description={t('purchase_orders.create_desc', 'Create a new purchase order for your suppliers')}
            icon={<FiShoppingBag className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
            entityName={t('purchase_orders.order', 'Purchase Order')}
            entityNamePlural={t('purchase_orders.title', 'Purchase Orders')}
            backUrl="/purchase-orders"
            onBack={() => navigate('/purchase-orders')}
            isSubmitting={createMutation.isPending}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('purchase_orders.supplier', 'Supplier')} *
                            </label>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                required
                            >
                                <option value="">{t('common.select_supplier', 'Select Supplier')}</option>
                                {suppliers.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('purchase_orders.warehouse', 'Destination Warehouse')} *
                            </label>
                            <select
                                value={warehouseId}
                                onChange={(e) => setWarehouseId(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                required
                            >
                                <option value="">{t('common.select_warehouse', 'Select Warehouse')}</option>
                                {warehouses.map((w: any) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('common.notes', 'Notes')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                            rows={3}
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{t('purchase_orders.items', 'Order Items')}</h3>
                        <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
                            <FiPlus className="mr-2" /> {t('common.add_item', 'Add Item')}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-wrap gap-4 items-end border-b pb-4 dark:border-gray-700">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-xs text-gray-500 mb-1">{t('common.product', 'Product')}</label>
                                    <select
                                        value={item.productVariantId}
                                        onChange={(e) => handleItemChange(index, 'productVariantId', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        required
                                    >
                                        <option value="">{t('common.select_product', 'Select Product')}</option>
                                        {products.map((p: any) => (
                                            p.variants?.map((v: any) => (
                                                <option key={v.id} value={v.id}>{p.name} - {v.name || v.sku}</option>
                                            ))
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs text-gray-500 mb-1">{t('common.quantity', 'Qty')}</label>
                                    <input
                                        type="number"
                                        value={item.quantityOrdered}
                                        onChange={(e) => handleItemChange(index, 'quantityOrdered', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs text-gray-500 mb-1">{t('common.unit_cost', 'Unit Cost')}</label>
                                    <input
                                        type="number"
                                        value={item.unitCost}
                                        onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs text-gray-500 mb-1">{t('common.total', 'Total')}</label>
                                    <div className="py-2 font-medium">{formatCurrency(item.quantityOrdered * item.unitCost)}</div>
                                </div>
                                <Button type="button" onClick={() => handleRemoveItem(index)} variant="ghost" className="text-red-500">
                                    <FiTrash2 />
                                </Button>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="text-center py-8 text-gray-500">{t('purchase_orders.no_items', 'No items added yet.')}</div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="mt-6 flex justify-end text-xl font-bold">
                            {t('common.grand_total', 'Grand Total')}: {formatCurrency(items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0))}
                        </div>
                    )}
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" onClick={() => navigate('/purchase-orders')} variant="ghost">
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                        <FiSave className="mr-2" /> {t('common.save', 'Save Order')}
                    </Button>
                </div>
            </form>
        </StandardFormPage>
    );
};

export default CreatePurchaseOrderPage;
