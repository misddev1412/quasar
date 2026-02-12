export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  companyName?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface CustomersListResponse {
  data?: {
    items?: Customer[];
    total?: number;
  };
}

export interface CustomersStatsData {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  vipCustomers: number;
  averageOrderValue: number;
  averageCustomerLifetime: number;
}

export interface CustomersStatsResponse {
  data?: CustomersStatsData;
}
