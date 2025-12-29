export type SectionMetricCategory = 'orders' | 'customers';

export type SectionMetricFormat = 'number' | 'currency' | 'percentage';

export interface SectionMetricOrderStatsSnapshot {
  totalOrders?: number;
  totalRevenue?: number;
  averageOrderValue?: number;
  recentOrders?: number;
  recentRevenue?: number;
  statusStats?: Record<string, number>;
}

export interface SectionMetricCustomerStatsSnapshot {
  totalCustomers?: number;
  activeCustomers?: number;
  newCustomersThisMonth?: number;
  vipCustomers?: number;
  averageOrderValue?: number;
  averageCustomerLifetime?: number;
}

export interface SectionMetricResolverContext {
  orders?: SectionMetricOrderStatsSnapshot | null;
  customers?: SectionMetricCustomerStatsSnapshot | null;
}

export interface SectionMetricDefinition {
  id: string;
  category: SectionMetricCategory;
  i18nKey: string;
  descriptionKey?: string;
  defaultPrefix?: string;
  defaultSuffix?: string;
  format?: SectionMetricFormat;
  resolver: (context: SectionMetricResolverContext) => number | null | undefined;
}

const safeNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return value;
};

const statusValue = (
  statusStats: Record<string, number> | undefined,
  status: string
): number | null => {
  if (!statusStats) {
    return null;
  }
  const value = statusStats[status];
  return typeof value === 'number' ? value : null;
};

export const SECTION_STATS_METRICS: SectionMetricDefinition[] = [
  {
    id: 'orders.totalOrders',
    category: 'orders',
    i18nKey: 'orders.totalOrders',
    format: 'number',
    defaultSuffix: '+',
    resolver: ({ orders }) => safeNumber(orders?.totalOrders ?? statusValue(orders?.statusStats, 'DELIVERED')),
  },
  {
    id: 'orders.deliveredOrders',
    category: 'orders',
    i18nKey: 'orders.deliveredOrders',
    format: 'number',
    defaultSuffix: '+',
    resolver: ({ orders }) => statusValue(orders?.statusStats, 'DELIVERED'),
  },
  {
    id: 'orders.totalRevenue',
    category: 'orders',
    i18nKey: 'orders.totalRevenue',
    format: 'currency',
    resolver: ({ orders }) => safeNumber(orders?.totalRevenue),
  },
  {
    id: 'orders.averageOrderValue',
    category: 'orders',
    i18nKey: 'orders.averageOrderValue',
    format: 'currency',
    resolver: ({ orders }) => safeNumber(orders?.averageOrderValue),
  },
  {
    id: 'orders.recentOrders',
    category: 'orders',
    i18nKey: 'orders.recentOrders',
    format: 'number',
    resolver: ({ orders }) => safeNumber(orders?.recentOrders),
  },
  {
    id: 'orders.recentRevenue',
    category: 'orders',
    i18nKey: 'orders.recentRevenue',
    format: 'currency',
    resolver: ({ orders }) => safeNumber(orders?.recentRevenue),
  },
  {
    id: 'customers.totalCustomers',
    category: 'customers',
    i18nKey: 'customers.totalCustomers',
    format: 'number',
    defaultSuffix: '+',
    resolver: ({ customers }) => safeNumber(customers?.totalCustomers),
  },
  {
    id: 'customers.activeCustomers',
    category: 'customers',
    i18nKey: 'customers.activeCustomers',
    format: 'number',
    resolver: ({ customers }) => safeNumber(customers?.activeCustomers),
  },
  {
    id: 'customers.newCustomersThisMonth',
    category: 'customers',
    i18nKey: 'customers.newCustomersThisMonth',
    format: 'number',
    resolver: ({ customers }) => safeNumber(customers?.newCustomersThisMonth),
  },
  {
    id: 'customers.vipCustomers',
    category: 'customers',
    i18nKey: 'customers.vipCustomers',
    format: 'number',
    resolver: ({ customers }) => safeNumber(customers?.vipCustomers),
  },
  {
    id: 'customers.averageOrderValue',
    category: 'customers',
    i18nKey: 'customers.averageOrderValue',
    format: 'currency',
    resolver: ({ customers }) => safeNumber(customers?.averageOrderValue),
  },
  {
    id: 'customers.averageCustomerLifetime',
    category: 'customers',
    i18nKey: 'customers.averageCustomerLifetime',
    format: 'number',
    defaultSuffix: ' days',
    resolver: ({ customers }) => safeNumber(customers?.averageCustomerLifetime),
  },
];

export const getSectionMetricDefinition = (id?: string): SectionMetricDefinition | undefined =>
  SECTION_STATS_METRICS.find((metric) => metric.id === id);
