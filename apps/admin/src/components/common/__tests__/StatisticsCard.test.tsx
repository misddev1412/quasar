import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatisticsCard, StatisticsSkeleton } from '../StatisticsCard';
import { FiUsers } from 'react-icons/fi';

// Mock the ChartModal component
jest.mock('../ChartModal', () => ({
  ChartModal: ({ isOpen, title }: any) =>
    isOpen ? <div data-testid="chart-modal">Chart Modal: {title}</div> : null,
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

describe('StatisticsCard', () => {
  it('renders basic statistics card correctly', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Total Users"
        value={1234}
        icon={<FiUsers data-testid="icon" />}
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Status"
        value="Active"
        icon={<FiUsers />}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders trend information when provided', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="New Users"
        value={50}
        icon={<FiUsers />}
        trend={{
          value: 25,
          isPositive: true,
          label: 'vs last month'
        }}
      />
    );

    expect(screen.getByText('New Users')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders negative trend correctly', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Active Sessions"
        value={100}
        icon={<FiUsers />}
        trend={{
          value: -10,
          isPositive: false,
          label: 'vs yesterday'
        }}
      />
    );

    expect(screen.getByText('-10%')).toBeInTheDocument();
    expect(screen.getByText('vs yesterday')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Total Users"
        value={1234}
        icon={<FiUsers />}
        isLoading={true}
      />
    );

    // Should not show the actual content when loading
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
    expect(screen.queryByText('1,234')).not.toBeInTheDocument();
  });

  it('shows chart icon when enableChart is true', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Total Users"
        value={1234}
        icon={<FiUsers />}
        enableChart={true}
        statisticId="total-users"
      />
    );

    const chartButton = screen.getByRole('button', { name: /view chart/i });
    expect(chartButton).toBeInTheDocument();
  });

  it('does not show chart icon when enableChart is false', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Total Users"
        value={1234}
        icon={<FiUsers />}
        enableChart={false}
      />
    );

    const chartButton = screen.queryByRole('button', { name: /view chart/i });
    expect(chartButton).not.toBeInTheDocument();
  });

  it('opens chart modal when chart icon is clicked', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Total Users"
        value={1234}
        icon={<FiUsers />}
        enableChart={true}
        statisticId="total-users"
      />
    );

    const chartButton = screen.getByRole('button', { name: /view chart/i });
    fireEvent.click(chartButton);

    expect(screen.getByTestId('chart-modal')).toBeInTheDocument();
    expect(screen.getByText('Chart Modal: Total Users')).toBeInTheDocument();
  });

  it('does not show chart icon when statisticId is missing', () => {
    renderWithQueryClient(
      <StatisticsCard
        title="Total Users"
        value={1234}
        icon={<FiUsers />}
        enableChart={true}
        // statisticId is missing
      />
    );

    const chartButton = screen.queryByRole('button', { name: /view chart/i });
    expect(chartButton).not.toBeInTheDocument();
  });
});

describe('StatisticsSkeleton', () => {
  it('renders skeleton correctly', () => {
    const { container } = render(<StatisticsSkeleton />);
    
    // Check for skeleton animation class
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
