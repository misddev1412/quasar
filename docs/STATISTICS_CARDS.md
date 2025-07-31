# Statistics Cards Implementation

This document describes the implementation of reusable statistics cards for the admin application.

## Overview

The statistics cards system provides a clean, professional way to display key metrics and statistics across different list pages in the admin application. The implementation includes:

- **StatisticsCard**: A reusable card component for displaying individual statistics
- **StatisticsGrid**: A responsive grid layout for arranging multiple statistics cards
- **Backend API**: Service and router for fetching statistics data
- **Integration**: Example implementation on the users list page

## Components

### StatisticsCard

A reusable card component that displays a single statistic with optional trend information.

**Props:**
- `title`: The statistic title/label
- `value`: The statistic value (number or string)
- `icon`: React icon component
- `isLoading`: Shows skeleton when true
- `className`: Additional CSS classes
- `trend`: Optional trend information with value, direction, and label

**Features:**
- Automatic number formatting with locale-aware separators
- Loading skeleton animation
- Trend indicators with positive/negative styling
- Dark/light theme support
- Hover effects

### StatisticsGrid

A responsive grid layout component for arranging multiple statistics cards.

**Props:**
- `statistics`: Array of StatisticData objects
- `isLoading`: Shows skeleton cards when true
- `className`: Additional CSS classes
- `skeletonCount`: Number of skeleton cards to show when loading

**Features:**
- Responsive grid layout (1-4 columns based on screen size)
- Loading state with configurable skeleton count
- Empty state handling
- Consistent spacing and alignment

## Backend Implementation

### AdminUserStatisticsService

Service class that calculates user statistics from the database.

**Methods:**
- `getUserStatistics()`: Returns formatted statistics with trends
- `calculateRawStatistics()`: Performs database queries for raw data
- `formatStatisticsWithTrends()`: Formats data and calculates trends

**Statistics Calculated:**
- Total users count
- Active users count
- New users this month (with trend vs last month)
- Users with profiles (with completion percentage)

### AdminUserStatisticsRouter

tRPC router that exposes the statistics API endpoint.

**Endpoints:**
- `getUserStatistics`: Query endpoint for fetching user statistics

**Features:**
- Admin authentication required
- Proper error handling
- Response validation with Zod schemas

## Usage Example

### Basic Implementation

```tsx
import { StatisticsGrid, StatisticData } from '@admin/components/common/StatisticsGrid';
import { FiUsers, FiUserCheck } from 'react-icons/fi';

const MyPage = () => {
  const { data, isLoading } = trpc.adminUserStatistics.getUserStatistics.useQuery();
  
  const statistics: StatisticData[] = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: data?.totalUsers.value || 0,
      icon: <FiUsers className="w-5 h-5" />,
      trend: data?.totalUsers.trend,
    },
    // ... more statistics
  ];

  return (
    <div>
      <StatisticsGrid
        statistics={statistics}
        isLoading={isLoading}
        skeletonCount={4}
      />
      {/* Rest of your page content */}
    </div>
  );
};
```

### Individual Card Usage

```tsx
import { StatisticsCard } from '@admin/components/common/StatisticsCard';
import { FiUsers } from 'react-icons/fi';

<StatisticsCard
  title="Total Users"
  value={1234}
  icon={<FiUsers className="w-5 h-5" />}
  trend={{
    value: 15,
    isPositive: true,
    label: 'vs last month'
  }}
/>
```

## Styling and Theming

The components use Tailwind CSS classes and support both light and dark themes:

- **Light theme**: Gray backgrounds with dark text
- **Dark theme**: Dark backgrounds with light text
- **Hover effects**: Subtle shadow transitions
- **Loading states**: Animated pulse skeletons

## Responsive Design

The grid layout adapts to different screen sizes:

- **Mobile (default)**: 1 column
- **Small screens (sm)**: 2 columns
- **Large screens (lg)**: 3 columns
- **Extra large (xl)**: 4 columns

## Adding Statistics to Other Pages

To add statistics to other list pages:

1. **Create API endpoint** (if needed):
   - Add service method for calculating statistics
   - Add tRPC router endpoint
   - Update type definitions in `app-router.ts`

2. **Implement in component**:
   - Import StatisticsGrid and StatisticData
   - Add tRPC query for statistics
   - Map data to StatisticData format
   - Add StatisticsGrid to JSX

3. **Choose appropriate icons**:
   - Use react-icons/fi (Feather Icons) for consistency
   - Size icons with `w-5 h-5` classes

## Testing

The implementation includes comprehensive tests:

- **StatisticsCard.test.tsx**: Tests for individual card component
- **StatisticsGrid.test.tsx**: Tests for grid layout component

Run tests with:
```bash
npm test -- StatisticsCard
npm test -- StatisticsGrid
```

## Performance Considerations

- **Parallel queries**: Database statistics are calculated in parallel
- **Caching**: tRPC queries can be cached for better performance
- **Skeleton loading**: Provides immediate feedback while data loads
- **Responsive images**: Icons are SVG-based for crisp display

## Future Enhancements

Potential improvements for the statistics system:

1. **Real-time updates**: WebSocket integration for live statistics
2. **Time range selection**: Allow users to select different time periods
3. **Export functionality**: Export statistics data to CSV/PDF
4. **Drill-down capability**: Click statistics to view detailed breakdowns
5. **Comparison views**: Compare statistics across different time periods
