# User Filter Expansion Implementation

## Overview

The user management page at `/apps/admin/src/pages/users/index.tsx` has been expanded to support additional URL filter parameters beyond the basic `dateFrom`, `dateTo`, `page`, and `sort` parameters.

## Expanded Filter Parameters

### Original Filters
- `role` - UserRole enum (super_admin, admin, manager, user, guest)
- `isActive` - boolean (true/false)
- `dateFrom` - string (YYYY-MM-DD format)
- `dateTo` - string (YYYY-MM-DD format)
- `page` - number (pagination, excluded from filter expansion)
- `sortBy` - string (sorting field, excluded from filter expansion)
- `sortOrder` - string (asc/desc, excluded from filter expansion)

### New Expanded Filters
- `isVerified` - boolean (true/false) - User verification status
- `email` - string - Email domain or pattern filter (e.g., "@company.com")
- `username` - string - Username pattern filter
- `hasProfile` - boolean (true/false) - Users with/without complete profile
- `country` - string - Filter by country from user profile
- `city` - string - Filter by city from user profile
- `lastLoginFrom` - string (YYYY-MM-DD) - Last login date range start
- `lastLoginTo` - string (YYYY-MM-DD) - Last login date range end
- `createdFrom` - string (YYYY-MM-DD) - Alternative to dateFrom
- `createdTo` - string (YYYY-MM-DD) - Alternative to dateTo

## Implementation Details

### Files Modified

1. **`apps/admin/src/types/user.ts`**
   - Expanded `UserFiltersType` interface with new filter fields

2. **`apps/admin/src/pages/users/index.tsx`**
   - Added validation functions for new parameter types
   - Updated filter state initialization from URL parameters
   - Modified all URL update functions to include new filters
   - Enhanced query parameters sent to API

3. **`apps/admin/src/components/features/UserFilters.tsx`**
   - Added new filter UI components (Select, Input, DateInput)
   - Expanded filter summary display with color-coded filter tags
   - Updated date change handler to support new date fields

### URL Parameter Examples

#### Basic Usage (Original)
```
/users?dateFrom=2025-08-11&dateTo=2025-08-12&page=1&role=admin&isActive=true
```

#### Expanded Usage (New)
```
/users?dateFrom=2025-08-01&dateTo=2025-08-31&email=@company.com&username=admin&hasProfile=true&isVerified=false&country=United States&city=New York&lastLoginFrom=2025-08-10&lastLoginTo=2025-08-12&page=2&sortBy=email
```

#### Alternative Date Parameters
```
/users?createdFrom=2025-07-01&createdTo=2025-07-31&role=user&page=1
```

### Validation and Error Handling

- **Date Validation**: Uses regex pattern `/^\d{4}-\d{2}-\d{2}$/` for YYYY-MM-DD format
- **Boolean Validation**: Only accepts 'true' or 'false' strings
- **Role Validation**: Validates against UserRole enum values
- **String Validation**: Trims whitespace and filters empty strings
- **Fallback Logic**: `dateFrom`/`dateTo` take precedence over `createdFrom`/`createdTo`

### UI Components

#### Filter Grid Layout
- **Row 1**: Status, Role, Date From, Date To
- **Row 2**: Verification Status, Profile Status, Email Domain, Username Pattern
- **Row 3**: Country, City, Last Login From, Last Login To

#### Filter Summary Tags
Each active filter displays as a colored tag with:
- Filter name and value
- Remove button (X) to clear individual filters
- Color coding by filter type:
  - Green: Status (isActive)
  - Violet: Role
  - Amber: Registration dates
  - Blue: Verification status
  - Indigo: Profile status
  - Pink: Email filter
  - Cyan: Username filter
  - Teal: Country filter
  - Orange: City filter
  - Purple: Last login dates

### Backend Compatibility

The expanded filters are prepared for backend support but currently:
- Basic filters (`role`, `isActive`, `dateFrom`, `dateTo`) are sent to API
- Additional filters are included in query parameters for future backend implementation
- No breaking changes to existing API calls

### Testing

A test utility file has been created at `apps/admin/src/utils/filterExpansion.test.ts` that demonstrates:
- URL parameter parsing with various combinations
- Validation of different parameter types
- Handling of invalid parameters
- Priority handling for overlapping parameters

## Usage Examples

### Detecting URL Filters
The system automatically detects and applies URL parameters when the page loads:

```typescript
// URL: /users?dateFrom=2025-08-11&dateTo=2025-08-12&email=@company.com&hasProfile=true
// Results in filters:
{
  dateFrom: "2025-08-11",
  dateTo: "2025-08-12",
  email: "@company.com",
  hasProfile: true
}
```

### Filter State Management
All filters are synchronized with URL parameters:
- Changing filters updates the URL
- Browser back/forward navigation works correctly
- Direct URL access applies filters immediately
- Page refresh maintains filter state

## Future Enhancements

1. **Backend Integration**: Implement server-side filtering for new parameters
2. **Advanced Filters**: Add date range presets, multi-select options
3. **Filter Persistence**: Save user filter preferences
4. **Export Functionality**: Export filtered results
5. **Filter Analytics**: Track commonly used filter combinations

## Notes

- Page and sort parameters are excluded from filter expansion as requested
- All new filters are optional and backward compatible
- The implementation maintains existing functionality while adding new capabilities
- UI is responsive and works on mobile devices
- Accessibility features are maintained for all new components
