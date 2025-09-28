'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, Package, Truck, AlertTriangle } from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'payment' | 'default';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, variant = 'default', showIcon = true, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string, variant: string) => {
    const statusLower = status.toLowerCase();

    switch (variant) {
      case 'order':
        switch (statusLower) {
          case 'pending':
            return {
              color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
              icon: Clock
            };
          case 'confirmed':
            return {
              color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              icon: CheckCircle
            };
          case 'processing':
            return {
              color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              icon: Package
            };
          case 'shipped':
            return {
              color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
              icon: Truck
            };
          case 'delivered':
            return {
              color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
              icon: CheckCircle
            };
          case 'cancelled':
            return {
              color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              icon: XCircle
            };
          case 'returned':
            return {
              color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
              icon: AlertTriangle
            };
          case 'refunded':
            return {
              color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
              icon: AlertTriangle
            };
          default:
            return {
              color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
              icon: Package
            };
        }

      case 'payment':
        switch (statusLower) {
          case 'paid':
            return {
              color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
              icon: CheckCircle
            };
          case 'partially_paid':
            return {
              color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
              icon: Clock
            };
          case 'pending':
            return {
              color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
              icon: Clock
            };
          case 'failed':
            return {
              color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              icon: XCircle
            };
          case 'refunded':
            return {
              color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
              icon: AlertTriangle
            };
          case 'cancelled':
            return {
              color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              icon: XCircle
            };
          default:
            return {
              color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
              icon: AlertTriangle
            };
        }

      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: AlertTriangle
        };
    }
  };

  const config = getStatusConfig(status, variant);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${config.color} ${className}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
}