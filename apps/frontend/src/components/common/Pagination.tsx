'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  showSinglePage?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  showSinglePage = false,
  className = ''
}: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1 && !showSinglePage) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className={`flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('common.pagination.summary', {
          start: startItem,
          end: endItem,
          total,
        })}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {t('common.previous')}
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, safeTotalPages) }, (_, i) => {
            let pageNum;
            if (safeTotalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= safeTotalPages - 2) {
              pageNum = safeTotalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === safeTotalPages}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
