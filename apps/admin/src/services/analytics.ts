interface AnalyticsConfig {
  googleAnalyticsEnabled: boolean;
  googleAnalyticsId: string;
  mixpanelEnabled: boolean;
  mixpanelToken: string;
  mixpanelApiHost: string;
  trackAdminActions: boolean;
  anonymizeIp: boolean;
}

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

class AnalyticsService {
  private config: AnalyticsConfig | null = null;
  private isInitialized = false;
  private mixpanelInstance: MixpanelInstance | null = null;

  async initialize(): Promise<void> {
    try {
      // Fetch analytics settings from the API
      const response = await fetch('/api/settings/group/analytics');
      const settings = await response.json();

      this.config = {
        googleAnalyticsEnabled: settings.find((s: { key: string; value: string }) => s.key === 'analytics.google_analytics_enabled')?.value === 'true',
        googleAnalyticsId: settings.find((s: { key: string; value: string }) => s.key === 'analytics.google_analytics_id')?.value || '',
        mixpanelEnabled: settings.find((s: { key: string; value: string }) => s.key === 'analytics.mixpanel_enabled')?.value === 'true',
        mixpanelToken: settings.find((s: { key: string; value: string }) => s.key === 'analytics.mixpanel_token')?.value || '',
        mixpanelApiHost: settings.find((s: { key: string; value: string }) => s.key === 'analytics.mixpanel_api_host')?.value || 'api.mixpanel.com',
        trackAdminActions: settings.find((s: { key: string; value: string }) => s.key === 'analytics.track_admin_actions')?.value === 'true',
        anonymizeIp: settings.find((s: { key: string; value: string }) => s.key === 'analytics.anonymize_ip')?.value === 'true',
      };

      this.initializeGoogleAnalytics();
      await this.initializeMixpanel();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private initializeGoogleAnalytics(): void {
    if (!this.config?.googleAnalyticsEnabled || !this.config.googleAnalyticsId) {
      return;
    }

    // Initialize Google Analytics 4
    if (typeof window !== 'undefined') {
      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.config.googleAnalyticsId, {
        anonymize_ip: this.config.anonymizeIp,
        send_page_view: true,
      });

      // Initialize Google Analytics
      const gaScript = document.createElement('script');
      gaScript.innerHTML = `
        window.gtag = window.gtag || function() {
          (window.dataLayer = window.dataLayer || []).push(arguments);
        };
        gtag('js', new Date());
        gtag('config', '${this.config.googleAnalyticsId}', {
          anonymize_ip: ${this.config.anonymizeIp},
          send_page_view: true,
        });
      `;
      document.head.appendChild(gaScript);
    }
  }

  private async initializeMixpanel(): Promise<void> {
    if (!this.config?.mixpanelEnabled || !this.config.mixpanelToken) {
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        // Load Mixpanel library dynamically
        await this.loadScript('https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js');

        // Initialize Mixpanel
        if (window.mixpanel) {
          window.mixpanel.init(this.config.mixpanelToken, {
            api_host: this.config.mixpanelApiHost,
            ip: this.config.anonymizeIp ? false : true,
          });
          this.mixpanelInstance = window.mixpanel;
        }
      } catch (error) {
        console.error('Failed to initialize Mixpanel:', error);
      }
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized || !this.config?.trackAdminActions) {
      return;
    }

    // Google Analytics page view
    if (this.config.googleAnalyticsEnabled && typeof window.gtag !== 'undefined') {
      window.gtag('config', this.config.googleAnalyticsId, {
        page_path: path,
        page_title: title,
      });
    }

    // Mixpanel page view
    if (this.config.mixpanelEnabled && this.mixpanelInstance) {
      this.mixpanelInstance.track('Page View', {
        path,
        title,
        timestamp: new Date().toISOString(),
      });
    }
  }

  trackEvent(event: string, properties?: Record<string, any>, userId?: string): void {
    if (!this.isInitialized || !this.config?.trackAdminActions) {
      return;
    }

    const eventProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    };

    // Google Analytics event
    if (this.config.googleAnalyticsEnabled && typeof window.gtag !== 'undefined') {
      window.gtag('event', event, {
        ...eventProperties,
        event_category: properties?.category || 'Admin Action',
        event_label: properties?.label,
      });
    }

