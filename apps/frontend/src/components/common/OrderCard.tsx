'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Eye, Package, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { formatCurrencyValue } from '../../utils/currency';

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

interface OrderCardProps {
  order: Order;
  onViewOrder: (order: Order) => void;
  className?: string;
}

export function OrderCard({ order, onViewOrder, className = '' }: OrderCardProps) {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount: number, currencyCode: string) =>
    formatCurrencyValue(amount, { currency: currencyCode || 'USD' });

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 ${className}`}
      onClick={() => onViewOrder(order)}
    >
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  #{order.orderNumber}
                </span>
              </div>
              <StatusBadge status={order.status} variant="order" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(order.orderDate)}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge
                    status={order.paymentStatus}
                    variant="payment"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewOrder(order);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
