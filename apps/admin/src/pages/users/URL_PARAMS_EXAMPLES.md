# URL Parameter Examples for User Management

This document demonstrates the URL parameter functionality implemented in the User Management page.

## URL Parameter Structure

The user management page now supports the following URL parameters:

### Search Parameters
- `search` - Search term for filtering users
- `role` - Filter by user role (super_admin, admin, manager, user, guest)
- `isActive` - Filter by active status (true/false)
- `dateFrom` - Filter by creation date from
- `dateTo` - Filter by creation date to
- `page` - Current page number
- `sortBy` - Sort field (defaults to createdAt)
- `sortOrder` - Sort order (asc/desc, defaults to desc)

## Example URLs

### Basic Search
```
/users?search=john
```
Searches for users with "john" in their name, email, or username.

### Filter by Role
```
/users?role=admin
```
Shows only users with admin role.

### Filter by Status
```
/users?isActive=true
```
Shows only active users.

### Combined Filters
```
/users?search=john&role=admin&isActive=true&page=2
```
Searches for "john" among admin users who are active, on page 2.

### Date Range Filter
```
/users?dateFrom=2024-01-01&dateTo=2024-12-31
```
Shows users created between January 1, 2024 and December 31, 2024.

### Complete Example
```
/users?search=admin&role=admin&isActive=true&page=1&sortBy=createdAt&sortOrder=desc
```
Searches for "admin" among admin users who are active, sorted by creation date descending.

## Features

### ✅ URL Persistence
- All search and filter states are saved to URL
- Page refreshes maintain the current view
- Browser back/forward buttons work correctly

### ✅ Shareable URLs
- Copy and share URLs to show specific filtered views
- URLs work across different browser sessions

### ✅ Parameter Validation
- Invalid role values are ignored
- Invalid boolean values default to undefined
- Invalid page numbers default to 1
- Invalid dates are ignored

### ✅ Debounced Updates
- Search input is debounced (400ms) to avoid excessive URL updates
- URL updates are debounced (100ms) to prevent rapid changes

### ✅ Clean URLs
- Default values are not included in URL (page=1, sortBy=createdAt, sortOrder=desc)
- Empty parameters are automatically removed
- URL is updated without page reloads

### ✅ Reset Functionality
- "Clear Filters" button removes all URL parameters
- Individual filter changes update URL appropriately
- Search changes reset pagination to page 1

## Implementation Details

### State Initialization
The component reads URL parameters on mount and initializes state accordingly:
- Search value from `search` parameter
- Filters from `role`, `isActive`, `dateFrom`, `dateTo` parameters
- Page number from `page` parameter (defaults to 1)
- Sort preferences from `sortBy` and `sortOrder` parameters

### URL Updates
URL parameters are updated when:
- User types in search box (debounced)
- User changes filters
- User navigates to different page
- User clears filters

### Backward Compatibility
The implementation maintains full backward compatibility:
- Existing functionality works exactly as before
- No breaking changes to component API
- All existing event handlers continue to work
