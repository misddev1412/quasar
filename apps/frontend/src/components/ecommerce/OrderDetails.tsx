import React from 'react';
import { Button, Card, Divider, Chip, Image } from '@heroui/react';
import { Link } from 'react-router-dom';
import { PriceDisplay } from './PriceDisplay';
import { Order, OrderItem } from './OrderHistory';

interface OrderDetailsProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onReturnOrder?: (orderId: string) => void;
  onDownloadInvoice?: (orderId: string) => void;
  className?: string;
  showActions?: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onReorder,
  onCancelOrder,
  onReturnOrder,
  onDownloadInvoice,
  className = '',
  showActions = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const renderOrderTimeline = () => {
    const timelineSteps = [
      { status: 'pending', label: 'Order Placed', date: order.orderDate, completed: true },
      { status: 'processing', label: 'Processing', date: order.orderDate, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
      { status: 'shipped', label: 'Shipped', date: order.orderDate, completed: ['shipped', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Delivered', date: order.estimatedDelivery || order.orderDate, completed: order.status === 'delivered' },
    ];

    if (order.status === 'cancelled') {
      timelineSteps.push({ status: 'cancelled', label: 'Cancelled', date: order.orderDate, completed: true });
    }

    if (order.status === 'refunded') {
      timelineSteps.push({ status: 'refunded', label: 'Refunded', date: order.orderDate, completed: true });
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {timelineSteps.map((step, index) => (
              <div key={step.status} className="relative flex items-start">
                {/* Timeline Dot */}
                <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                
                {/* Timeline Content */}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(step.date)}
                    </span>
                  </div>
                  
                  {step.status === order.status && (
                    <Chip size="sm" color={getStatusColor(order.status)} className="mt-1">
                      {getStatusText(order.status)}
                    </Chip>
                  )}
                  
                  {step.status === 'shipped' && order.trackingNumber && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Tracking Number: </span>
                      <span className="font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                  
                  {step.status === 'delivered' && order.estimatedDelivery && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Estimated Delivery: </span>
                      <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
          <div className="flex items-center gap-3">
            <Chip size="sm" color={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Chip>
            <p className="text-gray-600">Placed on {formatDate(order.orderDate)}</p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2 mt-4 md:mt-0">
            {onDownloadInvoice && (
              <Button
                size="sm"
                variant="flat"
                startContent={<span className="text-lg">📄</span>}
                onPress={() => onDownloadInvoice(order.id)}
              >
                Invoice
              </Button>
            )}
            
            {onReorder && (
              <Button
                size="sm"
                color="primary"
                onPress={() => onReorder(order.id)}
              >
                Reorder
              </Button>
            )}
          </div>
        )}
      </div>
      
      <Divider className="my-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Order Items ({order.items.length})</h3>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 w-16 h-16">
                  <Image
                    src={item.productImage || '/placeholder-product.png'}
                    alt={item.productName}
                    className="w-full h-full object-cover rounded-md"
                    removeWrapper
                  />
                </div>
                
                <div className="flex-1">
                  <Link 
                    to={`/products/${item.productSlug}`}
                    className="font-medium text-gray-900 hover:text-primary-500 transition-colors"
                  >
                    {item.productName}
                  </Link>
                  
                  {item.variant && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <PriceDisplay price={order.subtotal} />
              </div>
              
              {order.discount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <PriceDisplay price={order.shippingCost} />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <PriceDisplay price={order.tax} />
              </div>
              
              <Divider className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <PriceDisplay price={order.total} size="lg" />
              </div>
            </div>
            
            <Divider className="my-4" />
            
            <div className="space-y-3">
              <h4 className="font-medium">Payment Method</h4>
              <p className="text-sm text-gray-600">{order.paymentMethod}</p>
              
              <h4 className="font-medium mt-4">Shipping Address</h4>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.address1}<br />
                {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Order Timeline */}
      {renderOrderTimeline()}
      
      {/* Order Actions */}
      {showActions && (
        <div className="mt-8 flex flex-wrap gap-3">
          {(order.status === 'pending' || order.status === 'processing') && onCancelOrder && (
            <Button
              variant="flat"
              color="danger"
              onPress={() => onCancelOrder(order.id)}
            >
              Cancel Order
            </Button>
          )}
          
          {order.status === 'delivered' && onReturnOrder && (
            <Button
              variant="flat"
              color="warning"
              onPress={() => onReturnOrder(order.id)}
            >
              Return Items
            </Button>
          )}
          
          {onReorder && (
            <Button
              color="primary"
              onPress={() => onReorder(order.id)}
            >
              Reorder All Items
            </Button>
          )}
          
          <Button
            variant="flat"
            as={Link}
            to="/"
          >
            Continue Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;