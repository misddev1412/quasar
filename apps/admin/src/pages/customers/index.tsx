import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiUsers, FiUserCheck, FiUserX, FiAward, FiCalendar, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiHome, FiEdit2, FiMail, FiPhone } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { CustomerFilters, CustomerFiltersType } from '../../components/features/CustomerFilters';

interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  companyName?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}


const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('customers-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['customer', 'contact', 'type', 'status', 'orders', 'lastOrder', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<CustomerFiltersType>({
    status: searchParams.get('status') || undefined,
    type: searchParams.get('type') || undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['customer', 'contact', 'type', 'status', 'orders', 'lastOrder', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Selected customers for bulk actions
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string | number>>(new Set());

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams();

      // Add non-empty parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          newSearchParams.set(key, value);
        }
      });

      // Update URL without causing navigation
      setSearchParams(newSearchParams, { replace: true });
    }, 100);
  }, [setSearchParams]);

  // Debounce search value for API calls and URL updates
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1); // Reset to first page when search changes

      // Update URL with search parameter and all filters
      updateUrlParams({
        search: searchValue || undefined,
        status: filters.status || undefined,
        type: filters.type || undefined,
        page: searchValue ? '1' : String(page),
        limit: limit !== 10 ? String(limit) : undefined,
        sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
        sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
      });
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, filters, page, sortBy, sortOrder, updateUrlParams, limit]);

  // Build query parameters - match the API schema exactly
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    status: filters.status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING' | undefined,
    type: filters.type as 'INDIVIDUAL' | 'BUSINESS' | undefined,
    hasOrders: undefined,
    isVip: filters.isVip || undefined,
  };

  const { data: customersData, isLoading, error, refetch, isFetching } = trpc.adminCustomers.list.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: statsData, isLoading: isStatsLoading } = trpc.adminCustomers.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const customers = (customersData as any)?.data?.items || [];
  const totalCustomers = (customersData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalCustomers / limit);

  const handleCreateCustomer = () => {
    navigate('/customers/create');
  };

  const goToCustomer = (id: string) => navigate(`/customers/${id}`);

  const deleteCustomerMutation = trpc.adminCustomers.delete.useMutation({
    onSuccess: (data: any) => {
      addToast({ type: 'success', title: t('customers.deleteSuccess', 'Customer deleted') });
      refetch();
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: t('customers.deleteError', 'Delete failed'), description: error?.message });
    },
  });

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    try {
      const ok = window.confirm(t('customers.deleteConfirm', 'Are you sure you want to delete this customer? This action cannot be undone.'));
      if (!ok) return;
      await deleteCustomerMutation.mutateAsync({ id: customerId });
    } catch (e) {
      // Error is handled by onError callback
    }
  }, [deleteCustomerMutation, t]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updatePageSize(newLimit);
    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<Customer>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: newSortBy !== 'createdAt' ? newSortBy : undefined,
      sortOrder: newSortOrder !== 'desc' ? newSortOrder : undefined,
    });
  };

  // Handle column visibility
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(columnId);
      } else {
        newSet.delete(columnId);
      }
      updateVisibleColumns(newSet);
      return newSet;
    });
  };

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'activate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('customers.bulk_activate_coming_soon', 'Bulk activate will be available soon') });
        break;
      case 'deactivate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('customers.bulk_deactivate_coming_soon', 'Bulk deactivate will be available soon') });
        break;
      case 'delete':
        const confirmDelete = window.confirm(t('customers.bulk_delete_confirm', `Are you sure you want to delete ${selectedCustomerIds.size} customers? This action cannot be undone.`));
        if (confirmDelete) {
          addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('customers.bulk_delete_coming_soon', 'Bulk delete will be available soon') });
        }
        break;
      default:
        break;
    }
  }, [selectedCustomerIds.size, addToast, t]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: CustomerFiltersType) => {
    setFilters(newFilters);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      status: newFilters.status || undefined,
      type: newFilters.type || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: CustomerFiltersType = {};
    setFilters(clearedFilters);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key =>
    filters[key as keyof CustomerFiltersType] !== undefined &&
    filters[key as keyof CustomerFiltersType] !== null &&
    filters[key as keyof CustomerFiltersType] !== ''
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'BLOCKED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUSINESS':
        return <FiUserCheck className="w-4 h-4" />;
      case 'INDIVIDUAL':
        return <FiUsers className="w-4 h-4" />;
      default:
        return <FiUsers className="w-4 h-4" />;
    }
  };

  const isVipCustomer = (customer: Customer) => {
    return customer.totalSpent >= 1000 || customer.totalOrders >= 10;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Enhanced column definitions
  const columns: Column<Customer>[] = useMemo(() => [
    {
      id: 'customer',
      header: t('admin.customer_name'),
      accessor: (customer: Customer) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {customer.firstName?.charAt(0) || '?'}{customer.lastName?.charAt(0) || ''}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {customer.firstName || 'Unnamed'} {customer.lastName || ''}
              </span>
              {isVipCustomer(customer) && (
                <div title={t('admin.vip_customer')}>
                  <FiAward className="w-4 h-4 text-yellow-500" />
                </div>
              )}
              {getTypeIcon(customer.type)}
            </div>
            {customer.companyName && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {customer.companyName}
              </span>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'contact',
      header: t('admin.contact_info'),
      accessor: (customer: Customer) => (
        <div>
          {customer.email && (
            <div className="flex items-center space-x-1 text-sm text-gray-900 dark:text-white">
              <FiMail className="w-3 h-3 text-gray-400" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <FiPhone className="w-3 h-3 text-gray-400" />
              <span>{customer.phone}</span>
            </div>
          )}
          {!customer.email && !customer.phone && (
            <span className="text-sm text-gray-500 dark:text-gray-400">No contact info</span>
          )}
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'type',
      header: t('admin.customer_type'),
      accessor: (customer: Customer) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {t(`admin.customer_type.${customer.type.toLowerCase()}`)}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: t('admin.status'),
      accessor: (customer: Customer) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
          {t(`admin.customer_status.${customer.status.toLowerCase()}`)}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'orders',
      header: t('admin.orders'),
      accessor: (customer: Customer) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white font-medium">
            {customer.totalOrders} {t('admin.orders')}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatCurrency(customer.totalSpent)}
          </div>
        </div>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'lastOrder',
      header: t('admin.last_order'),
      accessor: (customer: Customer) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {customer.lastOrderDate ? (
            <div className="flex items-center space-x-1">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(customer.lastOrderDate)}</span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{t('admin.no_orders')}</span>
          )}
        </div>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('common.created_at', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (customer: Customer) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${customer.firstName || 'Unnamed'} ${customer.lastName || ''}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => goToCustomer(customer.id)
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/customers/${customer.id}/edit`)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteCustomer(customer.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleDeleteCustomer, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<Customer> = useMemo(() => ({
    columnAccessor: sortBy as keyof Customer,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected customers
  const bulkActions = useMemo(() => [
    {
      label: t('customers.activate_selected', 'Activate Selected'),
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: t('customers.deactivate_selected', 'Deactivate Selected'),
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: t('customers.delete_selected', 'Delete Selected'),
      value: 'delete',
      variant: 'danger' as const,
    },
  ], [t]);

  const actions = useMemo(() => [
    {
      label: t('admin.create_customer'),
      onClick: handleCreateCustomer,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('common.hide_filters', 'Hide Filters') : t('common.show_filters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleCreateCustomer, handleRefresh, handleFilterToggle, showFilters, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('admin.customers'),
      icon: <FiUsers className="w-4 h-4" />,
    },
  ]), [t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!(statsData as any)?.data) {
      // Fallback to calculate from current page data if stats API fails
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
      const vipCustomers = customers.filter(c => isVipCustomer(c)).length;
      const businessCustomers = customers.filter(c => c.type === 'BUSINESS').length;
      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgOrderValue = totalRevenue / Math.max(customers.reduce((sum, c) => sum + c.totalOrders, 0), 1);

      return [
        {
          id: 'total-customers',
          title: t('customers.total_customers', 'Total Customers'),
          value: totalCustomers.toString(),
          icon: <FiUsers className="w-5 h-5" />,
          enableChart: true,
        },
        {
          id: 'active-customers',
          title: t('customers.active_customers', 'Active Customers'),
          value: activeCustomers.toString(),
          icon: <FiUserCheck className="w-5 h-5" />,
          enableChart: true,
        },
        {
          id: 'vip-customers',
          title: t('customers.vip_customers', 'VIP Customers'),
          value: vipCustomers.toString(),
          icon: <FiAward className="w-5 h-5" />,
          enableChart: false,
        },
        {
          id: 'business-customers',
          title: t('customers.business_customers', 'Business Customers'),
          value: businessCustomers.toString(),
          icon: <FiUserCheck className="w-5 h-5" />,
          enableChart: false,
        },
        {
          id: 'avg-order-value',
          title: t('customers.avg_order_value', 'Avg Order Value'),
          value: formatCurrency(avgOrderValue),
          icon: <FiCalendar className="w-5 h-5" />,
          enableChart: false,
        },
      ];
    }

    // Use real stats from API
    const stats = (statsData as any).data;
    return [
      {
        id: 'total-customers',
        title: t('customers.total_customers', 'Total Customers'),
        value: stats.totalCustomers.toString(),
        icon: <FiUsers className="w-5 h-5" />,
        enableChart: true,
      },
      {
        id: 'active-customers',
        title: t('customers.active_customers', 'Active Customers'),
        value: stats.activeCustomers.toString(),
        icon: <FiUserCheck className="w-5 h-5" />,
        enableChart: true,
      },
      {
        id: 'new-customers',
        title: t('customers.new_customers_this_month', 'New This Month'),
        value: stats.newCustomersThisMonth.toString(),
        icon: <FiCalendar className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'vip-customers',
        title: t('customers.vip_customers', 'VIP Customers'),
        value: stats.vipCustomers.toString(),
        icon: <FiAward className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'avg-order-value',
        title: t('customers.avg_order_value', 'Avg Order Value'),
        value: formatCurrency(stats.averageOrderValue),
        icon: <FiCalendar className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'avg-lifetime',
        title: t('customers.avg_lifetime', 'Avg Customer Lifetime'),
        value: `${Math.round(stats.averageCustomerLifetime)} days`,
        icon: <FiCalendar className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [statsData, customers, t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('customers.title', 'Customer Management')}
        description={t('customers.description', 'Manage all customers in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout
        title={t('customers.title', 'Customer Management')}
        description={t('customers.description', 'Manage all customers in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('customers.title', 'Customer Management')}
      description={t('customers.description', 'Manage all customers in the system')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={isStatsLoading}
          skeletonCount={6}
        />

        {/* Filter Panel */}
        {showFilters && (
          <CustomerFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Enhanced Customers Table */}
        <Table<Customer>
          tableId="customers-table"
          columns={columns}
          data={customers}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('customers.search_placeholder', 'Search customers by name, email, or company...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedCustomerIds}
          onSelectionChange={setSelectedCustomerIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalCustomers,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(customer) => goToCustomer(customer.id)}
          // Empty state
          emptyMessage={t('admin.no_customers_found')}
          emptyAction={{
            label: t('admin.create_customer'),
            onClick: handleCreateCustomer,
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default CustomersPage;
