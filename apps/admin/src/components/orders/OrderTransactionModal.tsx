import React, { useEffect, useMemo, useState } from 'react';
import { FiDollarSign, FiUser } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert, AlertDescription, AlertTitle } from '../common/Alert';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import type { CustomerTransactionStatus } from '../../types/transactions';

type OrderTransactionContext = {
  id: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  currency?: string;
  totalAmount?: number | string;
};

interface OrderTransactionModalProps {
  isOpen: boolean;
  order?: OrderTransactionContext | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const statusOptions: CustomerTransactionStatus[] = [
  'completed',
  'pending',
  'processing',
  'failed',
  'cancelled',
];

const DEFAULT_DIRECTION = 'credit' as const;

export const OrderTransactionModal: React.FC<OrderTransactionModalProps> = ({
  isOpen,
  order,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<CustomerTransactionStatus>('completed');
  const [description, setDescription] = useState<string>('');

  const safeCurrency = order?.currency ?? 'USD';
  const defaultDescription = useMemo(() => {
    if (!order) {
      return '';
    }
    return t(
      'orders.transactions.quick_action.default_description',
      'Manual revenue record for order #{{orderNumber}}',
      { orderNumber: order.orderNumber ?? order.id },
    );
  }, [order, t]);

  useEffect(() => {
    if (!isOpen || !order) {
      return;
    }
    const numericValue = Number(order.totalAmount ?? 0);
    setAmount(Number.isFinite(numericValue) ? numericValue.toString() : '');
    setStatus('completed');
    setDescription(defaultDescription);
  }, [defaultDescription, isOpen, order]);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setDescription('');
      setStatus('completed');
    }
  }, [isOpen]);

  const createTransactionMutation = trpc.adminCustomerTransactions.create.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('orders.transactions.quick_action.success_title', 'Revenue recorded'),
        description: t('orders.transactions.quick_action.success_message', 'The transaction has been logged for this order.'),
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('orders.transactions.quick_action.error_title', 'Unable to record transaction'),
        description: error.message || t('orders.transactions.quick_action.error_message', 'Please check the values and try again.'),
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!order?.id) {
      return;
    }
    if (!order.customerId) {
      addToast({
        type: 'warning',
        title: t('orders.transactions.quick_action.missing_customer_title', 'Customer required'),
        description: t('orders.transactions.quick_action.missing_customer_message', 'This order is not linked to a customer, so revenue cannot be recorded.'),
      });
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      addToast({
        type: 'error',
        title: t('orders.transactions.quick_action.invalid_amount_title', 'Amount is required'),
        description: t('orders.transactions.quick_action.invalid_amount_message', 'Enter an amount greater than 0 to record revenue.'),
      });
      return;
    }

    const payload = {
      customerId: order.customerId,
      amount: numericAmount,
      currency: safeCurrency,
      type: 'order_payment' as const,
      direction: DEFAULT_DIRECTION,
      status,
      description: description?.trim() || defaultDescription,
      relatedEntityType: 'order' as const,
      relatedEntityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        orderTotal: Number(order.totalAmount ?? numericAmount) || numericAmount,
      },
    };
    createTransactionMutation.mutate(payload);
  };

  if (!isOpen || !order) {
    return null;
  }

  const disableSubmit = createTransactionMutation.isPending || !order.customerId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <FiDollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('orders.transactions.quick_action.title', 'Record order revenue')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('orders.transactions.quick_action.subtitle', 'Link a financial transaction to this order.')}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  {order.orderNumber ? `#${order.orderNumber}` : order.id}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <FiUser className="h-3.5 w-3.5" />
                  {order.customerName ?? order.customerEmail ?? t('orders.transactions.quick_action.unknown_customer', 'Unknown customer')}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {t('orders.transactions.quick_action.currency_label', 'Currency')}: {safeCurrency}
              </span>
            </div>
          </div>
        </div>

        {!order.customerId && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>{t('orders.transactions.quick_action.missing_customer_title', 'Customer required')}</AlertTitle>
            <AlertDescription>
              {t('orders.transactions.quick_action.missing_customer_message', 'This order is not linked to a customer, so revenue cannot be recorded.')}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('orders.transactions.quick_action.amount_label', 'Amount')}
            </label>
            <div className="flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-primary-200">
              <span className="flex items-center px-3 text-sm text-gray-500">
                {safeCurrency}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-12 flex-1 rounded-r-lg border-0 bg-transparent px-3 text-gray-900 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('orders.transactions.quick_action.status_label', 'Status')}
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as CustomerTransactionStatus)}
              className="h-12 w-full rounded-lg border border-gray-300 px-3"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`transactions.status.${option}`, option)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('orders.transactions.quick_action.description_label', 'Description')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={t('orders.transactions.quick_action.description_placeholder', 'Describe this payment or adjustment...')}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={disableSubmit}>
            {createTransactionMutation.isPending
              ? t('orders.transactions.quick_action.submitting', 'Recording...')
              : t('orders.transactions.quick_action.submit', 'Record revenue')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export type { OrderTransactionContext };
