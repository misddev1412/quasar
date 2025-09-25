import { useEffect, createElement } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analytics';
import { useAnalytics as useAnalyticsService } from '../services/analytics';
import { useAuth } from './useAuth';

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackActions?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const { trackPageViews = true, trackActions = true } = options;
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const analytics = useAnalytics();

  useEffect(() => {
    // Initialize analytics on mount
    analyticsService.initialize();
  }, []);

  useEffect(() => {
    // Track page views when route changes
    if (trackPageViews && isAuthenticated) {
      const title = document.title;
      analytics.trackPageView(location.pathname, title);
    }
  }, [location.pathname, isAuthenticated, trackPageViews, analytics]);

  useEffect(() => {
    // Identify user when authenticated
    if (isAuthenticated && user && trackActions) {
      analytics.identifyUser(user.id, {
        name: user.name || user.username,
        email: user.email,
        role: user.role,
      });
    } else if (!isAuthenticated) {
      analytics.resetUser();
    }
  }, [user, isAuthenticated, trackActions, analytics]);

  return analytics;
};

// Hook for tracking specific events
export const useEventTracker = () => {
  const analytics = useAnalytics();

  const trackFormSubmit = (formName: string, success: boolean, data?: unknown) => {
    analytics.trackFormSubmission(formName, success);

    if (success && data) {
      // Track successful form submissions with more context
      analytics.trackEvent('Form Submit Success', {
        form_name: formName,
        ...(data as Record<string, unknown>),
      });
    }
  };

  const trackApiCall = (endpoint: string, method: string, success: boolean, duration?: number) => {
    analytics.trackEvent('API Call', {
      endpoint,
      method,
      success,
      duration,
    });
  };

  const trackNavigation = (from: string, to: string) => {
    analytics.trackEvent('Navigation', {
      from,
      to,
    });
  };

  const trackFeatureUsage = (featureName: string, action: string, metadata?: unknown) => {
    analytics.trackEvent('Feature Usage', {
      feature_name: featureName,
      action,
      ...(metadata as Record<string, unknown>),
    });
  };

  const trackPerformance = (metricName: string, value: number, metadata?: unknown) => {
    analytics.trackEvent('Performance', {
      metric_name: metricName,
      value,
      ...(metadata as Record<string, unknown>),
    });
  };

  return {
    trackFormSubmit,
    trackApiCall,
    trackNavigation,
    trackFeatureUsage,
    trackPerformance,
    ...analytics,
  };
};

// Hook for tracking entity actions (CRUD operations)
export const useEntityTracker = () => {
  const analytics = useAnalytics();

  const trackCreate = (entityType: string, entityId?: string, metadata?: unknown) => {
    analytics.trackCreateEntity(entityType, entityId);

    if (metadata) {
      analytics.trackEvent('Entity Created', {
        entity_type: entityType,
        entity_id: entityId,
        ...(metadata as Record<string, unknown>),
      });
    }
  };

  const trackUpdate = (entityType: string, entityId: string, changes?: unknown) => {
    analytics.trackUpdateEntity(entityType, entityId);

    if (changes) {
      const changesObj = changes as Record<string, unknown>;
      analytics.trackEvent('Entity Updated', {
        entity_type: entityType,
        entity_id: entityId,
        changed_fields: Object.keys(changesObj),
        ...changesObj,
      });
    }
  };

  const trackDelete = (entityType: string, entityId: string, metadata?: unknown) => {
    analytics.trackDeleteEntity(entityType, entityId);

    if (metadata) {
      analytics.trackEvent('Entity Deleted', {
        entity_type: entityType,
        entity_id: entityId,
        ...(metadata as Record<string, unknown>),
      });
    }
  };

  const trackBulkAction = (entityType: string, action: string, count: number) => {
    analytics.trackEvent('Bulk Action', {
      entity_type: entityType,
      action,
      count,
    });
  };

  return {
    trackCreate,
    trackUpdate,
    trackDelete,
    trackBulkAction,
  };
};

// Hook for tracking user engagement
export const useEngagementTracker = () => {
  const analytics = useAnalytics();

  const trackSessionStart = (source: string = 'direct') => {
    analytics.trackEvent('Session Start', {
      source,
      timestamp: new Date().toISOString(),
    });
  };

  const trackSessionEnd = (duration: number, interactions: number) => {
    analytics.trackEvent('Session End', {
      duration,
      interactions,
    });
  };

  const trackClick = (element: string, context: string) => {
    analytics.trackEvent('Click', {
      element,
      context,
    });
  };

  const trackTimeSpent = (page: string, duration: number) => {
    analytics.trackEvent('Time Spent', {
      page,
      duration,
    });
  };

  const trackScrollDepth = (page: string, depth: number) => {
    analytics.trackEvent('Scroll Depth', {
      page,
      depth,
    });
  };

  return {
    trackSessionStart,
    trackSessionEnd,
    trackClick,
    trackTimeSpent,
    trackScrollDepth,
  };
};

// HOC for tracking page views
export const withPageTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) => {
  const displayName = `withPageTracking(${WrappedComponent.displayName || WrappedComponent.name})`;

  const TrackedComponent = (props: P) => {
    const analytics = useAnalytics();
    const location = useLocation();

    useEffect(() => {
      const title = pageName || document.title;
      analytics.trackPageView(location.pathname, title);
    }, [location.pathname, pageName, analytics]);

    return createElement(WrappedComponent, props);
  };

  TrackedComponent.displayName = displayName;
  return TrackedComponent;
};

// HOC for tracking component events
export const withEventTracking = <P extends object & Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  events: string[] = []
) => {
  const displayName = `withEventTracking(${WrappedComponent.displayName || WrappedComponent.name})`;

  const TrackedComponent = (props: P) => {
    const analytics = useAnalytics();

    const createTrackedHandler = (eventName: string) => {
      return (...args: unknown[]) => {
        analytics.trackEvent(`${eventName}`, {
          component: WrappedComponent.displayName || WrappedComponent.name,
          timestamp: new Date().toISOString(),
          args: args.slice(0, 3), // Only log first 3 args to avoid sensitive data
        });

        // Call original handler if it exists
        const originalHandler = (props as Record<string, unknown>)[eventName] as (...args: unknown[]) => void;
        if (typeof originalHandler === 'function') {
          originalHandler(...args);
        }
      };
    };

    // Create tracked event handlers
    const trackedProps = events.reduce((acc, eventName) => {
      acc[eventName] = createTrackedHandler(eventName);
      return acc;
    }, {} as Record<string, (...args: unknown[]) => void>);

    return createElement(WrappedComponent, { ...props, ...trackedProps });
  };

  TrackedComponent.displayName = displayName;
  return TrackedComponent;
};

export default useAnalytics;