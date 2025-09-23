import React, { useState } from 'react';
import { Button, Card, Divider, Modal, Chip } from '@heroui/react';
import { Link } from 'react-router-dom';
import { OrderDetails } from './OrderDetails';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderHistoryProps {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
  onReorder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onReturnOrder?: (orderId: string) => void;
  className?: string;
  emptyMessage?: string;
  showPagination?: boolean;
  ordersPerPage?: number;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  loading = false,
  error = null,
  onReorder,
  onCancelOrder,
  onReturnOrder,
  className = '',
  emptyMessage = 'You haven\'t placed any orders yet.',
  showPagination = true,
  ordersPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleReorder = (orderId: string) => {
    if (onReorder) {
      onReorder(orderId);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (onCancelOrder) {
      onCancelOrder(orderId);
    }
  };

  const handleReturnOrder = (orderId: string) => {
    if (onReturnOrder) {
      onReturnOrder(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <Card key={`skeleton-${index}`} className="p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </Card>
    ));
  };

  if (loading) {
    return (
      <div className={className}>
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 font-medium">Error loading orders</div>
        <div className="text-gray-500 mt-1">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">📦</div>
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">{emptyMessage}</p>
        <Button color="primary" as={Link} to="/">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      
      <div className="space-y-4">
        {paginatedOrders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                  <Chip size="sm" color={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Chip>
                </div>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate)}</p>
              </div>
              
              <div className="text-right mt-2 md:mt-0">
                <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
              </div>
            </div>
            
            <Divider className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="text-sm">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                  {order.shippingAddress.address1}<br />
                  {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-sm">{order.paymentMethod}</p>
                
                {order.trackingNumber && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Tracking Number</p>
                    <p className="text-sm">{order.trackingNumber}</p>
                  </>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Order Summary</p>
                <p className="text-sm">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}<br />
                  Subtotal: ${order.subtotal.toFixed(2)}<br />
                  Shipping: ${order.shippingCost.toFixed(2)}<br />
                  Tax: ${order.tax.toFixed(2)}
                  {order.discount && (
                    <>Discount: -${order.discount.toFixed(2)}</>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => handleViewOrder(order)}
                >
                  View Details
                </Button>
                
                {order.status === 'delivered' && onReturnOrder && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="warning"
                    onPress={() => handleReturnOrder(order.id)}
                  >
                    Return
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {(order.status === 'pending' || order.status === 'processing') && onCancelOrder && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={() => handleCancelOrder(order.id)}
                  >
                    Cancel
                  </Button>
                )}
                
                {onReorder && (
                  <Button
                    size="sm"
                    color="primary"
                    onPress={() => handleReorder(order.id)}
                  >
                    Reorder
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              isDisabled={currentPage === 1}
              onPress={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? 'solid' : 'flat'}
                  color={currentPage === pageNum ? 'primary' : 'default'}
                  onPress={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              size="sm"
              variant="flat"
              isDisabled={currentPage === totalPages}
              onPress={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      <Modal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        size="4xl"
        scrollBehavior="inside"
      >
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onReorder={onReorder}
            onCancelOrder={onCancelOrder}
            onReturnOrder={onReturnOrder}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory;