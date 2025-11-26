import { Visitor, VisitorType, VisitorSource } from '../entities/visitor.entity';
import { VisitorSession, SessionStatus } from '../entities/visitor-session.entity';
import { PageView, PageViewType } from '../entities/page-view.entity';

export interface IVisitorRepository {
  // Visitor operations
  findByVisitorId(visitorId: string): Promise<Visitor | null>;
  findByIdWithSessions(id: string): Promise<Visitor | null>;
  createVisitor(data: Partial<Visitor>): Promise<Visitor>;
  updateVisitor(id: string, data: Partial<Visitor>): Promise<Visitor>;
  findVisitorsByDateRange(startDate: Date, endDate: Date): Promise<Visitor[]>;
  findVisitorsByType(type: VisitorType): Promise<Visitor[]>;
  findVisitorsBySource(source: VisitorSource): Promise<Visitor[]>;
  getVisitorStats(startDate: Date, endDate: Date): Promise<any>;

  // Session operations
  findBySessionId(sessionId: string): Promise<VisitorSession | null>;
  findSessionsByVisitorId(visitorId: string): Promise<VisitorSession[]>;
  createSession(data: Partial<VisitorSession>): Promise<VisitorSession>;
  updateSession(id: string, data: Partial<VisitorSession>): Promise<VisitorSession>;
  findActiveSessions(): Promise<VisitorSession[]>;
  findSessionsByDateRange(startDate: Date, endDate: Date): Promise<VisitorSession[]>;
  getSessionStats(startDate: Date, endDate: Date): Promise<any>;

  // Page view operations
  createPageView(data: Partial<PageView>): Promise<PageView>;
  findPageViewsBySessionId(sessionId: string): Promise<PageView[]>;
  findPageViewsByDateRange(startDate: Date, endDate: Date): Promise<PageView[]>;
  findPageViewsByType(type: PageViewType): Promise<PageView[]>;
  findPopularPages(limit: number, startDate?: Date, endDate?: Date): Promise<any[]>;
  getPageViewStats(startDate: Date, endDate: Date): Promise<any>;
}