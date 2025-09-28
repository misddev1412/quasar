'use client';

import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { Card, CardBody, CardHeader } from '@heroui/react';
import {
  Package,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Download,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Helmet } from 'react-helmet-async';
import { trpc } from '@/utils/trpc';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Table, TableColumn } from '../../../components/common/Table';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Pagination } from '../../../components/common/Pagination';
import { SearchFilter, FilterOption } from '../../../components/common/SearchFilter';
import { OrderStats } from '../../../components/common/OrderStats';
import { OrderCard } from '../../../components/common/OrderCard';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
    id: string;
    name: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  orderDate: Date;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  itemCount: number;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  cancelledReason?: string;
}

interface OrdersResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Order[];
}

export default function Page() {
  const t = useTranslations();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const { data: ordersData, isLoading, refetch } = trpc.clientOrders.list.useQuery<OrdersResponse>({
    page: currentPage,
    limit: pageSize,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  });

  const { data: recentOrders } = trpc.clientOrders.recent.useQuery<OrdersResponse>();

  const cancelOrder = trpc.clientOrders.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success(t('pages.profile.orders.order_cancelled'));
      setShowOrderDetail(false);
      setSelectedOrder(null);
      refetch();
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'Failed to cancel order';
      toast.error(errorMessage);
    }
  });

  const getStatusColor = (status: string) => {
    return status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'PROCESSING': return <Package className="w-4 h-4" />;
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status;
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCancelOrder = (reason: string) => {
    if (selectedOrder) {
      cancelOrder.mutate({
        id: selectedOrder.id,
        reason
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  const columns: TableColumn<Order>[] = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      render: (value, order) => (
        <span className="font-medium text-gray-900 dark:text-white">
          #{value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value} variant="order" />
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value} variant="payment" />
      )
    },
    {
      key: 'orderDate',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </span>
      )
    },
    {
      key: 'itemCount',
      label: 'Items',
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value} {value === 1 ? 'item' : 'items'}
        </span>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total',
      sortable: true,
      render: (value, order) => (
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatCurrency(value, order.currency)}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (value, order) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewOrder(order);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const statusOptions: FilterOption[] = [
    { value: 'PENDING', label: t('pages.profile.orders.status_pending') },
    { value: 'CONFIRMED', label: t('pages.profile.orders.status_confirmed') },
    { value: 'PROCESSING', label: t('pages.profile.orders.status_processing') },
    { value: 'SHIPPED', label: t('pages.profile.orders.status_shipped') },
    { value: 'DELIVERED', label: t('pages.profile.orders.status_delivered') },
    { value: 'CANCELLED', label: t('pages.profile.orders.status_cancelled') },
  ];

  return (
    <>
      <Helmet>
        <title>{t('profile.pages.orders.title')}</title>
        <meta name="description" content={t('profile.pages.orders.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout activeSection="orders">
          <div className="space-y-6">
            {/* Header */}
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-0">
                        {t('pages.profile.orders.title')}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-0">
                        {t('pages.profile.orders.subtitle')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => refetch()}
                      disabled={isLoading}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <Package className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Order Statistics */}
            <OrderStats
              totalOrders={ordersData?.total || 0}
              totalSpent={ordersData?.items?.reduce((sum, order) => sum + order.totalAmount, 0) || 0}
              pendingOrders={ordersData?.items?.filter(order => order.status === 'PENDING').length || 0}
              deliveredOrders={ordersData?.items?.filter(order => order.status === 'DELIVERED').length || 0}
              inTransitOrders={ordersData?.items?.filter(order => order.status === 'SHIPPED').length || 0}
              currency="USD"
            />

            {/* Recent Orders */}
            {recentOrders?.items && recentOrders.items.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('pages.profile.orders.recent_orders')}
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentOrders.items.slice(0, 3).map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onViewOrder={handleViewOrder}
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Filters and Search */}
            <Card>
              <CardBody>
                <SearchFilter
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder={t('pages.profile.orders.search_orders')}
                  filterValue={statusFilter}
                  onFilterChange={handleStatusFilterChange}
                  filterOptions={statusOptions}
                  filterPlaceholder={t('pages.profile.orders.all_statuses')}
                />
              </CardBody>
            </Card>

            {/* Orders List */}
            {viewMode === 'table' ? (
              <Table
                data={ordersData?.items || []}
                columns={columns}
                loading={isLoading}
                emptyMessage={t('pages.profile.orders.no_orders')}
                emptyDescription={t('pages.profile.orders.no_orders_desc')}
                onRowClick={handleViewOrder}
                onSort={handleSortChange}
                sortColumn={sortBy}
                sortDirection={sortOrder}
                keyExtractor={(order) => order.id}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ordersData?.items?.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewOrder={handleViewOrder}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {ordersData?.pagination && ordersData.pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={ordersData.pagination.totalPages}
                total={ordersData.pagination.total}
                limit={ordersData.pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </ProfileLayout>
      </Layout>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedOrder.status)}
                      <StatusBadge status={selectedOrder.status} variant="order" />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                    <div className="mt-1">
                      <StatusBadge status={selectedOrder.paymentStatus} variant="payment" />
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Date</span>
                  <div className="text-gray-900 dark:text-white">
                    {formatDate(selectedOrder.orderDate)}
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Items</span>
                  <div className="space-y-2 mt-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.product?.name || 'Product'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity} × {formatCurrency(item.price, selectedOrder.currency)}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.total, selectedOrder.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shipping Address</span>
                    <div className="text-gray-900 dark:text-white mt-1">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      <br />
                      {selectedOrder.shippingAddress.address1}
                      <br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      <br />
                      {selectedOrder.shippingAddress.country}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedOrder.status === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for cancellation:');
                        if (reason) handleCancelOrder(reason);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}