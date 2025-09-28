'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Package, DollarSign, Clock, CheckCircle, Truck } from 'lucide-react';

interface OrderStatsProps {
  totalOrders?: number;
  totalSpent?: number;
  pendingOrders?: number;
  deliveredOrders?: number;
  inTransitOrders?: number;
  currency?: string;
  className?: string;
}

export function OrderStats({
  totalOrders = 0,
  totalSpent = 0,
  pendingOrders = 0,
  deliveredOrders = 0,
  inTransitOrders = 0,
  currency = 'USD',
  className = ''
}: OrderStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const stats = [
    {
      icon: Package,
      label: 'Total Orders',
      value: totalOrders.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      icon: DollarSign,
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: Clock,
      label: 'Pending',
      value: pendingOrders.toString(),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      icon: CheckCircle,
      label: 'Delivered',
      value: deliveredOrders.toString(),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: Truck,
      label: 'In Transit',
      value: inTransitOrders.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border border-gray-200 dark:border-gray-700">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}