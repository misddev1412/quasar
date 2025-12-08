import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Visitor, VisitorType, VisitorSource, VisitorSession, PageView, SessionStatus } from '../entities';
import { VisitorRepository } from '../repositories/visitor.repository';

export interface StorefrontVisitorPayload {
  fingerprint: string;
  sessionId?: string;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  timeOnPageSeconds?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  scrollDepthPercent?: number;
  language?: string;
  timezoneOffset?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class VisitorTrackingService {
  private readonly logger = new Logger(VisitorTrackingService.name);

  constructor(private readonly visitorRepository: VisitorRepository) {}

  async trackVisitor(req: Request, res: Response): Promise<{ visitorId: string; sessionId: string }> {
    try {
      const visitorId = this.getOrCreateVisitorId(req);
      const sessionId = this.getOrCreateSessionId(req);

      // Parse user agent and device information
      const deviceInfo = this.parseDeviceInfo(req.get('user-agent'));
      const geoInfo = this.parseGeoInfo(req);
      const utmInfo = this.parseUtmInfo(req);

      // Get or create visitor
      let visitor = await this.visitorRepository.findByVisitorId(visitorId);

      if (!visitor) {
        // New visitor
        const visitorData = Visitor.createVisitor({
          visitorId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          visitorType: VisitorType.NEW,
          visitorSource: this.detectVisitorSource(req),
          referrerUrl: req.get('referrer'),
          landingPage: req.url,
          ...utmInfo,
          ...deviceInfo,
          ...geoInfo,
        });

        visitor = await this.visitorRepository.createVisitor(visitorData);
      } else {
        // Returning visitor - update type if needed
        if (visitor.visitorType === VisitorType.NEW) {
          visitor = await this.visitorRepository.updateVisitor(visitor.id, {
            visitorType: VisitorType.RETURNING
          });
        }
      }

      // Get or create session
      let session = await this.visitorRepository.findBySessionId(sessionId);

      if (!session) {
        const sessionData = VisitorSession.createSession({
          visitorId: visitor.id,
          sessionId,
          startTime: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          ...deviceInfo,
          ...geoInfo,
        });

        session = await this.visitorRepository.createSession(sessionData);
      }

      return { visitorId: visitor.id, sessionId: session.id };
    } catch (error) {
      this.logger.error('Error tracking visitor:', error);
      // Return fallback IDs
      return {
        visitorId: uuidv4(),
        sessionId: uuidv4()
      };
    }
  }

  async trackPageView(
    req: Request,
    res: Response,
    visitorId: string,
    sessionId: string,
    timeOnPage?: number
  ): Promise<void> {
    try {
      const body =
        (req.body ?? {}) as Partial<{
          viewportWidth: number;
          viewportHeight: number;
          scrollDepthPercent: number;
        }>;
      const pageTitle = this.extractPageTitle(req);
      const pageViewData = PageView.createPageView({
        sessionId,
        pageUrl: req.url,
        pageTitle,
        pageType: PageView.detectPageType(req.url, pageTitle),
        referrerUrl: req.get('referrer'),
        searchQuery: this.extractSearchQuery(req),
        timeOnPageSeconds: timeOnPage,
        viewportWidth: body.viewportWidth,
        viewportHeight: body.viewportHeight,
        scrollDepthPercent: body.scrollDepthPercent,
      });

      await this.visitorRepository.createPageView(pageViewData);

      // Get current session and increment page views count
      const currentSession = await this.visitorRepository.findBySessionId(sessionId);
      if (currentSession) {
        await this.visitorRepository.updateSession(sessionId, {
          pageViewsCount: currentSession.pageViewsCount + 1
        });
      }

    } catch (error) {
      this.logger.error('Error tracking page view:', error);
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      const session = await this.visitorRepository.findBySessionId(sessionId);
      if (session && session.status === SessionStatus.ACTIVE) {
        await this.visitorRepository.updateSession(session.id, {
          status: SessionStatus.COMPLETED,
          endTime: new Date(),
          bounceRate: session.pageViewsCount === 1 ? 100 : 0
        });
      }
    } catch (error) {
      this.logger.error('Error ending session:', error);
    }
  }

  async trackStorefrontVisitor(
    payload: StorefrontVisitorPayload
  ): Promise<{ visitorId: string; sessionId: string }> {
    try {
      const visitorIdentifier = payload.fingerprint || uuidv4();
      const utmInfo = this.parseUtmInfoFromUrl(payload.pageUrl);
      const deviceInfo = this.parseDeviceInfo(payload.userAgent);
      const visitorSource = this.detectVisitorSourceFromContext(payload.pageUrl, payload.referrer);

      let visitor = await this.visitorRepository.findByVisitorId(visitorIdentifier);

      if (!visitor) {
        const visitorData = Visitor.createVisitor({
          visitorId: visitorIdentifier,
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
          visitorType: VisitorType.NEW,
          visitorSource,
          referrerUrl: payload.referrer,
          landingPage: payload.pageUrl,
          ...utmInfo,
          ...deviceInfo,
        });

        visitor = await this.visitorRepository.createVisitor(visitorData);
      } else if (visitor.visitorType === VisitorType.NEW) {
        visitor = await this.visitorRepository.updateVisitor(visitor.id, {
          visitorType: VisitorType.RETURNING,
          referrerUrl: payload.referrer || visitor.referrerUrl || null,
        });
      }

      const sessionIdentifier = payload.sessionId || uuidv4();
      let session = await this.visitorRepository.findBySessionId(sessionIdentifier);

      if (!session) {
        const sessionData = VisitorSession.createSession({
          visitorId: visitor.id,
          sessionId: sessionIdentifier,
          startTime: new Date(),
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
          ...deviceInfo,
          metadata: {
            language: payload.language,
            timezoneOffset: payload.timezoneOffset,
            ...(payload.metadata || {}),
          },
        });

        session = await this.visitorRepository.createSession(sessionData);
      }

      const resolvedPageTitle =
        payload.pageTitle || this.resolvePageTitleFromUrl(payload.pageUrl);

      await this.visitorRepository.createPageView(
        PageView.createPageView({
          sessionId: session.id,
          pageUrl: payload.pageUrl,
          pageTitle: resolvedPageTitle,
          pageType: PageView.detectPageType(payload.pageUrl, resolvedPageTitle),
          referrerUrl: payload.referrer,
          searchQuery: this.extractSearchQueryFromUrl(payload.pageUrl),
          timeOnPageSeconds: payload.timeOnPageSeconds,
          viewportWidth: payload.viewportWidth,
          viewportHeight: payload.viewportHeight,
          scrollDepthPercent: payload.scrollDepthPercent,
        })
      );

      await this.visitorRepository.updateSession(session.id, {
        pageViewsCount: (session.pageViewsCount || 0) + 1,
      });

      return {
        visitorId: visitor.visitorId,
        sessionId: session.sessionId,
      };
    } catch (error) {
      this.logger.error('Error tracking storefront visitor:', error);
      return {
        visitorId: payload.fingerprint || uuidv4(),
        sessionId: payload.sessionId || uuidv4(),
      };
    }
  }

  private getOrCreateVisitorId(req: Request): string {
    // Try to get from cookie first
    const cookieVisitorId = req.cookies?.visitor_id;
    if (cookieVisitorId) {
      return cookieVisitorId;
    }

    // Generate new visitor ID
    return uuidv4();
  }

  private getOrCreateSessionId(req: Request): string {
    // Try to get from cookie first
    const cookieSessionId = req.cookies?.session_id;
    if (cookieSessionId) {
      return cookieSessionId;
    }

    // Generate new session ID
    return uuidv4();
  }

  private parseDeviceInfo(userAgent?: string) {
    if (!userAgent) {
      return {};
    }

    // Simple user agent parsing - in production, use a library like 'ua-parser-js'
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);

    let browserName = 'Unknown';
    let browserVersion = '';

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    }

