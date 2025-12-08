import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationEvent } from '../../notifications/entities/notification-event.enum';
import { OrderPayload, OrderResult } from '../interfaces/worker-payloads.interface';
import { WorkerEmailService } from './worker-email.service';

@Injectable()
export class WorkerOrderService {
  private readonly logger = new Logger(WorkerOrderService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly workerEmailService: WorkerEmailService,
  ) {}

  /**
   * Process order events
   */
  async processOrder(payload: OrderPayload): Promise<OrderResult> {
    this.logger.log(`Processing order ${payload.orderId} - Action: ${payload.action}`);

    const result: OrderResult = {
      success: false,
      orderId: payload.orderId,
      action: payload.action,
    };

    try {
      switch (payload.action) {
        case 'created':
          await this.handleOrderCreated(payload, result);
          break;
        case 'confirmed':
          await this.handleOrderConfirmed(payload, result);
          break;
        case 'shipped':
          await this.handleOrderShipped(payload, result);
          break;
        case 'delivered':
          await this.handleOrderDelivered(payload, result);
          break;
        case 'cancelled':
          await this.handleOrderCancelled(payload, result);
          break;
        case 'refunded':
          await this.handleOrderRefunded(payload, result);
          break;
        default:
          this.logger.warn(`Unknown order action: ${payload.action}`);
          result.error = `Unknown action: ${payload.action}`;
          return result;
      }

      result.success = true;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process order ${payload.orderId}: ${errorMessage}`);
      result.error = errorMessage;
      return result;
    }
  }

  /**
   * Handle new order created
   */
  private async handleOrderCreated(payload: OrderPayload, result: OrderResult): Promise<void> {
    this.logger.log(`Order created: ${payload.orderId}`);

    // Send notification
    if (payload.notifyUser !== false) {
      const amount = this.formatAmount(payload.orderData?.totalAmount, payload.orderData?.currency);
      
      await this.notificationService.sendOrderNotification(
        payload.userId,
        'Đơn hàng đã được tạo',
        `Đơn hàng #${payload.orderId.slice(-8).toUpperCase()} với giá trị ${amount} đã được tạo thành công.`,
        payload.orderId,
        `/orders/${payload.orderId}`,
        undefined,
        NotificationEvent.ORDER_CREATED
      );
      result.notificationSent = true;
    }

    // Send confirmation email
    if (payload.sendEmail !== false) {
      await this.sendOrderEmail(payload, 'created');
      result.emailSent = true;
    }

    // TODO: Update inventory (reserve items)
    // This would call an inventory service
    
