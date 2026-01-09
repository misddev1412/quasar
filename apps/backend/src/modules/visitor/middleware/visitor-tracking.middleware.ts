import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { VisitorTrackingService } from '../services/visitor-tracking.service';
import { ActivityTrackingService, ActivityContext } from '../../user/services/activity-tracking.service';

@Injectable()
export class VisitorTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(VisitorTrackingMiddleware.name);
  private readonly activeSessions = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly visitorTrackingService: VisitorTrackingService,
    private readonly userActivityService: ActivityTrackingService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip tracking for certain paths - execute immediately outside try/catch
    if (this.shouldSkipTracking(req)) {
      return next();
    }

    try {
      // Track visitor and session
      const { visitorId, sessionId } = await this.visitorTrackingService.trackVisitor(req, res);

      // Add visitor info to request object for later use
      (req as any).visitorId = visitorId;
      (req as any).sessionId = sessionId;

      // Set cookies if they don't exist
      this.setVisitorCookies(req, res, visitorId, sessionId);

      // Track page view after response is sent
      res.on('finish', async () => {
        // Only track successful responses
        if (res.statusCode >= 200 && res.statusCode < 400) {
          // Calculate page view time if available
          const startTime = (req as any).trackingStartTime || new Date();
          const timeOnPage = Math.floor((Date.now() - startTime.getTime()) / 1000);

          await this.visitorTrackingService.trackPageView(req, res, visitorId, sessionId, timeOnPage);

          // Track in user activity system as well if user is authenticated
          if ((req as any).user?.id) {
            try {
              const activityContext: ActivityContext = {
                userId: (req as any).user.id,
                sessionId: (req as any).user?.sessionId,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                request: req,
                response: res,
                startTime: (req as any).trackingStartTime || new Date().getTime(),
                endTime: Date.now()
              };

              await this.userActivityService.trackActivity(
                'page_view' as any,
                activityContext,
                `Visited ${req.url}`
              );
            } catch (error) {
              this.logger.error('Error tracking user activity:', error);
            }
          }
        }
      });

      // Setup session timeout cleanup
      this.setupSessionTimeout(sessionId, req, res);

      // Set tracking start time
      (req as any).trackingStartTime = new Date();

    } catch (error) {
      this.logger.error('Error in visitor tracking middleware:', error);
      // Continue without tracking if there's an error
    }

    next();
  }

  private shouldSkipTracking(req: Request): boolean {
    const url = req.url.toLowerCase();

    // Skip tracking for static assets
    if (url.startsWith('/api/health') ||
      url.startsWith('/api/healthz') ||
      url.startsWith('/_next/') ||
      url.includes('.css') ||
      url.includes('.js') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.gif') ||
      url.includes('.svg') ||
      url.includes('.ico') ||
      url.includes('.woff') ||
      url.includes('.woff2')) {
      return true;
    }

    // Skip tracking for admin routes (these are tracked separately)
    if (url.startsWith('/admin') || url.startsWith('/api/admin')) {
      return true;
    }

    // Skip tracking for API routes that don't need visitor tracking
    if (url.startsWith('/api/auth') || url.startsWith('/trpc/admin')) {
      return true;
    }

    return false;
  }

  private setVisitorCookies(req: Request, res: Response, visitorId: string, sessionId: string) {
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;

    // Set visitor ID cookie (1 year expiry)
    if (!req.cookies?.visitor_id) {
      res.cookie('visitor_id', visitorId, {
        maxAge: oneYear,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }

    // Set session ID cookie (30 minutes expiry)
    if (!req.cookies?.session_id) {
      res.cookie('session_id', sessionId, {
        maxAge: thirtyMinutes,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }
  }

  private setupSessionTimeout(sessionId: string, req: Request, res: Response) {
    // Clear existing timeout if any
    const existingTimeout = this.activeSessions.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout for session end (30 minutes of inactivity)
    const timeout = setTimeout(async () => {
      try {
        await this.visitorTrackingService.endSession(sessionId);
        this.activeSessions.delete(sessionId);
      } catch (error) {
        this.logger.error('Error ending session on timeout:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    this.activeSessions.set(sessionId, timeout);

    // Clear timeout when connection closes
    res.on('close', () => {
      const timeout = this.activeSessions.get(sessionId);
      if (timeout) {
        clearTimeout(timeout);
        this.activeSessions.delete(sessionId);
      }
    });
  }
}