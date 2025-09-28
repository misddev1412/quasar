'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Loading } from '../utility/Loading';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  onSort?: (column: keyof T, direction: 'ASC' | 'DESC') => void;
  sortColumn?: keyof T;
  sortDirection?: 'ASC' | 'DESC';
  rowClassName?: (item: T) => string;
  keyExtractor?: (item: T) => string;
}

export function Table<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  emptyDescription = 'There are no items to display',
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  rowClassName,
  keyExtractor = (item, index) => (item as any).id || index.toString()
}: TableProps<T>) {
  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <Loading size="md" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <div className="w-16 h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {emptyMessage}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              {emptyDescription}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const handleSort = (column: TableColumn<T>) => {
    if (column.sortable && onSort) {
      const direction = sortColumn === column.key && sortDirection === 'DESC' ? 'ASC' : 'DESC';
      onSort(column.key, direction);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white ${column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
                    onClick={() => column.sortable && handleSort(column)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <svg
                          className={`w-4 h-4 ${sortColumn === column.key ? 'text-blue-600' : 'text-gray-400'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              sortColumn === column.key && sortDirection === 'ASC'
                                ? 'M5 15l7-7 7 7'
                                : 'M19 9l-7 7-7-7'
                            }
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName?.(item) || ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={`px-4 py-3 text-sm ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render((item as any)[column.key], item)
                        : (item as any)[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}