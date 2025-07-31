export type ChartType = 'line' | 'bar' | 'pie' | 'area';

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ChartData {
  type: ChartType;
  title: string;
  data: ChartDataPoint[] | PieChartDataPoint[];
  period: TimePeriod;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  statisticId: string;
  title: string;
  initialChartType?: ChartType;
}

export interface ChartContainerProps {
  data: ChartData;
  isLoading?: boolean;
  error?: string;
  height?: number;
}

export interface DateRangePickerProps {
  period: TimePeriod;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
  onPeriodChange: (period: TimePeriod) => void;
  onCustomDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onTypeChange: (type: ChartType) => void;
  availableTypes?: ChartType[];
}

// API request/response types
export interface ChartDataRequest {
  statisticId: string;
  chartType: ChartType;
  period: TimePeriod;
  startDate?: string;
  endDate?: string;
}

export interface ChartDataResponse {
  success: boolean;
  data: ChartData;
  message?: string;
}