    let osName = 'Unknown';
    let osVersion = '';

    if (userAgent.includes('Windows')) {
      osName = 'Windows';
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      if (match) osVersion = match[1];
    } else if (userAgent.includes('Mac')) {
      osName = 'macOS';
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux';
    } else if (userAgent.includes('Android')) {
      osName = 'Android';
      const match = userAgent.match(/Android (\d+\.\d+)/);
      if (match) osVersion = match[1];
    } else if (userAgent.includes('iOS')) {
      osName = 'iOS';
    }

    return {
      deviceType: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
      browserName,
      browserVersion,
      osName,
      osVersion,
    };
  }

  private parseGeoInfo(req: Request) {
    // This would typically use a GeoIP service
    // For now, return empty object
    return {
      countryCode: req.headers['x-country-code'] as string || null,
      city: req.headers['x-city'] as string || null,
    };
  }

  private parseUtmInfo(req: Request) {
    return this.parseUtmInfoFromUrl(req.url, req.headers.host);
  }

  private detectVisitorSource(req: Request): VisitorSource {
    const referrer = req.get('referrer');
    return this.detectVisitorSourceFromContext(req.url, referrer);
  }

  private extractPageTitle(req: Request): string {
    return this.resolvePageTitleFromUrl(req.url);
  }

  private extractSearchQuery(req: Request): string | null {
    return this.extractSearchQueryFromUrl(req.url, req.headers.host);
  }

  private parseUtmInfoFromUrl(url: string, host?: string) {
    const parsedUrl = this.buildUrl(url, host);
    if (!parsedUrl) {
      return {
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
      };
    }

    return {
      utmSource: parsedUrl.searchParams.get('utm_source') || null,
      utmMedium: parsedUrl.searchParams.get('utm_medium') || null,
      utmCampaign: parsedUrl.searchParams.get('utm_campaign') || null,
      utmTerm: parsedUrl.searchParams.get('utm_term') || null,
      utmContent: parsedUrl.searchParams.get('utm_content') || null,
    };
  }

  private detectVisitorSourceFromContext(pageUrl: string, referrer?: string): VisitorSource {
    const utmInfo = this.parseUtmInfoFromUrl(pageUrl);
    const utmSource = utmInfo.utmSource?.toLowerCase();

    if (utmSource) {
      if (utmSource.includes('google') || utmSource.includes('bing') || utmSource.includes('yahoo')) {
        return VisitorSource.PAID_ADVERTISING;
      }
      if (utmSource.includes('facebook') || utmSource.includes('twitter') || utmSource.includes('instagram')) {
        return VisitorSource.SOCIAL_MEDIA;
      }
      if (utmSource.includes('newsletter') || utmSource.includes('email')) {
        return VisitorSource.EMAIL;
      }
    }

    if (referrer) {
      const refUrl = this.buildUrl(referrer);
      const referrerDomain = refUrl?.hostname?.toLowerCase();
      if (referrerDomain) {
        if (referrerDomain.includes('google') || referrerDomain.includes('bing') ||
            referrerDomain.includes('yahoo') || referrerDomain.includes('duckduckgo')) {
          return VisitorSource.SEARCH_ENGINE;
        }

        if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter') ||
            referrerDomain.includes('instagram') || referrerDomain.includes('linkedin') ||
            referrerDomain.includes('pinterest') || referrerDomain.includes('reddit')) {
          return VisitorSource.SOCIAL_MEDIA;
        }

        return VisitorSource.REFERRAL;
      }
    }

    return VisitorSource.DIRECT;
  }

  private resolvePageTitleFromUrl(url: string): string {
    const lowerUrl = (url || '').toLowerCase();

    if (lowerUrl.includes('/products/') || lowerUrl.includes('/product/')) {
      return 'Product Details';
    }
    if (lowerUrl.includes('/categories/') || lowerUrl.includes('/category/')) {
      return 'Category';
    }
    if (lowerUrl.includes('/search')) {
      return 'Search Results';
    }
    if (lowerUrl.includes('/checkout')) {
      return 'Checkout';
    }
    if (lowerUrl.includes('/cart')) {
      return 'Shopping Cart';
    }
    if (lowerUrl.includes('/blog/') || lowerUrl.includes('/news')) {
      return 'Blog Post';
    }
    if (lowerUrl === '/' || lowerUrl === '/home') {
      return 'Home';
    }

    return 'Page';
  }

  private extractSearchQueryFromUrl(url: string, host?: string): string | null {
    const parsedUrl = this.buildUrl(url, host);
    if (!parsedUrl) {
      return null;
    }
    return (
      parsedUrl.searchParams.get('q') ||
      parsedUrl.searchParams.get('search') ||
      parsedUrl.searchParams.get('query')
    );
  }

  private buildUrl(value: string, host: string = 'storefront.local'): URL | null {
    if (!value) {
      return null;
    }
    try {
      if (/^https?:\/\//i.test(value)) {
        return new URL(value);
      }
      return new URL(value, `https://${host}`);
    } catch (error) {
      this.logger.debug(`Failed to parse URL "${value}": ${error.message}`);
      return null;
    }
  }
}
