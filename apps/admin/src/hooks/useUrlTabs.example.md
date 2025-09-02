# useUrlTabs Hook - URL Tab State Persistence

This hook allows you to persist tab state in the URL parameters, making tabs maintain their state across page reloads and browser navigation.

## Basic Usage

```typescript
import { useUrlTabs } from '../../hooks/useUrlTabs';

// In your component
const MyComponent = () => {
  // Basic usage with numeric indices
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0, // Optional: default to first tab
    tabParam: 'tab', // Optional: URL parameter name (defaults to 'tab')
  });

  // Pass to your EntityForm or Tabs component
  return (
    <EntityForm
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      // ... other props
    />
  );
};
```

## Advanced Usage with Custom Tab Keys

```typescript
const MyComponent = () => {
  // Use custom tab keys for cleaner URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'advanced', 'security'] // Maps to tab indices
  });

  // URLs will be:
  // - /page (default tab)
  // - /page?tab=general (index 0)
  // - /page?tab=advanced (index 1) 
  // - /page?tab=security (index 2)
};
```

## Features

- ✅ **URL Persistence**: Tab state persists across page reloads
- ✅ **Browser Navigation**: Back/forward buttons work with tabs
- ✅ **Clean URLs**: Default tab doesn't add URL parameter
- ✅ **Custom Keys**: Use semantic names instead of numbers
- ✅ **Auto Cleanup**: Invalid tab parameters are automatically removed
- ✅ **TypeScript Support**: Full type safety

## URL Examples

### With Numeric Indices
- `/storage` - Default tab (no parameter)
- `/storage?tab=1` - Second tab
- `/storage?tab=2` - Third tab

### With Custom Keys  
- `/storage` - Default tab (no parameter)
- `/storage?tab=local` - Local storage tab
- `/storage?tab=s3` - S3 configuration tab

## Integration with EntityForm

The `EntityForm` component now supports external tab control:

```typescript
<EntityForm<FormData>
  tabs={tabs}
  initialValues={initialValues}
  onSubmit={handleSubmit}
  // Add these props for URL persistence
  activeTab={activeTab}
  onTabChange={handleTabChange}
  // ... other props
/>
```

## Backward Compatibility

Existing forms without `activeTab` and `onTabChange` props will continue to work with internal tab state management.