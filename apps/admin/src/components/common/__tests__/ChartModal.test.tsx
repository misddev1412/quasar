import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChartModal } from '../ChartModal';
import { trpc } from '@admin/utils/trpc';

// Mock the tRPC client
jest.mock('@admin/utils/trpc', () => ({
  trpc: {
    adminChartData: {
      getChartData: {
        useQuery: jest.fn(),
      },
    },
  },
}));

// Mock the chart components
jest.mock('../charts/ChartContainer', () => ({
  ChartContainer: ({ data }: any) => (
    <div data-testid="chart-container">
      Chart: {data?.title || 'No data'}
    </div>
  ),
}));

jest.mock('../charts/ChartTypeSelector', () => ({
  ChartTypeSelector: ({ selectedType, onTypeChange }: any) => (
    <div data-testid="chart-type-selector">
      <button onClick={() => onTypeChange('line')}>Line</button>
      <button onClick={() => onTypeChange('bar')}>Bar</button>
      <span>Selected: {selectedType}</span>
    </div>
  ),
}));

jest.mock('../charts/DateRangePicker', () => ({
  DateRangePicker: ({ period, onPeriodChange }: any) => (
    <div data-testid="date-range-picker">
      <button onClick={() => onPeriodChange('7d')}>7 Days</button>
      <button onClick={() => onPeriodChange('30d')}>30 Days</button>
      <span>Selected: {period}</span>
    </div>
  ),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ChartModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    statisticId: 'total-users',
    title: 'Total Users',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByText('Total Users - Chart View')).toBeInTheDocument();
    expect(screen.getByTestId('chart-type-selector')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText('Total Users - Chart View')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    const mockRefetch = jest.fn();
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to load data',
      refetch: mockRefetch,
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders chart when data is available', () => {
    const mockChartData = {
      type: 'line',
      title: 'Total Users Growth',
      data: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 },
      ],
      period: '30d',
    };

    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: { success: true, data: mockChartData },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByText('Chart: Total Users Growth')).toBeInTheDocument();
  });

  it('handles chart type changes', async () => {
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByText('Selected: line')).toBeInTheDocument();

    const barButton = screen.getByText('Bar');
    fireEvent.click(barButton);

    await waitFor(() => {
      expect(screen.getByText('Selected: bar')).toBeInTheDocument();
    });
  });

  it('handles period changes', async () => {
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByText('Selected: 30d')).toBeInTheDocument();

    const sevenDaysButton = screen.getByText('7 Days');
    fireEvent.click(sevenDaysButton);

    await waitFor(() => {
      expect(screen.getByText('Selected: 7d')).toBeInTheDocument();
    });
  });

  it('shows no data message when chart data is empty', () => {
    (trpc.adminChartData.getChartData.useQuery as jest.Mock).mockReturnValue({
      data: { success: true, data: null },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<ChartModal {...mockProps} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
