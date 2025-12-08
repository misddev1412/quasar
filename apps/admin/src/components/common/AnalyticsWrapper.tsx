import React from 'react';
import { useAnalyticsProvider } from './AnalyticsProvider';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
  eventName?: string;
  properties?: Record<string, any>;
}

export const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({
  children,
  eventName,
  properties = {},
}) => {
  const { trackCustomEvent } = useAnalyticsProvider();

  const handleClick = (event: React.MouseEvent) => {
    if (eventName) {
      trackCustomEvent(eventName, {
        ...properties,
        element_type: 'button',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<any>;
      return React.cloneElement(childElement, {
        ...childElement.props,
        onClick: (e: React.MouseEvent) => {
          handleClick(e);
          if (childElement.props.onClick) {
            childElement.props.onClick(e);
          }
        },
      });
    }
    return child;
  });

  return <>{wrappedChildren}</>;
};

// Higher-order component for analytics tracking
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  trackingConfig: {
    eventName?: string;
    properties?: Record<string, unknown>;
    trackMount?: boolean;
    trackUnmount?: boolean;
  } = {}
) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  return (props: P) => {
    const { trackCustomEvent } = useAnalyticsProvider();

    React.useEffect(() => {
      if (trackingConfig.trackMount) {
        trackCustomEvent(
          trackingConfig.eventName || `${displayName} Mounted`,
          {
            ...trackingConfig.properties,
            action: 'mount',
            timestamp: new Date().toISOString(),
          }
        );
      }

      return () => {
        if (trackingConfig.trackUnmount) {
          trackCustomEvent(
            trackingConfig.eventName || `${displayName} Unmounted`,
            {
              ...trackingConfig.properties,
              action: 'unmount',
              timestamp: new Date().toISOString(),
            }
          );
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
};

// Hook for form analytics
export const useFormAnalytics = (formName: string) => {
  const { trackCustomEvent, trackUserInteraction } = useAnalyticsProvider();

  const trackFormStart = () => {
    trackCustomEvent('Form Started', {
      form_name: formName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackFormSubmit = (success: boolean, data?: unknown) => {
    trackCustomEvent('Form Submitted', {
      form_name: formName,
      success,
      data: data ? JSON.stringify(data) : undefined,
      timestamp: new Date().toISOString(),
    });
  };

  const trackFieldChange = (fieldName: string, value: unknown) => {
    trackUserInteraction('form_field', 'change', `${formName}.${fieldName}`);
  };

  const trackFormValidation = (isValid: boolean, errors?: string[]) => {
    trackCustomEvent('Form Validation', {
      form_name: formName,
      is_valid: isValid,
      errors,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldChange,
    trackFormValidation,
  };
};

// Hook for modal analytics
export const useModalAnalytics = (modalName: string) => {
  const { trackCustomEvent } = useAnalyticsProvider();

  const trackModalOpen = (trigger?: string) => {
    trackCustomEvent('Modal Opened', {
      modal_name: modalName,
      trigger,
      timestamp: new Date().toISOString(),
    });
  };

  const trackModalClose = (action?: string, duration?: number) => {
    trackCustomEvent('Modal Closed', {
      modal_name: modalName,
      action,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  const trackModalInteraction = (element: string, action: string) => {
    trackCustomEvent('Modal Interaction', {
      modal_name: modalName,
      element,
      action,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackModalOpen,
    trackModalClose,
    trackModalInteraction,
  };
};

// Hook for navigation analytics
export const useNavigationAnalytics = () => {
  const { trackCustomEvent } = useAnalyticsProvider();

  const trackNavigationClick = (item: string, type: 'menu' | 'breadcrumb' | 'link' | 'button') => {
    trackCustomEvent('Navigation Click', {
      item,
      type,
      timestamp: new Date().toISOString(),
    });
  };

  const trackTabSwitch = (tabName: string, context: string) => {
    trackCustomEvent('Tab Switch', {
      tab_name: tabName,
      context,
      timestamp: new Date().toISOString(),
    });
  };

  const trackSearch = (query: string, resultsCount?: number) => {
    trackCustomEvent('Search Performed', {
      query,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackNavigationClick,
    trackTabSwitch,
    trackSearch,
  };
};

export default AnalyticsWrapper;