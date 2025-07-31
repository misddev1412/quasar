import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatisticsGrid, StatisticData } from '../StatisticsGrid';
import { FiUsers, FiUserCheck } from 'react-icons/fi';

const mockStatistics: StatisticData[] = [
  {
    id: 'total-users',
    title: 'Total Users',
    value: 1234,
    icon: <FiUsers data-testid="total-users-icon" />,
  },
  {
    id: 'active-users',
    title: 'Active Users',
    value: 987,
    icon: <FiUserCheck data-testid="active-users-icon" />,
    trend: {
      value: 15,
      isPositive: true,
      label: 'vs last month'
    }
  }
];

describe('StatisticsGrid', () => {
  it('renders statistics cards correctly', () => {
    render(<StatisticsGrid statistics={mockStatistics} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByTestId('total-users-icon')).toBeInTheDocument();

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('987')).toBeInTheDocument();
    expect(screen.getByTestId('active-users-icon')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    render(<StatisticsGrid statistics={[]} isLoading={true} skeletonCount={3} />);

    // Should show 3 skeleton components
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);

    // Should not show any actual statistics
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
  });

  it('shows empty state when no statistics available', () => {
    render(<StatisticsGrid statistics={[]} />);

    expect(screen.getByText('No statistics available')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatisticsGrid statistics={mockStatistics} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses responsive grid classes', () => {
    const { container } = render(<StatisticsGrid statistics={mockStatistics} />);

    expect(container.firstChild).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4'
    );
  });
});
