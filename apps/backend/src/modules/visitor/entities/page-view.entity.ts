import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { VisitorSession } from './visitor-session.entity';

export enum PageViewType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  CATEGORY_VIEW = 'category_view',
  SEARCH_VIEW = 'search_view',
  CHECKOUT_VIEW = 'checkout_view',
  CART_VIEW = 'cart_view',
  BLOG_VIEW = 'blog_view',
  OTHER = 'other'
}

@Entity('page_views')
@Index(['sessionId', 'createdAt'])
@Index(['pageUrl', 'createdAt'])
@Index(['pageType', 'createdAt'])
export class PageView extends SoftDeletableEntity {
  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'page_url' })
  pageUrl: string;

  @Column({ name: 'page_title', nullable: true })
  pageTitle: string;

  @Column({
    name: 'page_type',
    type: 'enum',
    enum: PageViewType,
    default: PageViewType.PAGE_VIEW
  })
  pageType: PageViewType;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string; // Product ID, category ID, etc.

  @Column({ name: 'resource_type', nullable: true })
  resourceType: string; // 'product', 'category', etc.

  @Column({ name: 'referrer_url', nullable: true })
  referrerUrl: string;

  @Column({ name: 'search_query', nullable: true })
  searchQuery: string;

  @Column({ name: 'time_on_page_seconds', nullable: true })
  timeOnPageSeconds: number;

  @Column({ name: 'viewport_width', nullable: true })
  viewportWidth: number;

  @Column({ name: 'viewport_height', nullable: true })
  viewportHeight: number;

  @Column({ name: 'scroll_depth_percent', nullable: true })
  scrollDepthPercent: number;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true
  })
  metadata: Record<string, any>;

  @ManyToOne(() => VisitorSession, session => session.pageViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: VisitorSession;

  // Helper methods
  static createPageView(data: {
    sessionId: string;
    pageUrl: string;
    pageTitle?: string;
    pageType?: PageViewType;
    resourceId?: string;
    resourceType?: string;
    referrerUrl?: string;
    searchQuery?: string;
    timeOnPageSeconds?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    scrollDepthPercent?: number;
    metadata?: Record<string, any>;
  }): Partial<PageView> {
    return {
      sessionId: data.sessionId,
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      pageType: data.pageType || PageViewType.PAGE_VIEW,
      resourceId: data.resourceId,
      resourceType: data.resourceType,
      referrerUrl: data.referrerUrl,
      searchQuery: data.searchQuery,
      timeOnPageSeconds: data.timeOnPageSeconds,
      viewportWidth: data.viewportWidth,
      viewportHeight: data.viewportHeight,
      scrollDepthPercent: data.scrollDepthPercent,
      metadata: data.metadata,
    };
  }

  static detectPageType(url: string, title?: string): PageViewType {
    const lowerUrl = url.toLowerCase();
    const lowerTitle = title?.toLowerCase() || '';

    if (lowerUrl.includes('/products/') || lowerUrl.includes('/product/')) {
      return PageViewType.PRODUCT_VIEW;
    }
    if (lowerUrl.includes('/categories/') || lowerUrl.includes('/category/')) {
      return PageViewType.CATEGORY_VIEW;
    }
    if (lowerUrl.includes('/search') || lowerUrl.includes('q=') || lowerTitle.includes('search')) {
      return PageViewType.SEARCH_VIEW;
    }
    if (lowerUrl.includes('/checkout')) {
      return PageViewType.CHECKOUT_VIEW;
    }
    if (lowerUrl.includes('/cart')) {
      return PageViewType.CART_VIEW;
    }
    if (lowerUrl.includes('/blog/') || lowerTitle.includes('blog') || lowerTitle.includes('news')) {
      return PageViewType.BLOG_VIEW;
    }

    return PageViewType.PAGE_VIEW;
  }
}