import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductStatsRecomputeJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductStatsRecomputeJob.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    const initialDelay = this.configService.get<number>('cron.productStats.initialDelayMs') ?? 5000;
    this.logger.log(`Starting product stats recompute (interval=${this.intervalMs}ms)`);
    this.scheduleNextRun(initialDelay);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private get intervalMs(): number {
    return this.configService.get<number>('cron.productStats.intervalMs') ?? 300000;
  }

  private scheduleNextRun(delay?: number): void {
    const nextDelay = delay ?? this.intervalMs;
    this.timer = setTimeout(async () => {
      await this.recomputeStats();
      this.scheduleNextRun();
    }, Math.max(nextDelay, 1000));
  }

  private async recomputeStats(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Product stats recompute already running, skipping interval');
      return;
    }

    this.isProcessing = true;
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.query(`
          WITH review_stats AS (
            SELECT
              product_id,
              COUNT(*)::int AS review_count,
              AVG(rating)::numeric AS average_rating
            FROM product_reviews
            WHERE status = 'APPROVED'
            GROUP BY product_id
          )
          UPDATE products p
          SET review_count = rs.review_count,
              average_rating = rs.average_rating
          FROM review_stats rs
          WHERE p.id = rs.product_id
        `);

        await manager.query(`
          UPDATE products
          SET review_count = 0,
              average_rating = NULL
          WHERE id NOT IN (
            SELECT product_id FROM product_reviews WHERE status = 'APPROVED'
          )
        `);

        await manager.query(`
          WITH view_stats AS (
            SELECT
              resource_id AS product_id,
              COUNT(*)::int AS view_count
            FROM page_views
            WHERE page_type = 'product_view' AND resource_id IS NOT NULL
            GROUP BY resource_id
          )
          UPDATE products p
          SET view_count = vs.view_count
          FROM view_stats vs
          WHERE p.id = vs.product_id
        `);

        await manager.query(`
          UPDATE products
          SET view_count = 0
          WHERE id NOT IN (
            SELECT resource_id FROM page_views WHERE page_type = 'product_view' AND resource_id IS NOT NULL
          )
        `);

        await manager.query(`
          WITH sold_stats AS (
            SELECT
              oi.product_id AS product_id,
              SUM(GREATEST(oi.quantity - COALESCE(oi.refunded_quantity, 0) - COALESCE(oi.returned_quantity, 0), 0))::int AS sold_count
            FROM order_items oi
            INNER JOIN orders o ON o.id = oi.order_id
            WHERE o.payment_status = 'PAID'
              AND o.status NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY oi.product_id
          )
          UPDATE products p
          SET sold_count = ss.sold_count
          FROM sold_stats ss
          WHERE p.id = ss.product_id
        `);

        await manager.query(`
          UPDATE products
          SET sold_count = 0
          WHERE id NOT IN (
            SELECT oi.product_id
            FROM order_items oi
            INNER JOIN orders o ON o.id = oi.order_id
            WHERE o.payment_status = 'PAID'
              AND o.status NOT IN ('CANCELLED', 'REFUNDED')
          )
        `);
      });

      this.logger.log('Product stats recompute completed');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Product stats recompute failed: ${err.message}`, err.stack);
    } finally {
      this.isProcessing = false;
    }
  }
}