    // TODO: Calculate and add loyalty points (pending)
    // This would call a loyalty service
  }

  /**
   * Handle order confirmed
   */
  private async handleOrderConfirmed(payload: OrderPayload, result: OrderResult): Promise<void> {
    this.logger.log(`Order confirmed: ${payload.orderId}`);

    if (payload.notifyUser !== false) {
      await this.notificationService.sendOrderNotification(
        payload.userId,
        'Đơn hàng đã được xác nhận',
        `Đơn hàng #${payload.orderId.slice(-8).toUpperCase()} đã được xác nhận và đang được xử lý.`,
        payload.orderId,
        `/orders/${payload.orderId}`,
        undefined,
        NotificationEvent.ORDER_CONFIRMED
      );
      result.notificationSent = true;
    }

    if (payload.sendEmail !== false) {
      await this.sendOrderEmail(payload, 'confirmed');
      result.emailSent = true;
    }
  }

  /**
   * Handle order shipped
   */
  private async handleOrderShipped(payload: OrderPayload, result: OrderResult): Promise<void> {
    this.logger.log(`Order shipped: ${payload.orderId}`);

    const trackingInfo = payload.orderData?.trackingNumber
      ? ` Mã vận đơn: ${payload.orderData.trackingNumber}`
      : '';

    if (payload.notifyUser !== false) {
      await this.notificationService.sendOrderNotification(
        payload.userId,
        'Đơn hàng đang được giao',
        `Đơn hàng #${payload.orderId.slice(-8).toUpperCase()} đã được giao cho đơn vị vận chuyển.${trackingInfo}`,
        payload.orderId,
        `/orders/${payload.orderId}`,
        undefined,
        NotificationEvent.ORDER_SHIPPED
      );
      result.notificationSent = true;
    }

    if (payload.sendEmail !== false) {
      await this.sendOrderEmail(payload, 'shipped');
      result.emailSent = true;
    }
  }

  /**
   * Handle order delivered
   */
  private async handleOrderDelivered(payload: OrderPayload, result: OrderResult): Promise<void> {
    this.logger.log(`Order delivered: ${payload.orderId}`);

    if (payload.notifyUser !== false) {
      await this.notificationService.sendOrderNotification(
        payload.userId,
        'Đơn hàng đã giao thành công',
        `Đơn hàng #${payload.orderId.slice(-8).toUpperCase()} đã được giao thành công. Cảm ơn bạn đã mua hàng!`,
        payload.orderId,
        `/orders/${payload.orderId}`,
        undefined,
        NotificationEvent.ORDER_DELIVERED
      );
      result.notificationSent = true;
    }

    if (payload.sendEmail !== false) {
      await this.sendOrderEmail(payload, 'delivered');
      result.emailSent = true;
    }

    // TODO: Award loyalty points
    // This would finalize pending loyalty points
    result.loyaltyPointsUpdated = false; // Placeholder
  }

  /**
   * Handle order cancelled
   */
  private async handleOrderCancelled(payload: OrderPayload, result: OrderResult): Promise<void> {
    this.logger.log(`Order cancelled: ${payload.orderId}`);

    if (payload.notifyUser !== false) {
      await this.notificationService.sendOrderNotification(
        payload.userId,
        'Đơn hàng đã bị hủy',
        `Đơn hàng #${payload.orderId.slice(-8).toUpperCase()} đã bị hủy. Nếu bạn đã thanh toán, số tiền sẽ được hoàn lại.`,
        payload.orderId,
        `/orders/${payload.orderId}`,
        undefined,
        NotificationEvent.ORDER_CANCELLED
      );
      result.notificationSent = true;
    }

    if (payload.sendEmail !== false) {
      await this.sendOrderEmail(payload, 'cancelled');
      result.emailSent = true;
    }

    // TODO: Restore inventory
    // This would release reserved inventory
    result.inventoryUpdated = false; // Placeholder

    // TODO: Cancel pending loyalty points
  }

  /**
   * Handle order refunded
   */
  private async handleOrderRefunded(payload: OrderPayload, result: OrderResult): Promise<void> {
    this.logger.log(`Order refunded: ${payload.orderId}`);

    const amount = this.formatAmount(payload.orderData?.totalAmount, payload.orderData?.currency);

    if (payload.notifyUser !== false) {
      await this.notificationService.sendOrderNotification(
        payload.userId,
        'Đơn hàng đã được hoàn tiền',
        `Đơn hàng #${payload.orderId.slice(-8).toUpperCase()} đã được hoàn tiền ${amount}. Vui lòng kiểm tra tài khoản của bạn.`,
        payload.orderId,
        `/orders/${payload.orderId}`,
        undefined,
        NotificationEvent.ORDER_REFUNDED
      );
      result.notificationSent = true;
    }

    if (payload.sendEmail !== false) {
      await this.sendOrderEmail(payload, 'refunded');
      result.emailSent = true;
    }

    // TODO: Deduct loyalty points if already awarded
  }

  /**
   * Send order-related email
   */
  private async sendOrderEmail(
    payload: OrderPayload,
    status: 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  ): Promise<void> {
    // TODO: Get user email from user service
    // For now, we'll skip email if no email is provided
    // This would typically query the user's email address
    
    const emailTemplates: Record<string, { subject: string; template: string }> = {
      created: {
        subject: 'Xác nhận đơn hàng',
        template: 'order-created',
      },
      confirmed: {
        subject: 'Đơn hàng đã được xác nhận',
        template: 'order-confirmed',
      },
      shipped: {
        subject: 'Đơn hàng đang được giao',
        template: 'order-shipped',
      },
      delivered: {
        subject: 'Đơn hàng đã giao thành công',
        template: 'order-delivered',
      },
      cancelled: {
        subject: 'Đơn hàng đã bị hủy',
        template: 'order-cancelled',
      },
      refunded: {
        subject: 'Đơn hàng đã được hoàn tiền',
        template: 'order-refunded',
      },
    };

    const template = emailTemplates[status];
    
    this.logger.log(`Would send ${template.template} email for order ${payload.orderId}`);
    // Actual email sending would happen here via workerEmailService
  }

  /**
   * Format amount with currency
   */
  private formatAmount(amount?: number, currency?: string): string {
    if (amount === undefined) return '';
    
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
    });
    
    return formatter.format(amount);
  }
}
