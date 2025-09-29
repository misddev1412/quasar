// Common API response types

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  code: number;
  status: string;
  data: T;
  timestamp: string;
}

export interface PaginatedApiResponse<T = unknown> {
  code: number;
  status: string;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}