import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiPrinter, FiSend, FiPackage, FiTruck, FiCornerDownRight } from 'react-icons/fi';
import {
    Button,
    Card,
    StandardListPage,
    Loading,
    Alert,
    AlertDescription,
    Table,
} from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import type { PurchaseOrder, PurchaseOrderItem } from '@admin/types/purchase-order';
import { PurchaseOrderStatus } from '@admin/types/purchase-order';

const PurchaseOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();

    const { data: response, isLoading, refetch } = trpc.adminPurchaseOrders.detail.useQuery({ id: id! });
    const order = (response as any)?.data as PurchaseOrder;

    const approveMutation = trpc.adminPurchaseOrders.approve.useMutation({
        onSuccess: () => {
            addToast({ type: 'success', title: t('purchase_orders.approved', 'Order approved') });
            refetch();
        },
    });

    const sendMutation = trpc.adminPurchaseOrders.send.useMutation({
        onSuccess: () => {
            addToast({ type: 'success', title: t('purchase_orders.sent', 'Order marked as ordered') });
            refetch();
        },
    });

    const cancelMutation = trpc.adminPurchaseOrders.cancel.useMutation({
        onSuccess: () => {
            addToast({ type: 'success', title: t('purchase_orders.cancelled', 'Order cancelled') });
            refetch();
        },
    });

    if (isLoading) return <Loading fullPage />;
    if (!order) return <Alert variant="destructive"><AlertDescription>{t('purchase_orders.not_found', 'Order not found')}</AlertDescription></Alert>;
    const canApprove = order.status === PurchaseOrderStatus.PENDING;
    const canMarkOrdered = order.status === PurchaseOrderStatus.APPROVED;
    const canCancel = ![
        PurchaseOrderStatus.RECEIVED,
        PurchaseOrderStatus.CANCELLED,
        PurchaseOrderStatus.CLOSED,
    ].includes(order.status);

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

    return (
        <StandardListPage
            title={`${t('purchase_orders.order', 'Order')} ${order.orderNumber}`}
            description={t('purchase_orders.detail_desc', 'View and manage purchase order details')}
            actions={[
                ...(canApprove ? [{
                    label: t('common.approve', 'Approve'),
                    onClick: () => approveMutation.mutate({ id: order.id }),
                    icon: <FiCheck />,
                    primary: true,
                    disabled: approveMutation.isPending,
                }] : []),
                ...(canMarkOrdered ? [{
                    label: t('purchase_orders.mark_ordered', 'Mark as Ordered'),
                    onClick: () => sendMutation.mutate({ id: order.id }),
                    icon: <FiSend />,
                    disabled: sendMutation.isPending,
                }] : []),
                ...(canCancel ? [{
                    label: t('common.cancel', 'Cancel Order'),
                    onClick: () => cancelMutation.mutate({ id: order.id }),
                    icon: <FiX />,
                    disabled: cancelMutation.isPending,
                }] : []),
            ]}
            fullWidth
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">{t('purchase_orders.items', 'Items')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-gray-500">
                                        <th className="py-2 font-medium">{t('common.product', 'Product')}</th>
                                        <th className="py-2 font-medium text-right">{t('common.quantity', 'Qty')}</th>
                                        <th className="py-2 font-medium text-right">{t('common.unit_cost', 'Unit Cost')}</th>
                                        <th className="py-2 font-medium text-right">{t('common.total', 'Total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-3">
                                                <div className="font-medium text-gray-900">{item.productVariant?.name || item.productVariantId}</div>
                                                <div className="text-xs text-gray-500">SKU: {item.productVariant?.sku || '-'}</div>
                                            </td>
                                            <td className="py-3 text-right">{item.quantityOrdered}</td>
                                            <td className="py-3 text-right">${Number(item.unitCost).toLocaleString()}</td>
                                            <td className="py-3 text-right font-medium">${(item.quantityOrdered * item.unitCost).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t">
                                        <td colSpan={3} className="py-4 text-right font-bold text-lg">{t('common.total', 'Total')}</td>
                                        <td className="py-4 text-right font-bold text-lg text-blue-600">${Number(order.totalAmount).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>

                    {order.notes && (
                        <Card className="p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('common.notes', 'Notes')}</h3>
                            <p className="text-gray-700">{order.notes}</p>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('purchase_orders.summary', 'Order Summary')}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('purchase_orders.status', 'Status')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('purchase_orders.order_date', 'Order Date')}</span>
                                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>
                            {order.expectedDeliveryDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('purchase_orders.expected_delivery', 'Expected')}</span>
                                    <span>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('purchase_orders.supplier_info', 'Supplier')}</h3>
                        <div className="space-y-2">
                            <div className="font-semibold text-blue-600">{(order as any).supplier?.name}</div>
                            <div className="text-sm">{(order as any).supplier?.email}</div>
                            <div className="text-sm">{(order as any).supplier?.phone}</div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('purchase_orders.destination', 'Destination')}</h3>
                        <div className="space-y-2">
                            <div className="font-semibold">{(order as any).warehouse?.name}</div>
                            <div className="text-sm text-gray-500">{(order as any).warehouse?.code}</div>
                        </div>
                    </Card>
                </div>
            </div>
        </StandardListPage>
    );
};

export default PurchaseOrderDetailPage;
