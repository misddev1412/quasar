export type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ExportJobFormat = 'csv' | 'json';

export interface ExportJobItem {
  id: string;
  resource: string;
  status: ExportJobStatus;
  format: ExportJobFormat;
  fileUrl?: string | null;
  fileName?: string | null;
  totalRecords?: number | null;
  createdAt: string | Date;
  completedAt?: string | Date | null;
}

export interface ExportJobsListResponse {
  data?:
    | ExportJobItem[]
    | {
        items?: ExportJobItem[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };
}

export interface ExportEstimateResponse {
  data?: {
    total?: number;
  };
}
