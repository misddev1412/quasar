interface VisitorTrackingData {
  pageUrl: string;
  pageTitle: string;
  referrer: string;
  timestamp: number;
  viewportWidth?: number;
  viewportHeight?: number;
  scrollDepth?: number;
  timeOnPage?: number;
}

class VisitorTracker {
  private static instance: VisitorTracker;
  private trackingEnabled: boolean = true;
  private sessionStartTime: number = Date.now();
  private lastTrackedPage: string = '';
  private trackingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): VisitorTracker {
    if (!VisitorTracker.instance) {
      VisitorTracker.instance = new VisitorTracker();
    }
    return VisitorTracker.instance;
  }

  private init() {
    // Track initial page load
    this.trackPageView();

    // Track page changes for SPAs
    this.setupHistoryTracking();

    // Track scroll depth
    this.setupScrollTracking();

    // Track time on page
    this.setupTimeTracking();

    // Track page visibility changes
    this.setupVisibilityTracking();
  }

  private async trackPageView(customData?: Partial<VisitorTrackingData>) {
    if (!this.trackingEnabled) return;

    try {
      const data: VisitorTrackingData = {
        pageUrl: window.location.href,
        pageTitle: document.title || this.generatePageTitle(window.location.pathname),
        referrer: document.referrer,
        timestamp: Date.now(),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        ...customData
      };

      // Only track if this is a different page
      if (data.pageUrl === this.lastTrackedPage && !customData) {
        return;
      }

      this.lastTrackedPage = data.pageUrl;

      // Send tracking data to backend
      await this.sendTrackingData(data);

      // Reset session start time for new page
      this.sessionStartTime = Date.now();

    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  private generatePageTitle(pathname: string): string {
    const path = pathname.toLowerCase();

    if (path === '/' || path === '/home') return 'Home';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/search')) return 'Search';
    if (path.includes('/cart')) return 'Shopping Cart';
    if (path.includes('/checkout')) return 'Checkout';
    if (path.includes('/account')) return 'My Account';
    if (path.includes('/about')) return 'About Us';
    if (path.includes('/contact')) return 'Contact';
    if (path.includes('/blog')) return 'Blog';

    return 'Page';
  }

  private async sendTrackingData(data: VisitorTrackingData) {
    try {
      // Use fetch API to send tracking data
      await fetch('/api/visitor-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // Don't wait for response
        keepalive: true
      });
    } catch (error) {
      // Silently fail to not impact user experience
      console.debug('Tracking data send failed:', error);
    }
  }

  private setupHistoryTracking() {
    // Override pushState and replaceState to track SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.trackPageView(), 0);
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.trackPageView(), 0);
    };

    // Track back/forward button navigation
    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageView(), 0);
    });
  }

  private setupScrollTracking() {
    let maxScrollDepth = 0;

    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
    };

    // Track scroll events
    window.addEventListener('scroll', this.throttle(updateScrollDepth, 100));

    // Send scroll depth when user leaves the page
    window.addEventListener('beforeunload', () => {
      if (maxScrollDepth > 0) {
        this.trackPageView({ scrollDepth: maxScrollDepth });
      }
    });
  }

  private setupTimeTracking() {
    // Send time on page every 30 seconds
    this.trackingInterval = setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      this.trackPageView({ timeOnPage });
    }, 30000);
  }

  private setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, track final time on page
        const timeOnPage = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        this.trackPageView({ timeOnPage });
      } else {
        // Page is visible again, reset session start time
        this.sessionStartTime = Date.now();
      }
    });
  }

  private throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Public methods
  public enableTracking() {
    this.trackingEnabled = true;
  }

  public disableTracking() {
    this.trackingEnabled = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  public manuallyTrackPage(pageUrl: string, pageTitle: string) {
    this.trackPageView({ pageUrl, pageTitle });
  }
}

// Initialize tracker immediately
const visitorTracker = VisitorTracker.getInstance();

// Export for use in components
export { visitorTracker };

// Auto-initialize when this module is imported
export default visitorTracker;