    // Mixpanel event
    if (this.config.mixpanelEnabled && this.mixpanelInstance) {
      if (userId) {
        this.mixpanelInstance.identify(userId);
      }
      this.mixpanelInstance.track(event, eventProperties);
    }
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.trackEvent(`Admin ${action}`, {
      category: 'Admin Action',
      ...properties,
    });
  }

  identifyUser(userId: string, properties?: Record<string, any>): void {
    if (!this.isInitialized || !this.config?.mixpanelEnabled || !this.mixpanelInstance) {
      return;
    }

    this.mixpanelInstance.identify(userId);
    if (properties) {
      this.mixpanelInstance.people.set(properties);
    }
  }

  resetUser(): void {
    if (!this.isInitialized || !this.config?.mixpanelEnabled || !this.mixpanelInstance) {
      return;
    }

    this.mixpanelInstance.reset();
  }

  // Common admin actions
  trackLogin(userId: string, method: string = 'email'): void {
    this.trackEvent('Admin Login', {
      category: 'Authentication',
      method,
    }, userId);
  }

  trackLogout(): void {
    this.trackEvent('Admin Logout', {
      category: 'Authentication',
    });
    this.resetUser();
  }

  trackCreateEntity(entityType: string, entityId?: string): void {
    this.trackUserAction('Create', {
      entity_type: entityType,
      entity_id: entityId,
    });
  }

  trackUpdateEntity(entityType: string, entityId: string): void {
    this.trackUserAction('Update', {
      entity_type: entityType,
      entity_id: entityId,
    });
  }

  trackDeleteEntity(entityType: string, entityId: string): void {
    this.trackUserAction('Delete', {
      entity_type: entityType,
      entity_id: entityId,
    });
  }

  trackFormSubmission(formName: string, success: boolean): void {
    this.trackUserAction('Form Submit', {
      form_name: formName,
      success,
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.trackUserAction('Search', {
      query,
      results_count: resultsCount,
    });
  }

  trackError(error: string, context?: string): void {
    this.trackEvent('Admin Error', {
      category: 'Error',
      error,
      context,
    });
  }

  // Utility methods
  isAnalyticsEnabled(): boolean {
    return this.isInitialized && (
      this.config?.googleAnalyticsEnabled ||
      this.config?.mixpanelEnabled
    );
  }

  getConfig(): AnalyticsConfig | null {
    return this.config;
  }

  reinitialize(): void {
    this.isInitialized = false;
    this.config = null;
    this.mixpanelInstance = null;
    this.initialize();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Type definitions for global scope
declare global {
  interface MixpanelInstance {
  init: (token: string, config?: { api_host?: string; ip?: boolean }) => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
  people: {
    set: (properties: Record<string, unknown>) => void;
  };
  reset: () => void;
}

interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    mixpanel: MixpanelInstance;
  }
}

// React hook for analytics
export const useAnalytics = () => {
  const trackPageView = (path: string, title?: string) => {
    analyticsService.trackPageView(path, title);
  };

  const trackEvent = (event: string, properties?: Record<string, any>, userId?: string) => {
    analyticsService.trackEvent(event, properties, userId);
  };

  const trackUserAction = (action: string, properties?: Record<string, any>) => {
    analyticsService.trackUserAction(action, properties);
  };

  return {
    trackPageView,
    trackEvent,
    trackUserAction,
    trackLogin: analyticsService.trackLogin.bind(analyticsService),
    trackLogout: analyticsService.trackLogout.bind(analyticsService),
    trackCreateEntity: analyticsService.trackCreateEntity.bind(analyticsService),
    trackUpdateEntity: analyticsService.trackUpdateEntity.bind(analyticsService),
    trackDeleteEntity: analyticsService.trackDeleteEntity.bind(analyticsService),
    trackFormSubmission: analyticsService.trackFormSubmission.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    identifyUser: analyticsService.identifyUser.bind(analyticsService),
    resetUser: analyticsService.resetUser.bind(analyticsService),
    isAnalyticsEnabled: analyticsService.isAnalyticsEnabled.bind(analyticsService),
    getConfig: analyticsService.getConfig.bind(analyticsService),
  };
};

export default analyticsService;