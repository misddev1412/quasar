import clsx from 'clsx';
import React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Loading } from './Loading';

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="rounded-r-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="rounded-l-none"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  pagination,
  emptyMessage = 'No data available',
  className,
  onRowClick,
}: TableProps<T>) {
  const renderCell = (item: T, column: Column<T>, index: number) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item, index);
    }
    return (item as any)[column.accessor];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loading />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="text-center p-8">
        <p>{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className={clsx('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={clsx({
                  'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800':
                    onRowClick,
                })}
              >
                {columns.map((col) => (
                  <td
                    key={`${item.id}-${col.header}`}
                    className={clsx(
                      'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200',
                      col.className
                    )}
                  >
                    {renderCell(item, col, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <Pagination {...pagination} />
        </div>
      )}
    </Card>
  );
} 