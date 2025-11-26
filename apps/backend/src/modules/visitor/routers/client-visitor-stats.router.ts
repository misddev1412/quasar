import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input, Mutation, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminVisitorStatisticsService } from '../services/admin/admin-visitor-statistics.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { VisitorTrackingService } from '../services/visitor-tracking.service';

// Zod schemas for validation
const GetPublicStatsSchema = z.object({
  days: z.number().min(1).max(30).default(7), // Limited to last 30 days for public
  limit: z.number().min(1).max(10).default(5), // Limited top pages for public
});

const TrackStorefrontVisitorSchema = z.object({
  fingerprint: z.string().min(8, 'Fingerprint is required'),
  sessionId: z.string().optional(),
  pageUrl: z.string().min(1),
  pageTitle: z.string().optional(),
  referrer: z.string().optional(),
  timeOnPageSeconds: z.number().int().min(0).optional(),
  viewportWidth: z.number().int().positive().optional(),
  viewportHeight: z.number().int().positive().optional(),
  scrollDepthPercent: z.number().min(0).max(100).optional(),
  language: z.string().optional(),
  timezoneOffset: z.number().optional(),
});

@Router({ alias: 'clientVisitorStats' })
@Injectable()
export class ClientVisitorStatsRouter {
  constructor(
    @Inject(AdminVisitorStatisticsService)
    private readonly adminVisitorStatisticsService: AdminVisitorStatisticsService,
    @Inject(VisitorTrackingService)
    private readonly visitorTrackingService: VisitorTrackingService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: GetPublicStatsSchema,
    output: apiResponseSchema,
  })
  async getPublicStats(
    @Input() input: z.infer<typeof GetPublicStatsSchema>
  ) {
    try {
      // Return limited public statistics for storefront display
      const overallStats = await this.adminVisitorStatisticsService.getOverallStatistics(input.days);
      const topPages = await this.adminVisitorStatisticsService.getTopPages(input.limit, input.days);

      const publicStats = {
        totalVisitors: overallStats.visitors.totalVisitors,
        totalPageViews: overallStats.pageViews.totalPageViews,
        topPages: topPages.map(page => ({
          url: page.url,
          title: page.title,
          views: page.uniqueViews
        })),
        // Don't expose sensitive data like IPs, detailed analytics, etc.
        lastUpdated: new Date().toISOString(),
      };

      return this.responseHandler.createTrpcSuccess(publicStats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve public statistics'
      );
    }
  }

  @Mutation({
    input: TrackStorefrontVisitorSchema,
    output: apiResponseSchema,
  })
  async trackStorefrontVisitor(
    @Input() input: z.infer<typeof TrackStorefrontVisitorSchema>,
    @Ctx() ctx: any,
  ) {
    try {
      const result = await this.visitorTrackingService.trackStorefrontVisitor({
        fingerprint: input.fingerprint,
        sessionId: input.sessionId,
        pageUrl: input.pageUrl,
        pageTitle: input.pageTitle,
        referrer: input.referrer,
        timeOnPageSeconds: input.timeOnPageSeconds,
        viewportWidth: input.viewportWidth,
        viewportHeight: input.viewportHeight,
        scrollDepthPercent: input.scrollDepthPercent,
        language: input.language || ctx?.locale,
        timezoneOffset: input.timezoneOffset,
        userAgent: ctx?.req?.headers['user-agent'],
        ipAddress: ctx?.req?.ip || ctx?.req?.socket?.remoteAddress,
      });

      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        2,  // OperationCode.WRITE
        50, // ErrorLevelCode.VALIDATION_ERROR
        error.message || 'Failed to track storefront visitor'
      );
    }
  }
}
