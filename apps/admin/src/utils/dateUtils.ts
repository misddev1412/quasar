/**
 * Date utility functions for quick filters
 */

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get start of day (00:00:00)
 */
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day (23:59:59)
 */
export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Get start of week (Monday)
 */
export const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  newDate.setDate(diff);
  return getStartOfDay(newDate);
};

/**
 * Get end of week (Sunday)
 */
export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return getEndOfDay(endOfWeek);
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(1);
  return getStartOfDay(newDate);
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1, 0); // Last day of current month
  return getEndOfDay(newDate);
};

/**
 * Get date range for quick filter options
 */
export const getQuickFilterDateRange = (filterType: string): DateRange => {
  const now = new Date();
  const today = getStartOfDay(now);
  
  switch (filterType) {
    case 'today':
      return {
        dateFrom: formatDateForInput(today),
        dateTo: formatDateForInput(getEndOfDay(now)),
      };
      
    case 'this_week':
      return {
        dateFrom: formatDateForInput(getStartOfWeek(now)),
        dateTo: formatDateForInput(getEndOfWeek(now)),
      };
      
    case 'this_month':
      return {
        dateFrom: formatDateForInput(getStartOfMonth(now)),
        dateTo: formatDateForInput(getEndOfMonth(now)),
      };
      
    case 'last_7_days':
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 6); // Include today, so -6 days
      return {
        dateFrom: formatDateForInput(last7Days),
        dateTo: formatDateForInput(getEndOfDay(now)),
      };
      
    case 'last_30_days':
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 29); // Include today, so -29 days
      return {
        dateFrom: formatDateForInput(last30Days),
        dateTo: formatDateForInput(getEndOfDay(now)),
      };

    case 'last_90_days':
      const last90Days = new Date(today);
      last90Days.setDate(today.getDate() - 89); // Include today, so -89 days
      return {
        dateFrom: formatDateForInput(last90Days),
        dateTo: formatDateForInput(getEndOfDay(now)),
      };

    case 'last_year':
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      return {
        dateFrom: formatDateForInput(lastYear),
        dateTo: formatDateForInput(getEndOfDay(now)),
      };
      
    default:
      return {
        dateFrom: '',
        dateTo: '',
      };
  }
};

/**
 * Quick filter options configuration for date ranges
 */
export const QUICK_FILTER_OPTIONS = [
  { key: 'today', translationKey: 'filters.date.today' },
  { key: 'this_week', translationKey: 'filters.date.this_week' },
  { key: 'this_month', translationKey: 'filters.date.this_month' },
  { key: 'last_7_days', translationKey: 'filters.date.last_7_days' },
  { key: 'last_30_days', translationKey: 'filters.date.last_30_days' },
  { key: 'last_90_days', translationKey: 'filters.date.last_90_days' },
  { key: 'last_year', translationKey: 'filters.date.last_year' },
] as const;

export type QuickFilterKey = typeof QUICK_FILTER_OPTIONS[number]['key'];
