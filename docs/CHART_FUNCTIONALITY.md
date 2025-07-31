# Chart Functionality Implementation

This document describes the implementation of interactive chart functionality for the StatisticsCard component in the admin application.

## Overview

The chart functionality enhances the existing StatisticsCard component by adding:

- **Chart Icon**: A clickable chart icon that opens a modal with interactive charts
- **Chart Modal**: A responsive modal displaying various chart types
- **Multiple Chart Types**: Support for line, bar, pie, and area charts
- **Time Period Filtering**: Date range selection with presets and custom ranges
- **Backend Integration**: API endpoints for fetching chart data
- **Theme Support**: Compatible with light and dark themes

## Components

### Enhanced StatisticsCard

The StatisticsCard component now includes:

**New Props:**
- `enableChart?: boolean` - Enables the chart icon and functionality
- `statisticId?: string` - Unique identifier for the statistic (used for API calls)

**Features:**
- Chart icon appears in the top-right corner when enabled
- Hover effects and accessibility support
- Maintains existing functionality (trends, loading states, etc.)

### ChartModal

A comprehensive modal component for displaying charts.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler
- `statisticId: string` - Statistic identifier
- `title: string` - Chart title
- `initialChartType?: ChartType` - Default chart type

**Features:**
- Responsive design (mobile-friendly)
- Chart type selector
- Date range picker with presets
- Loading states and error handling
- Retry functionality

### Chart Components

#### ChartContainer
Main wrapper component that renders the appropriate chart based on type.

#### Individual Chart Components
- **LineChart**: Time series data with trend lines
- **BarChart**: Comparative data visualization
- **PieChart**: Proportional data with percentages
- **AreaChart**: Cumulative trends with filled areas

**Common Features:**
- Responsive design using Recharts
- Custom tooltips with formatted data
- Theme-aware colors
- Accessibility support
- Interactive legends

### Chart Controls

#### ChartTypeSelector
Allows users to switch between different chart types.

**Features:**
- Visual icons for each chart type
- Descriptive tooltips
- Keyboard navigation support

#### DateRangePicker
Provides time period selection functionality.

**Presets:**
- 7 Days
- 30 Days
- 90 Days
- 1 Year
- Custom Range

**Features:**
- Date validation
- Custom date range inputs
- Responsive layout

## Backend Implementation

### AdminChartDataService

Service class that generates chart data from database queries.

**Methods:**
- `getChartData(request)`: Returns formatted chart data
- `getAvailableChartTypes(statisticId)`: Returns supported chart types

**Supported Statistics:**
- `total-users`: User growth over time
- `active-users`: Active user trends
- `new-users`: New user registrations
- `users-with-profiles`: Profile completion data

**Chart Type Support:**
- Line/Bar/Area charts: Time series data
- Pie charts: Categorical distributions

### AdminChartDataRouter

tRPC router exposing chart data endpoints.

**Endpoints:**
- `getChartData`: Fetch chart data with filtering
- `getAvailableChartTypes`: Get supported chart types

**Features:**
- Admin authentication required
- Input validation with Zod schemas
- Proper error handling
- Response formatting

## API Integration

### Custom Hook: useChartData

React hook for fetching chart data with caching and error handling.

**Features:**
- Automatic refetching on parameter changes
- Caching with stale-time management
- Retry logic with exponential backoff
- Loading and error states

**Usage:**
```tsx
const { data, isLoading, error, refetch } = useChartData({
  statisticId: 'total-users',
  chartType: 'line',
  period: '30d',
  enabled: true,
});
```

## Usage Examples

### Basic Implementation

```tsx
import { StatisticsGrid, StatisticData } from '@admin/components/common/StatisticsGrid';

const statistics: StatisticData[] = [
  {
    id: 'total-users',
    title: 'Total Users',
    value: 1234,
    icon: <FiUsers className="w-5 h-5" />,
    enableChart: true, // Enable chart functionality
  },
];

<StatisticsGrid statistics={statistics} />
```

### Individual Card with Chart

```tsx
import { StatisticsCard } from '@admin/components/common/StatisticsCard';

<StatisticsCard
  title="Total Users"
  value={1234}
  icon={<FiUsers className="w-5 h-5" />}
  enableChart={true}
  statisticId="total-users"
  trend={{
    value: 15,
    isPositive: true,
    label: 'vs last month'
  }}
/>
```

## Styling and Theming

The chart components follow the existing design system:

- **Colors**: Uses the application's color palette
- **Typography**: Consistent with existing components
- **Spacing**: Follows Tailwind CSS spacing scale
- **Dark Mode**: Automatic theme switching support

## Dependencies

### New Dependencies Added
- `recharts`: React charting library
- `date-fns`: Date manipulation utilities

### Existing Dependencies Used
- `@radix-ui/react-dialog`: Modal functionality
- `lucide-react`: Icons
- `tailwindcss`: Styling
- `@tanstack/react-query`: Data fetching

## Performance Considerations

- **Lazy Loading**: Charts only load when modal is opened
- **Data Caching**: Chart data is cached to reduce API calls
- **Responsive Rendering**: Charts adapt to container size
- **Memory Management**: Proper cleanup of chart instances

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: Meets WCAG guidelines
- **Focus Management**: Proper focus handling in modals

## Future Enhancements

Potential improvements for future iterations:

1. **Export Functionality**: Export charts as images or PDF
2. **Real-time Updates**: WebSocket integration for live data
3. **Drill-down Capability**: Click charts to view detailed data
4. **Comparison Views**: Compare multiple time periods
5. **Custom Chart Types**: Additional visualization options
6. **Data Annotations**: Add notes and markers to charts

## Testing

The implementation includes:

- **Unit Tests**: Component testing with Jest and React Testing Library
- **Integration Tests**: API endpoint testing
- **Visual Tests**: Chart rendering verification
- **Accessibility Tests**: Screen reader and keyboard navigation

## Troubleshooting

### Common Issues

1. **Charts not loading**: Check API connectivity and authentication
2. **Date range errors**: Verify date format and range validity
3. **Performance issues**: Check data size and caching configuration
4. **Theme inconsistencies**: Verify CSS variable definitions

### Debug Mode

Enable debug logging by setting:
```typescript
// In development environment
const DEBUG_CHARTS = process.env.NODE_ENV === 'development';
```
