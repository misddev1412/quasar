import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiHash,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import BaseLayout from '../../components/layout/BaseLayout';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Loading } from '../../components/common/Loading';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { trpc } from '../../utils/trpc';
import { CustomerTransaction, CustomerTransactionStatus } from '../../types/transactions';

const statusVariantMap: Record<CustomerTransactionStatus, 'success' | 'warning' | 'info' | 'destructive'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'destructive',
  cancelled: 'destructive',
};

const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const {
    data: transactionResponse,
    isLoading,
    error,
  } = trpc.adminCustomerTransactions.detail.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const transaction = (transactionResponse as ApiResponse<CustomerTransaction> | undefined)?.data;

  if (isLoading) {
    return (
      <BaseLayout title={t('transactions.transaction_details')} fullWidth>
        <Loading />
      </BaseLayout>
    );
  }

  if (error || !transaction) {
    return (
      <BaseLayout title={t('transactions.transaction_details')} fullWidth>
        <div className="text-center py-12">
          <p className="text-gray-500">
            {error?.message || t('transactions.transaction_not_found', 'Transaction not found')}
          </p>
        </div>
      </BaseLayout>
    );
  }

  const breadcrumbItems = [
    { label: t('transactions.title', 'Transactions'), href: '/transactions' },
    { label: transaction.transactionCode, href: `/transactions/${transaction.id}` },
  ];

  return (
    <BaseLayout title={t('transactions.transaction_details', 'Transaction Details')} fullWidth>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{transaction.transactionCode}</h1>
              <p className="text-gray-500">
                {t('transactions.transaction_details_description', 'View transaction details and related information')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Overview */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">{t('transactions.overview', 'Overview')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('transactions.transaction_code')}</p>
                  <p className="font-medium">{transaction.transactionCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transactions.status')}</p>
                  <Badge variant={statusVariantMap[transaction.status]}>
                    {t(`transactions.status.${transaction.status}`)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transactions.type')}</p>
                  <p className="font-medium">{t(`transactions.type.${transaction.type}`)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transactions.amount')}</p>
                  <div className="flex items-center gap-1">
                    {transaction.impactDirection === 'credit' ? (
                      <FiTrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiTrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {transaction.impactDirection === 'credit' ? '+' : '-'}
                      {transaction.totalAmount} {transaction.currency}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transactions.created_at')}</p>
                  <p className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
                {transaction.processedAt && (
                  <div>
                    <p className="text-sm text-gray-500">{t('transactions.processed_at')}</p>
                    <p className="font-medium">{new Date(transaction.processedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              {transaction.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{t('transactions.description')}</p>
                  <p className="font-medium">{transaction.description}</p>
                </div>
              )}
              {transaction.failureReason && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{t('transactions.failure_reason')}</p>
                  <p className="font-medium text-red-600">{transaction.failureReason}</p>
                </div>
              )}
            </div>

            {/* Related Entity */}
            {transaction.relatedEntityType && transaction.relatedEntityId && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">{t('transactions.related_entity', 'Related Entity')}</h2>
                <div className="flex items-center gap-2">
                  <FiHash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{transaction.relatedEntityType}:</span>
                  <span className="font-medium">{transaction.relatedEntityId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            {transaction.customer && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  {t('transactions.customer', 'Customer')}
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{transaction.customer.fullName || transaction.customer.email}</p>
                  <p className="text-sm text-gray-500">{transaction.customer.email}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customers/${transaction.customerId}`)}
                    className="w-full mt-3"
                  >
                    {t('transactions.view_customer', 'View Customer')}
                  </Button>
                </div>
              </div>
            )}

            {/* Balance Information */}
            {(transaction.balanceBefore !== undefined || transaction.balanceAfter !== undefined) && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5" />
                  {t('transactions.balance', 'Balance')}
                </h3>
                <div className="space-y-2">
                  {transaction.balanceBefore !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('transactions.balance_before')}</span>
                      <span className="font-medium">{transaction.balanceBefore} {transaction.currency}</span>
                    </div>
                  )}
                  {transaction.balanceAfter !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('transactions.balance_after')}</span>
                      <span className="font-medium">{transaction.balanceAfter} {transaction.currency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">{t('transactions.metadata', 'Metadata')}</h3>
                <div className="space-y-2">
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-500">{key}:</span>
                      <span className="font-medium text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default TransactionDetailPage;
