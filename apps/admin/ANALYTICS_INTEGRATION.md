# Analytics Integration Guide

This guide explains how to use the Google Analytics and Mixpanel integration implemented in the Quasar Admin Panel.

## Overview

The analytics system provides comprehensive tracking for admin panel user interactions, including:
- Page view tracking
- User action tracking
- Form submission tracking
- Entity CRUD operations
- Performance metrics
- Error tracking

## Configuration

### 1. Admin Panel Configuration

Access the analytics configuration at `/analytics` in the admin panel:

**Google Analytics Settings:**
- Enable/Disable Google Analytics
- Measurement ID (G-XXXXXXXXXX)

**Mixpanel Settings:**
- Enable/Disable Mixpanel
- Project Token (32-character hex string)
- API Host (default: api.mixpanel.com)

**Advanced Settings:**
- Track admin actions
- Anonymize IP addresses

### 2. Database Settings

The following settings are stored in the database:
- `analytics.google_analytics_enabled`
- `analytics.google_analytics_id`
- `analytics.mixpanel_enabled`
- `analytics.mixpanel_token`
- `analytics.mixpanel_api_host`
- `analytics.track_admin_actions`
- `analytics.anonymize_ip`

## Usage

### 1. Basic Analytics Tracking

The analytics system is automatically initialized when the app loads. Basic tracking includes:
- Page views
- User sessions
- Login/logout events
- Error tracking

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

function MyComponent() {
  const analytics = useAnalytics();

  const handleButtonClick = () => {
    // Track custom event
    analytics.trackEvent('Button Clicked', {
      button_name: 'save',
      context: 'user_profile',
    });
  };

  return <button onClick={handleButtonClick}>Save</button>;
}
```

### 2. Form Analytics

Track form interactions using the `useFormAnalytics` hook:

```typescript
import { useFormAnalytics } from '../components/common/AnalyticsWrapper';

