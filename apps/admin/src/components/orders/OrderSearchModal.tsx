import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { FiSearch, FiRefreshCw, FiDollarSign, FiClock, FiUser, FiPackage } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { InputWithIcon } from '../common/InputWithIcon';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface OrderSummary {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  totalAmount?: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
  customerId?: string;
}

type PaymentFilter = 'ALL' | 'PENDING' | 'PAID';

interface OrderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: OrderSummary) => void;
  selectedOrderId?: string | null;
}

export const OrderSearchModal: React.FC<OrderSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  selectedOrderId,
}) => {
  const { t } = useTranslationWithBackend();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');

  useEffect(() => {
    if (!isOpen) {
      setSearchValue('');
      setDebouncedValue('');
      setPaymentFilter('ALL');
      return;
    }
    const handle = window.setTimeout(() => {
      setDebouncedValue(searchValue.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchValue, isOpen]);

  const listInput = useMemo(() => {
    const paymentStatus =
      paymentFilter === 'ALL'
        ? undefined
        : paymentFilter === 'PAID'
          ? 'PAID'
          : 'PENDING';

    return {
      page: 1,
      limit: 10,
      search: debouncedValue || undefined,
      paymentStatus: paymentStatus as 'PAID' | 'PENDING' | undefined,
    };
  }, [debouncedValue, paymentFilter]);

  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = trpc.adminOrders.list.useQuery(
    listInput,
    {
      enabled: isOpen,
      refetchOnWindowFocus: false,
    }
  );

  const orders = useMemo(() => {
    const payload = (ordersResponse as any)?.data;
    const normalize = (order: any): OrderSummary => ({
      ...order,
      customerId: order?.customerId ?? order?.customer?.id ?? order?.customer?.customerId,
      customerName: order?.customerName ?? order?.customer?.fullName ?? order?.customer?.name,
      customerEmail: order?.customerEmail ?? order?.customer?.email,
    });
    if (Array.isArray(payload?.items)) {
      return (payload.items as any[]).map(normalize);
    }
    if (Array.isArray(payload)) {
      return (payload as any[]).map(normalize);
    }
    return [];
  }, [ordersResponse]);

  const handleSelect = (order: OrderSummary) => {
    onSelectOrder(order);
    onClose();
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!Number.isFinite(Number(amount))) {
      return t('transactions.order_modal.amount_placeholder', '—');
    }
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD',
      }).format(Number(amount));
    } catch {
      return `${currency || 'USD'} ${Number(amount).toFixed(2)}`;
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  const filterButtons = [
    { value: 'ALL' as PaymentFilter, label: t('transactions.order_modal.filter_all', 'All orders') },
    { value: 'PENDING' as PaymentFilter, label: t('transactions.order_modal.filter_pending', 'Pending payment') },
    { value: 'PAID' as PaymentFilter, label: t('transactions.order_modal.filter_paid', 'Paid orders') },
  ];

  const renderOrder = (order: OrderSummary) => {
    const isSelected = order.id === selectedOrderId;
    return (
      <label
        key={order.id}
        className={clsx(
          'flex flex-col gap-4 rounded-2xl border bg-white px-4 py-4 text-left shadow-sm transition dark:bg-gray-800',
          isSelected
            ? 'border-primary-400 ring-1 ring-primary-100 dark:border-primary-500 dark:ring-primary-500/30'
            : 'border-gray-200 hover:border-primary-300 hover:shadow-md dark:border-gray-700',
        )}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="order-selection"
            checked={isSelected}
            onChange={() => handleSelect(order)}
            className="mt-1 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div className="flex w-full flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {order.orderNumber ? `#${order.orderNumber}` : order.id}
                </p>
                {order.customerName && (
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1">
                      <FiUser className="h-4 w-4 text-gray-400" />
                      {order.customerName}
                    </span>
                    {order.customerEmail ? ` • ${order.customerEmail}` : ''}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status && (
                  <Badge variant="info">
                    {t(`orders.status.${order.status.toLowerCase()}`, order.status)}
                  </Badge>
                )}
                {order.paymentStatus && (
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {t(`orders.payment_status.${order.paymentStatus.toLowerCase()}`, order.paymentStatus)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-4 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <FiPackage className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {t('transactions.order_modal.items_label', 'Order')}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {order.orderNumber ? `#${order.orderNumber}` : order.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {t('transactions.order_modal.amount_label', 'Amount')}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {t('transactions.order_modal.created_label', 'Created')}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </label>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="mb-4 flex flex-col gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('transactions.order_modal.title', 'Link an order')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('transactions.order_modal.description', 'Search existing orders and attach one to this transaction.')}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <InputWithIcon
            leftIcon={<FiSearch className="h-4 w-4 text-gray-400" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('transactions.order_modal.search_placeholder', 'Search by order number, email, or customer')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="self-start sm:self-auto"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            {t('common.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filterButtons.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            variant={paymentFilter === filter.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setPaymentFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('transactions.order_modal.loading', 'Loading orders...')}
          </p>
        )}
        {!isLoading && orders.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-6 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('transactions.order_modal.empty_title', 'No matching orders')}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('transactions.order_modal.empty_description', 'Adjust the search keywords and try again.')}
            </p>
          </div>
        )}
        {orders.map(renderOrder)}
      </div>
    </Modal>
  );
};
