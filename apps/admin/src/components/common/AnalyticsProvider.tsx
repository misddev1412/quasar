import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../../services/analytics';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await analyticsService.initialize();
        setIsInitialized(true);

        // Track initial page view
        const title = document.title;
        analyticsService.trackPageView(location.pathname, title);
      } catch (err) {
        const errorMessage = 'Failed to initialize analytics service';
        setError(errorMessage);
        console.error('Analytics initialization error:', err);

        // Only show error in development mode
        if (process.env.NODE_ENV === 'development') {
          addToast({
            type: 'error',
            title: 'Analytics Error',
            description: errorMessage,
          });
        }
      }
    };

    // Delay initialization to ensure other services are ready
    const timer = setTimeout(initializeAnalytics, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Track page views when route changes
  useEffect(() => {
    if (isInitialized) {
      const title = document.title;
      analyticsService.trackPageView(location.pathname, title);
    }
  }, [location.pathname, isInitialized]);

  // Track user identification
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      analyticsService.identifyUser(user.id, {
        name: user.name || user.username,
        email: user.email,
        role: user.role,
        last_login: new Date().toISOString(),
      });

      // Track login event
      analyticsService.trackLogin(user.id);
    } else if (isInitialized && !isAuthenticated) {
      // Track logout and reset user identification
      analyticsService.trackLogout();
      analyticsService.resetUser();
    }
  }, [user, isAuthenticated, isInitialized]);

  // Track session start
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      analyticsService.trackEvent('Session Start', {
        source: document.referrer || 'direct',
        entry_page: location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isInitialized, isAuthenticated, location.pathname]);

  // Handle window before unload for session tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isInitialized && isAuthenticated) {
        analyticsService.trackEvent('Session End', {
          duration: Math.floor(performance.now() - (window as Window & { sessionStart?: number }).sessionStart || 0),
          page: location.pathname,
        });
      }
    };

    // Store session start time
    if (isInitialized && isAuthenticated) {
      (window as Window & { sessionStart?: number }).sessionStart = performance.now();
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isInitialized, isAuthenticated, location.pathname]);

  // Track visibility changes (user switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isInitialized) return;

      if (document.hidden) {
        analyticsService.trackEvent('Page Hidden', {
          page: location.pathname,
        });
      } else {
        analyticsService.trackEvent('Page Visible', {
          page: location.pathname,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInitialized, location.pathname]);

  // Track errors globally
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (isInitialized) {
        const context = `filename: ${event.filename}, line: ${event.lineno}, column: ${event.colno}, stack: ${event.error?.stack || ''}`;
        analyticsService.trackError(event.message, context);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isInitialized) {
        const context = `reason: ${event.reason}, stack: ${event.reason?.stack || ''}`;
        analyticsService.trackError('Unhandled Promise Rejection', context);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isInitialized]);

  // Auto-refresh analytics configuration when settings change
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'analytics_config_updated' && isInitialized) {
        analyticsService.reinitialize();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isInitialized]);

  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-medium mb-2">Analytics Service Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <p className="text-red-500 text-xs mt-1">
          Analytics functionality may be limited. Please check your configuration.
        </p>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

// Hook to access analytics functionality in components
export const useAnalyticsProvider = () => {
  const trackCustomEvent = (event: string, properties: Record<string, unknown> = {}) => {
    analyticsService.trackEvent(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  };

  const trackUserInteraction = (element: string, action: string, context: string) => {
    analyticsService.trackUserAction(`${action} ${element}`, {
      element,
      action,
      context,
    });
  };

  const trackFeatureUsage = (feature: string, action: string, metadata?: unknown) => {
    trackCustomEvent('Feature Usage', {
      feature,
      action,
      ...(metadata as Record<string, unknown>),
    });
  };

  const trackPerformance = (metric: string, value: number, metadata?: unknown) => {
    trackCustomEvent('Performance', {
      metric,
      value,
      ...(metadata as Record<string, unknown>),
    });
  };

  return {
    trackCustomEvent,
    trackUserInteraction,
    trackFeatureUsage,
    trackPerformance,
    isInitialized: analyticsService.isAnalyticsEnabled(),
    config: analyticsService.getConfig(),
  };
};

export default AnalyticsProvider;