function UserForm() {
  const { trackFormStart, trackFormSubmit, trackFieldChange } = useFormAnalytics('user_form');

  const handleSubmit = (data) => {
    trackFormSubmit(true, data);
    // ... submit logic
  };

  const handleFieldChange = (field, value) => {
    trackFieldChange(field, value);
    // ... field change logic
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### 3. Entity Tracking

Track CRUD operations for entities:

```typescript
import { useEntityTracker } from '../hooks/useAnalytics';

function UserManagement() {
  const { trackCreate, trackUpdate, trackDelete } = useEntityTracker();

  const createUser = async (userData) => {
    const newUser = await userService.create(userData);
    trackCreate('user', newUser.id, { role: userData.role });
    return newUser;
  };

  const updateUser = async (userId, changes) => {
    await userService.update(userId, changes);
    trackUpdate('user', userId, changes);
  };

  const deleteUser = async (userId) => {
    await userService.delete(userId);
    trackDelete('user', userId);
  };
}
```

### 4. Navigation Analytics

Track user navigation patterns:

```typescript
import { useNavigationAnalytics } from '../components/common/AnalyticsWrapper';

function Navigation() {
  const { trackNavigationClick, trackTabSwitch } = useNavigationAnalytics();

  const handleMenuClick = (item) => {
    trackNavigationClick(item, 'menu');
    // ... navigation logic
  };

  const handleTabChange = (tabName) => {
    trackTabSwitch(tabName, 'user_profile');
    // ... tab change logic
  };
}
```

### 5. Component Analytics

Track component lifecycle and interactions:

```typescript
import { withAnalytics, useModalAnalytics } from '../components/common/AnalyticsWrapper';

// Using HOC for component tracking
const UserProfile = withAnalytics(UserProfileComponent, {
  trackMount: true,
  eventName: 'User Profile Viewed',
  properties: { section: 'user_management' }
});

// Using hooks for modal tracking
function UserProfileModal() {
  const { trackModalOpen, trackModalClose } = useModalAnalytics('user_profile_modal');

  const openModal = () => {
    trackModalOpen('profile_button');
    // ... open modal logic
  };

  const closeModal = () => {
    trackModalClose('save_button', 5000); // 5 seconds duration
    // ... close modal logic
  };
}
```

### 6. Analytics Wrapper Components

Use wrapper components for automatic tracking:

```typescript
import { AnalyticsWrapper } from '../components/common/AnalyticsWrapper';

function MyComponent() {
  return (
    <AnalyticsWrapper eventName="CTA Clicked" properties={{ button_type: 'primary' }}>
      <button onClick={handleClick}>Primary Action</button>
    </AnalyticsWrapper>
  );
}
```

## Available Hooks

### `useAnalytics()`
Main analytics hook for general tracking:
- `trackPageView(path, title)`
- `trackEvent(event, properties, userId)`
- `trackUserAction(action, properties)`
- `trackLogin(userId, method)`
- `trackLogout()`
- `identifyUser(userId, properties)`
- `resetUser()`

### `useEventTracker()`
Track specific events:
- `trackFormSubmit(formName, success, data)`
- `trackApiCall(endpoint, method, success, duration)`
- `trackNavigation(from, to)`
- `trackFeatureUsage(featureName, action, metadata)`
- `trackPerformance(metricName, value, metadata)`

### `useEntityTracker()`
Track entity operations:
- `trackCreate(entityType, entityId, metadata)`
- `trackUpdate(entityType, entityId, changes)`
- `trackDelete(entityType, entityId, metadata)`
- `trackBulkAction(entityType, action, count)`

### `useFormAnalytics(formName)`
Track form interactions:
- `trackFormStart()`
- `trackFormSubmit(success, data)`
- `trackFieldChange(fieldName, value)`
- `trackFormValidation(isValid, errors)`

### `useModalAnalytics(modalName)`
Track modal interactions:
- `trackModalOpen(trigger)`
- `trackModalClose(action, duration)`
- `trackModalInteraction(element, action)`

### `useNavigationAnalytics()`
Track navigation events:
- `trackNavigationClick(item, type)`
- `trackTabSwitch(tabName, context)`
- `trackSearch(query, resultsCount)`

## Event Tracking Best Practices

### 1. Naming Conventions
- Use past tense for events (e.g., "User Created" instead of "Create User")
- Be specific but concise
- Use consistent naming across the application

### 2. Event Properties
- Include relevant context but avoid sensitive data
- Use consistent property names
- Group related properties

### 3. User Privacy
- Avoid tracking sensitive information (passwords, tokens, personal data)
- Use the anonymize IP option when enabled
- Consider user consent requirements

### 4. Performance
- Batch related events when possible
- Avoid excessive tracking in high-frequency operations
- Use async tracking for non-critical events

## Example Implementations

### User Management Page

```typescript
function UserManagementPage() {
  const analytics = useAnalytics();
  const { trackCreate, trackUpdate, trackDelete } = useEntityTracker();
  const { trackFormSubmit } = useFormAnalytics('create_user_form');

  const createUser = async (userData) => {
    try {
      const newUser = await userService.create(userData);
      trackCreate('user', newUser.id, {
        role: userData.role,
        method: 'admin_panel'
      });
      analytics.trackEvent('User Created', {
        user_id: newUser.id,
        role: userData.role,
        created_by: 'admin'
      });
      return newUser;
    } catch (error) {
      analytics.trackError('User Creation Failed', error.message);
      throw error;
    }
  };

  return (
    <div>
      {/* User management UI */}
    </div>
  );
}
```

### Settings Page

```typescript
function SettingsPage() {
  const analytics = useAnalytics();
  const { trackFormSubmit } = useFormAnalytics('settings_form');

  const handleSettingsSave = async (settings) => {
    try {
      await settingsService.update(settings);
      trackFormSubmit(true, settings);
      analytics.trackEvent('Settings Updated', {
        changed_sections: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      trackFormSubmit(false, error);
      analytics.trackError('Settings Update Failed', error.message);
    }
  };

  return (
    <AnalyticsWrapper eventName="Settings Page Viewed">
      {/* Settings form */}
    </AnalyticsWrapper>
  );
}
```

## Testing Analytics

### 1. Development Mode
- Analytics events are logged to console in development
- Test events appear in browser dev tools
- Mock services can be used for testing

### 2. Validation
- Use the test buttons in the analytics configuration page
- Check browser network tab for analytics requests
- Verify events in Google Analytics and Mixpanel dashboards

### 3. Privacy Compliance
- Ensure IP anonymization is working when enabled
- Verify no sensitive data is being tracked
- Test opt-out mechanisms if implemented

## Troubleshooting

### Common Issues

1. **Analytics not initializing**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Events not appearing in dashboards**
   - Verify Measurement ID / Project Token
   - Check data processing delays
   - Ensure tracking is enabled in settings

3. **Performance impact**
   - Monitor page load times
   - Check for excessive event tracking
   - Consider debouncing high-frequency events

### Debug Mode

Enable debug logging by setting the following in browser console:
```javascript
localStorage.setItem('analytics_debug', 'true');
```

This will enable verbose logging of all analytics events.

## Migration Guide

### From Previous Analytics Setup

1. **Remove old tracking code**
   ```typescript
   // Remove old Google Analytics code
   window.gtag('event', 'old_event');

   // Remove old Mixpanel code
   mixpanel.track('old_event');
   ```

2. **Replace with new hooks**
   ```typescript
   // Old way
   gtag('event', 'button_click', { button_name: 'save' });

   // New way
   const analytics = useAnalytics();
   analytics.trackEvent('Button Clicked', { button_name: 'save' });
   ```

3. **Update configuration**
   - Migrate settings to database
   - Use admin panel for configuration
   - Remove hardcoded credentials

## Security Considerations

1. **API Security**
   - Analytics settings are protected by admin authentication
   - API endpoints require proper authorization
   - Settings validation prevents injection attacks

2. **Data Privacy**
   - Sensitive data filtering
   - IP anonymization options
   - User consent management

3. **Performance**
   - Asynchronous event tracking
   - Debounced high-frequency events
   - Minimal impact on user experience

## Support

For issues or questions regarding the analytics integration:
1. Check browser console for error messages
2. Verify configuration in admin panel
3. Test with different user roles
4. Monitor network requests for analytics services

---

**Note**: This analytics system is designed for admin panel tracking only. For frontend application analytics, implement a separate tracking system with appropriate user consent mechanisms.