import React, { useMemo, useCallback } from 'react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import { FiHome } from 'react-icons/fi';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import BaseLayout from '../layout/BaseLayout';
import { trpc } from '../../utils/trpc';
import { useDefaultCurrency } from '../../hooks/useDefaultCurrency';

export const StaffDashboard: React.FC = () => {
    const { t } = useTranslationWithBackend();
    // We still fetch stats for recent orders, but we won't show financial aggregates if not needed
    // Optimization: In a real scenario, we might want a dedicated API that returns only what's needed.
    // For now, we reuse the existing endpoint but only use the safe parts.
    const { data: orderStatsResponse } = trpc.adminOrders.stats.useQuery();
    const orderStats = (orderStatsResponse as any)?.data;

    const { defaultCurrency } = useDefaultCurrency();
    const displayCurrencyCode = defaultCurrency.code;
    const preciseFractionDigits = Math.max(0, defaultCurrency.decimalPlaces);

    const currencyFormatter = useMemo(() => new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: displayCurrencyCode,
        maximumFractionDigits: 0,
    }), [displayCurrencyCode]);

    const preciseCurrencyFormatter = useMemo(() => new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: displayCurrencyCode,
        minimumFractionDigits: preciseFractionDigits,
        maximumFractionDigits: preciseFractionDigits,
    }), [displayCurrencyCode, preciseFractionDigits]);

    const formatCurrencyValue = useCallback((value?: number | null, precise = false) => {
        const formatter = precise ? preciseCurrencyFormatter : currencyFormatter;
        return formatter.format(value ?? 0);
    }, [currencyFormatter, preciseCurrencyFormatter]);


    const recentOrders = useMemo(() => {
        if (!orderStats?.recentOrdersList) return [];
        return orderStats.recentOrdersList.slice(0, 10); // Show more orders for staff since charts are gone
    }, [orderStats]);

    const quickActions = useMemo(() => ([
        {
            icon: <AddShoppingCartIcon className="mr-3 text-blue-600" />,
            label: t('dashboard.actions.create_order'),
            description: t('dashboard.actions.create_order_description'),
        },
        {
            icon: <StorefrontIcon className="mr-3 text-emerald-600" />,
            label: t('dashboard.actions.add_product'),
            description: t('dashboard.actions.add_product_description'),
        },
        // Removing Campaign action for staff if deemed "management" level, but keeping it simple for now based on Plan.
        // Let's keep it as per the "Staff/Manager" request.
        {
            icon: <CampaignIcon className="mr-3 text-purple-600" />,
            label: t('dashboard.actions.launch_campaign'),
            description: t('dashboard.actions.launch_campaign_description'),
        },
    ]), [t]);

    const renderStatusBadgeClasses = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-50 text-emerald-700';
            case 'SHIPPED':
                return 'bg-blue-50 text-blue-700';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <BaseLayout
            title={t('dashboard.title')}
            description={t('dashboard.welcome_back')}
            breadcrumbs={[
                {
                    label: t('navigation.dashboard', 'Dashboard'),
                    icon: <FiHome className="h-4 w-4" />,
                }
            ]}
        >
            <div className="space-y-6">
                {/* Quick actions only */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map(action => (
                        <button
                            key={action.label}
                            className="w-full text-left p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-100 transition-colors flex flex-row items-center justify-start gap-4"
                        >
                            <div className="p-2 bg-gray-50 rounded-full">
                                {action.icon}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{action.label}</p>
                                <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Recent orders - Expanded view for operations */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                        <h2 className="text-lg font-medium mb-4">{t('dashboard.sections.recent_orders')}</h2>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {recentOrders.map((order: any) => (
                                    <div key={order.id || order.orderNumber} className="flex items-center justify-between border border-gray-100 hover:bg-gray-50 transition-colors rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                            <div>
                                                <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                                                <p className="text-sm text-gray-500">{order.customerName || order.customerEmail}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <p className="text-sm text-gray-500">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</p>
                                            </div>
                                            <div className="text-left md:text-right flex flex-row md:flex-col justify-between items-center md:justify-center md:items-end">
                                                <p className="font-semibold text-gray-900">{formatCurrencyValue(Number(order.totalAmount) || 0, true)}</p>
                                                <span className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium ${renderStatusBadgeClasses(order.status)}`}>
                                                    {t(`orders.status_types.${order.status}`, order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-gray-500">
                                {t('dashboard.messages.no_recent_orders')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};
