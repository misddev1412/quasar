import React, { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiPlus, FiRefreshCw, FiTrendingUp, FiUsers, FiArrowUpRight, FiArrowDownRight, FiSearch, FiUser, FiX, FiPackage, FiHelpCircle } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Badge } from '../../components/common/Badge';
import { TransactionFilters } from '../../components/transactions/TransactionFilters';
import { CustomerSearchModal, Customer } from '../../components/customers/CustomerSearchModal';
import { OrderSearchModal, OrderSummary } from '../../components/orders/OrderSearchModal';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { TransactionFilterState, TransactionStatsSummary, CustomerTransaction, CustomerTransactionStatus } from '../../types/transactions';
import type { Currency } from '../../types/currency';
import type { PaginatedResponse, ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { Modal } from '../../components/common/Modal';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';

type SortableColumn = 'createdAt' | 'amount' | 'status';

const statusVariantMap: Record<CustomerTransactionStatus, 'success' | 'warning' | 'info' | 'destructive'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'destructive',
  cancelled: 'destructive',
};

const TransactionsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<TransactionFilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<CustomerTransaction>>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  });
  const [sortBy, setSortBy] = useState<SortableColumn>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [typeBeforeOrderSelection, setTypeBeforeOrderSelection] = useState('wallet_topup');

  const [formState, setFormState] = useState({
    customerId: '',
    amount: '',
    currency: '',
    type: 'wallet_topup',
    direction: 'credit',
    status: 'completed',
    description: '',
    relatedOrderId: '',
  });
  const formControlClass =
    'w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/30';

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchValue), 350);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value !== undefined && value !== '').length;
  }, [filters]);

  const listInput = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: filters.status,
    type: filters.type,
    direction: filters.direction,
    currency: filters.currency,
    customerId: filters.customerId,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    sortBy,
    sortOrder,
  }), [page, limit, debouncedSearch, filters, sortBy, sortOrder]);

  const {
    data: transactionsResponseData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = trpc.adminCustomerTransactions.list.useQuery(listInput);

  const {
    data: statsResponseData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.adminCustomerTransactions.stats.useQuery({});

  const {
    data: currenciesResponseData,
    isLoading: currenciesLoading,
  } = trpc.adminCurrency.getCurrencies.useQuery({
    page: 1,
    limit: 100,
    isActive: true,
  });

  const createTransactionMutation = trpc.adminCustomerTransactions.create.useMutation({
    onSuccess: () => {
      addToast({
        title: t('transactions.notifications.create_success_title', 'Transaction recorded'),
        description: t('transactions.notifications.create_success_message', 'The transaction has been recorded successfully.'),
        type: 'success',
      });
      handleCloseCreateModal();
      setFormState({
        customerId: '',
        amount: '',
        currency: '',
        type: 'wallet_topup',
        direction: 'credit',
        status: 'completed',
        description: '',
        relatedOrderId: '',
      });
      setSelectedCustomer(null);
      setSelectedOrder(null);
      setTypeBeforeOrderSelection('wallet_topup');
      refetch();
      refetchStats();
    },
    onError: () => {
      addToast({
        title: t('transactions.notifications.create_error_title', 'Unable to record transaction'),
        description: t('transactions.notifications.create_error_message', 'Please check the input values and try again.'),
        type: 'error',
      });
    },
  });

  const transactionsResponse = transactionsResponseData as PaginatedResponse<CustomerTransaction> | undefined;
  const statsResponse = statsResponseData as ApiResponse<TransactionStatsSummary> | undefined;
  const currenciesResponse = currenciesResponseData as PaginatedResponse<Currency> | undefined;

  const transactions = transactionsResponse?.data.items ?? [];
  const totalItems = transactionsResponse?.data.total ?? 0;
  const totalPages = transactionsResponse?.data.totalPages ?? 0;

  const stats = statsResponse?.data;
  const currencyItems = useMemo(() => currenciesResponse?.data.items ?? [], [currenciesResponse]);
  const currencyOptions = useMemo(() => currencyItems
    .filter((currency) => currency.isActive)
    .map((currency) => ({
      code: currency.code,
      label: `${currency.code} — ${currency.name}`,
      isDefault: currency.isDefault,
    }))
    .sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.code.localeCompare(b.code);
    }), [currencyItems]);

  const defaultCurrencyOption = useMemo(
    () => currencyOptions.find((option) => option.isDefault) ?? currencyOptions[0],
    [currencyOptions],
  );
  const defaultCurrencyCode = defaultCurrencyOption?.code ?? 'USD';

  useEffect(() => {
    if (!defaultCurrencyCode) {
      return;
    }
    setFormState((prev) => {
      if (prev.currency === defaultCurrencyCode) {
        return prev;
      }
      return { ...prev, currency: defaultCurrencyCode };
    });
  }, [defaultCurrencyCode]);

  useEffect(() => {
    if (!filters.currency) {
      return;
    }
    if (currencyOptions.some((option) => option.code === filters.currency)) {
      return;
    }
    setFilters((prev) => {
      if (!prev.currency) {
        return prev;
      }
      const nextState = { ...prev };
      delete nextState.currency;
      return nextState;
    });
  }, [currencyOptions, filters.currency]);

  const displayCurrency = defaultCurrencyCode;
  const currencyDisplayLabel = currenciesLoading
    ? t('transactions.fields.loading_currencies', 'Loading currencies...')
    : defaultCurrencyOption?.label ?? defaultCurrencyCode;

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const getNumericValue = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  };

  const statisticsData: StatisticData[] = useMemo(() => ([
    {
      id: 'total-volume',
      title: t('transactions.stats.total_volume', 'Net Volume'),
      value: formatCurrency(stats?.totalVolume ?? 0, displayCurrency),
      icon: <FiTrendingUp className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'credit-volume',
      title: t('transactions.stats.total_inflow', 'Total Inflow'),
      value: formatCurrency(stats?.creditVolume ?? 0, displayCurrency),
      icon: <FiArrowUpRight className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'debit-volume',
      title: t('transactions.stats.total_outflow', 'Total Outflow'),
      value: formatCurrency(stats?.debitVolume ?? 0, displayCurrency),
      icon: <FiArrowDownRight className="w-5 h-5 text-rose-500" />,
    },
    {
      id: 'unique-users',
      title: t('transactions.stats.unique_customers', 'Unique Customers'),
      value: stats?.uniqueCustomers?.toLocaleString() ?? '0',
      icon: <FiUsers className="w-5 h-5 text-indigo-500" />,
    },
  ]), [stats, t, displayCurrency]);

  const layoutActions = useMemo(() => {
    const filtersLabel = activeFilterCount > 0
      ? `${t('transactions.actions.filters', 'Filters')} (${activeFilterCount})`
      : t('transactions.actions.filters', 'Filters');

    return [
      {
        label: filtersLabel,
        onClick: () => setShowFilters((prev) => !prev),
        icon: <FiFilter className="w-4 h-4" />,
        active: showFilters,
      },
      {
        label: t('transactions.actions.refresh', 'Refresh'),
        onClick: () => refetch(),
        icon: <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />,
        disabled: isFetching,
      },
      {
        label: t('transactions.actions.record', 'Record Transaction'),
        onClick: () => setShowCreateModal(true),
        icon: <FiPlus className="w-4 h-4" />,
        primary: true,
      },
    ];
  }, [activeFilterCount, isFetching, refetch, showFilters, t]);

  const handleManualCustomerIdChange = (value: string) => {
    setSelectedCustomer(null);
    setFormState((prev) => ({ ...prev, customerId: value }));
  };

  const deriveCustomerFromOrder = (order: OrderSummary): Customer | null => {
    if (!order.customerId) {
      return null;
    }
    const fullName = order.customerName?.trim() ?? '';
    const [firstName, ...rest] = fullName.split(' ').filter(Boolean);
    const lastName = rest.join(' ');

    const now = new Date();
    return {
      id: order.customerId,
      firstName: firstName ?? '',
      lastName,
      email: order.customerEmail,
      type: 'INDIVIDUAL',
      status: 'ACTIVE',
      marketingConsent: false,
      newsletterSubscribed: false,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      loyaltyPoints: 0,
      customerTags: [],
      createdAt: now,
      updatedAt: now,
      taxExempt: false,
      notes: undefined,
      referralSource: undefined,
    } as Customer;
  };

  const handleSelectCustomer = (customer: Customer) => {
    if (selectedOrder) {
      return;
    }
    setSelectedCustomer(customer);
    setFormState((prev) => ({ ...prev, customerId: customer.id }));
    setShowCustomerModal(false);
  };

  const handleClearSelectedCustomer = () => {
    if (selectedOrder) {
      return;
    }
    setSelectedCustomer(null);
    setFormState((prev) => ({ ...prev, customerId: '' }));
  };

  const handleSelectOrder = (order: OrderSummary) => {
    setTypeBeforeOrderSelection(formState.type);
    setSelectedOrder(order);

    if (order.customerId) {
      const derivedCustomer = deriveCustomerFromOrder(order);
      if (derivedCustomer) {
        setSelectedCustomer(derivedCustomer);
        setFormState((prev) => ({ ...prev, customerId: order.customerId }));
      }
    } else {
      addToast({
        type: 'warning',
        title: t('transactions.order_modal.customer_missing_title', 'Customer not linked'),
        description: t('transactions.order_modal.customer_missing_description', 'The selected order has no customer reference.'),
      });
    }

    setFormState((prev) => ({
      ...prev,
      relatedOrderId: order.id,
      type: 'order_payment',
    }));
    setShowOrderModal(false);
  };

  const handleClearSelectedOrder = () => {
    setSelectedOrder(null);
    setFormState((prev) => ({
      ...prev,
      relatedOrderId: '',
      type: typeBeforeOrderSelection,
    }));
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setShowCustomerModal(false);
    setShowOrderModal(false);
  };

  const columns: Column<CustomerTransaction>[] = useMemo(() => [
    {
      id: 'transaction',
      header: t('transactions.table.transaction', 'Transaction'),
      accessor: (transaction) => (
        <div className="flex flex-col">
          <Link
            to={`/transactions/${transaction.id}`}
            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {transaction.transactionCode}
          </Link>
          {transaction.referenceId && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('transactions.table.reference', 'Reference')}: {transaction.referenceId}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'customer',
      header: t('transactions.table.customer', 'Customer'),
      accessor: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {transaction.customer?.fullName
              || [transaction.customer?.firstName, transaction.customer?.lastName].filter(Boolean).join(' ').trim()
              || transaction.customer?.email
              || t('transactions.table.unknown_customer', 'Unknown customer')}
          </span>
          {transaction.customer?.email && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {transaction.customer.email}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'order',
      header: t('transactions.table.order', 'Order'),
      accessor: (transaction) => {
        if (transaction.relatedEntityType !== 'order' || !transaction.relatedEntityId) {
          return <span className="text-xs text-gray-400 dark:text-gray-500">{t('transactions.table.no_order', '—')}</span>;
        }
        const orderNumber =
          (transaction.metadata?.orderNumber as string) ||
          transaction.referenceId ||
          transaction.relatedEntityId.slice(0, 8);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">#{orderNumber}</span>
            <Link
              to={`/orders/${transaction.relatedEntityId}`}
              className="text-xs text-primary-600 hover:underline dark:text-primary-300"
            >
              {t('transactions.table.view_order', 'View order')}
            </Link>
          </div>
        );
      },
    },
    {
      id: 'amount',
      header: t('transactions.table.amount', 'Amount'),
      accessor: 'impactAmount',
      isSortable: true,
      render: (_value, transaction) => {
        const isDebit = transaction.impactDirection === 'debit';
        return (
          <div className="flex flex-col">
            <span className={`font-semibold ${isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isDebit ? '-' : '+'}{formatCurrency(transaction.impactAmount, transaction.currency)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t(`transactions.directions.${transaction.impactDirection}`, transaction.impactDirection)}
            </span>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: t('transactions.table.status', 'Status'),
      accessor: 'status',
      isSortable: true,
      render: (value: CustomerTransactionStatus) => (
        <Badge variant={statusVariantMap[value]} size="sm">
          {t(`transactions.status.${value}`, value)}
        </Badge>
      ),
    },
    {
      id: 'type',
      header: t('transactions.table.type', 'Type'),
      accessor: (transaction) => (
        <Badge variant="secondary" size="sm">
          {t(`transactions.types.${transaction.type}`, transaction.type)}
        </Badge>
      ),
    },
    {
      id: 'balance',
      header: t('transactions.table.balance', 'Balance After'),
      accessor: (transaction) => {
        const balanceAfterValue = getNumericValue(
          transaction.balanceAfter ?? transaction.metadata?.['balanceAfter'] ?? transaction.metadata?.['balance_after'],
        );
        const balanceBeforeValue = getNumericValue(
          transaction.balanceBefore ?? transaction.metadata?.['balanceBefore'] ?? transaction.metadata?.['balance_before'],
        );

        const balanceAfterDisplay = balanceAfterValue !== undefined
          ? formatCurrency(balanceAfterValue, transaction.currency)
          : t('common.not_available', 'Not Available');
        const balanceBeforeDisplay = balanceBeforeValue !== undefined
          ? formatCurrency(balanceBeforeValue, transaction.currency)
          : t('common.not_available', 'Not Available');

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {balanceAfterDisplay}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('transactions.table.balance_before', 'Before')}: {balanceBeforeDisplay}
            </span>
          </div>
        );
      },
    },
    {
      id: 'createdAt',
      header: t('transactions.table.created_at', 'Created'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
    },
  ], [t]);

  const handleFiltersChange = (nextFilters: TransactionFilterState) => {
    const sanitized = Object.entries(nextFilters).reduce<TransactionFilterState>((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof TransactionFilterState] = value as never;
      }
      return acc;
    }, {});
    setFilters(sanitized);
    setPage(1);
  };

  const handleSortChange = (descriptor: SortDescriptor<CustomerTransaction>) => {
    setSortDescriptor(descriptor);
    const column = descriptor.columnAccessor;
    if (column === 'impactAmount') {
      setSortBy('amount');
    } else if (column === 'status') {
      setSortBy('status');
    } else {
      setSortBy('createdAt');
    }
    setSortOrder(descriptor.direction === 'asc' ? 'ASC' : 'DESC');
  };

  const handleCreateTransaction = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.customerId) {
      addToast({
        title: t('transactions.validation.customer_id', 'Customer ID is required'),
        type: 'error',
      });
      return;
    }
    if (!formState.amount || Number(formState.amount) <= 0) {
      addToast({
        title: t('transactions.validation.amount', 'Amount must be greater than 0'),
        type: 'error',
      });
      return;
    }
    if (!formState.currency) {
      addToast({
        title: t('transactions.validation.currency', 'Currency is required'),
        type: 'error',
      });
      return;
    }

    const payload: any = {
      customerId: formState.customerId,
      amount: Number(formState.amount),
      currency: formState.currency,
      type: formState.type as CustomerTransaction['type'],
      direction: formState.direction as CustomerTransaction['impactDirection'],
      status: formState.status as CustomerTransactionStatus,
      description: formState.description || undefined,
    };

    if (formState.relatedOrderId) {
      payload.relatedEntityType = 'order';
      payload.relatedEntityId = formState.relatedOrderId;
      if (selectedOrder) {
        payload.metadata = {
          orderNumber: selectedOrder.orderNumber,
          orderTotal: selectedOrder.totalAmount,
        };
      }
    }

    createTransactionMutation.mutate(payload);
  };

  return (
    <BaseLayout
      title={t('transactions.title', 'Transactions')}
      description={t('transactions.page_subtitle', 'Comprehensive view of user debits and credits.')}
      actions={layoutActions}
      breadcrumbs={[
        { label: t('navigation.sales_operations', 'Sales & Operations'), href: '#' },
        { label: t('transactions.title', 'Transactions'), href: '/transactions' },
      ]}
    >
      <div className="space-y-6">
        <StatisticsGrid statistics={statisticsData} isLoading={statsLoading} />

        {showFilters && (
          <TransactionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={() => handleFiltersChange({})}
            activeFilterCount={activeFilterCount}
            currencyOptions={currencyOptions}
            isCurrencyLoading={currenciesLoading}
          />
        )}

        <Card className="p-0">
          {error && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertTitle>{t('transactions.errors.load_failed', 'Unable to load transactions')}</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            </div>
          )}
          <Table<CustomerTransaction>
            data={transactions}
            columns={columns}
            isLoading={isLoading}
            tableId="admin-user-transactions"
            searchValue={searchValue}
            onSearchChange={(value) => setSearchValue(value)}
            onFilterClick={() => setShowFilters((prev) => !prev)}
            isFilterActive={activeFilterCount > 0}
            showColumnVisibility={false}
            pagination={{
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage: limit,
              onPageChange: setPage,
              onItemsPerPageChange: (value) => {
                setLimit(value);
                setPage(1);
              },
            }}
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            emptyMessage={t('transactions.empty_state', 'No transactions found for the selected filters')}
          />
        </Card>
      </div>

      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={handleCloseCreateModal} size="lg">
          <form onSubmit={handleCreateTransaction}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('transactions.modal.title', 'Record transaction')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('transactions.modal.description', 'Manually credit or debit a customer balance.')}
                </p>
              </div>
            </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('transactions.fields.related_order', 'Related order (optional)')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('transactions.fields.related_order_helper', 'When provided, the transaction will be tied to the specified order.')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowOrderModal(true)}>
                        <FiPackage className="w-4 h-4 mr-2" />
                        {selectedOrder
                          ? t('transactions.actions.change_order', 'Change order')
                          : t('transactions.actions.select_order', 'Select order')}
                      </Button>
                      {selectedOrder && (
                        <Button type="button" variant="ghost" size="sm" onClick={handleClearSelectedOrder}>
                          <FiX className="w-4 h-4 mr-2" />
                          {t('common.clear', 'Clear')}
                        </Button>
                      )}
                    </div>
                  </div>
                  {selectedOrder ? (
                    <div className="rounded-xl border border-primary-200 dark:border-primary-900/40 bg-primary-50/60 dark:bg-primary-900/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedOrder.orderNumber ? `#${selectedOrder.orderNumber}` : selectedOrder.id}
                          </p>
                          {selectedOrder.customerName && (
                            <p className="text-xs text-gray-500 dark:text-gray-300">
                              {selectedOrder.customerName}
                              {selectedOrder.customerEmail ? ` • ${selectedOrder.customerEmail}` : ''}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            {selectedOrder.status && (
                              <Badge variant="info">
                                {t(`orders.status.${selectedOrder.status.toLowerCase()}`, selectedOrder.status)}
                              </Badge>
                            )}
                            {selectedOrder.paymentStatus && (
                              <Badge variant={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                                {t(`orders.payment_status.${selectedOrder.paymentStatus.toLowerCase()}`, selectedOrder.paymentStatus)}
                              </Badge>
                            )}
                            {Number.isFinite(Number(selectedOrder.totalAmount)) && (
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(Number(selectedOrder.totalAmount), selectedOrder.currency || 'USD')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                      {t('transactions.fields.related_order_placeholder', 'Enter order ID to link payment')}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('transactions.fields.customer', 'Customer')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('transactions.fields.customer_helper', 'Search for an existing customer or enter an ID manually.')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedOrder) return;
                          setShowCustomerModal(true);
                        }}
                        disabled={!!selectedOrder}
                      >
                        <FiSearch className="w-4 h-4 mr-2" />
                        {selectedCustomer
                          ? t('transactions.actions.change_customer', 'Change customer')
                          : t('transactions.actions.select_customer', 'Select customer')}
                      </Button>
                      {selectedCustomer && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelectedCustomer}
                          disabled={!!selectedOrder}
                        >
                          <FiX className="w-4 h-4 mr-2" />
                          {t('common.clear', 'Clear')}
                        </Button>
                      )}
                      {selectedOrder && (
                        <Tooltip
                          title={t('transactions.fields.customer_locked_by_order', 'Customer is fixed based on the selected order.')}
                          componentsProps={{
                            tooltip: { sx: { zIndex: 1600 } },
                            popper: { sx: { zIndex: 1600 } },
                          }}
                        >
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800/80 dark:text-gray-300">
                            <FiHelpCircle className="h-4 w-4" />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {selectedCustomer ? (
                    <Card className="border border-primary-200 dark:border-primary-900/40 bg-primary-50/60 dark:bg-primary-900/20 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-200">
                          <FiUser className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {selectedCustomer.firstName || selectedCustomer.lastName
                              ? `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim()
                              : selectedCustomer.email || t('transactions.fields.unknown_customer', 'Unknown customer')}
                          </p>
                          {selectedCustomer.email && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCustomer.email}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('transactions.fields.customer_id_label', 'Customer ID')}: {selectedCustomer.id}
                          </p>
                          {selectedCustomer.customerNumber && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('transactions.fields.customer_number', 'Customer number')}: {selectedCustomer.customerNumber}
                            </p>
                          )}
                          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                            {t('transactions.fields.customer_selected', 'Selected')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                      {t('transactions.fields.customer_empty', 'No customer selected yet. Use the search button to pick an existing customer.')}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('transactions.fields.customer_id_manual', 'Customer ID (manual entry)')}
                    </label>
                    <input
                      type="text"
                      value={formState.customerId}
                      onChange={(e) => handleManualCustomerIdChange(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                        selectedCustomer
                          ? 'bg-gray-100 dark:bg-gray-800/80 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                      placeholder={t('transactions.fields.customer_id_placeholder', 'Enter customer ID')}
                      disabled={!!selectedCustomer}
                      required={!selectedCustomer}
                    />
                    {selectedCustomer && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('transactions.fields.customer_id_locked', 'Customer ID is locked to the selected customer.')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('transactions.fields.amount', 'Amount')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.amount}
                      onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value }))}
                      className={formControlClass}
                      required
                    />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('transactions.fields.currency', 'Currency')}
                  </label>
                  <input
                    type="text"
                    value={currencyDisplayLabel}
                    readOnly
                    disabled
                    className={`${formControlClass} cursor-not-allowed bg-gray-100 dark:bg-gray-800/70`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t(
                      'transactions.fields.currency_default_notice',
                      'Transactions are recorded using the default currency',
                    )}{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{defaultCurrencyCode}</span>
                    .
                  </p>
                  {currencyOptions.length === 0 && !currenciesLoading && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                      {t('transactions.fields.no_currencies', 'No active currencies available. Please configure currencies first.')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('transactions.fields.type', 'Type')}
                  </label>
                  <select
                    value={formState.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setFormState((prev) => ({ ...prev, type: nextType }));
                      if (!selectedOrder) {
                        setTypeBeforeOrderSelection(nextType);
                      }
                    }}
                    disabled={!!selectedOrder}
                    className={`${formControlClass} ${selectedOrder ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800/70' : ''}`}
                  >
                    <option value="order_payment">{t('transactions.types.order_payment', 'Order Payment')}</option>
                    <option value="refund">{t('transactions.types.refund', 'Refund')}</option>
                    <option value="wallet_topup">{t('transactions.types.wallet_topup', 'Wallet Top-up')}</option>
                    <option value="withdrawal">{t('transactions.types.withdrawal', 'Withdrawal')}</option>
                    <option value="adjustment">{t('transactions.types.adjustment', 'Adjustment')}</option>
                    <option value="subscription">{t('transactions.types.subscription', 'Subscription')}</option>
                  </select>
                  {selectedOrder && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('transactions.fields.type_locked', 'Order-linked transactions are recorded as Order Payment.')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('transactions.fields.direction', 'Direction')}
                  </label>
                  <select
                    value={formState.direction}
                    onChange={(e) => setFormState((prev) => ({ ...prev, direction: e.target.value }))}
                    className={formControlClass}
                  >
                    <option value="credit">{t('transactions.directions.credit', 'Credit')}</option>
                    <option value="debit">{t('transactions.directions.debit', 'Debit')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('transactions.fields.status', 'Status')}
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                    className={formControlClass}
                  >
                    <option value="pending">{t('transactions.status.pending', 'Pending')}</option>
                    <option value="processing">{t('transactions.status.processing', 'Processing')}</option>
                    <option value="completed">{t('transactions.status.completed', 'Completed')}</option>
                    <option value="failed">{t('transactions.status.failed', 'Failed')}</option>
                    <option value="cancelled">{t('transactions.status.cancelled', 'Cancelled')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('transactions.fields.description', 'Description')}
                </label>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('transactions.fields.description_placeholder', 'Optional description...')}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCloseCreateModal}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={createTransactionMutation.isPending}>
                {createTransactionMutation.isPending ? t('common.saving', 'Saving...') : t('transactions.actions.record', 'Record Transaction')}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <CustomerSearchModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelectCustomer={handleSelectCustomer}
        title={t('transactions.customer_modal.title', 'Select customer')}
        description={t('transactions.customer_modal.description', 'Search and pick an existing customer to link with this transaction.')}
      />
      <OrderSearchModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSelectOrder={handleSelectOrder}
        selectedOrderId={selectedOrder?.id}
      />
    </BaseLayout>
  );
};

export default TransactionsPage;
