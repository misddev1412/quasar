import { Body, Controller, Headers, Logger, Post, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { CustomerTransaction, CustomerTransactionStatus } from '../../user/entities/customer-transaction.entity';
import { PayosService } from '../services/payos.service';

@Controller('payment-webhooks/payos')
export class PayosWebhookController {
  private readonly logger = new Logger(PayosWebhookController.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(CustomerTransaction)
    private readonly customerTransactionRepository: Repository<CustomerTransaction>,
    private readonly payosService: PayosService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() body: Record<string, any>,
    @Headers('x-payos-signature') signatureHeader?: string,
  ) {
    const payload = body?.data;
    if (!payload) {
      throw new BadRequestException('Invalid PayOS webhook payload');
    }

    const orderCode = payload.orderCode ?? body?.orderCode;
    if (!orderCode) {
      throw new BadRequestException('Missing order code in PayOS webhook payload');
    }

    const signature = signatureHeader || body?.signature;
    const order = await this.orderRepository.findOne({
      where: { paymentReference: String(orderCode) },
    });

    if (!order) {
      this.logger.warn(`PayOS webhook received for unknown order code ${orderCode}`);
      return { success: true };
    }

    const provider = await this.payosService.findProviderById(order.paymentData?.providerId);
    const checksumKey = provider?.checksumKey || process.env.PAYOS_CHECKSUM_KEY;

    if (!checksumKey) {
      throw new BadRequestException('Unable to verify PayOS signature: checksum key missing');
    }

    const isValidSignature = this.payosService.verifyWebhookSignature(payload, signature, checksumKey);
    if (!isValidSignature) {
      throw new BadRequestException('Invalid PayOS webhook signature');
    }

    const status = this.normalizeState(payload.state || payload.status || payload.gatewayStatus);
    const code = body?.code || payload?.code;

    if (status === 'SUCCEEDED' || code === '00' || status === 'PAID') {
      await this.applySuccessState(order, body);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      await this.applyFailedState(order, body);
    } else {
      await this.appendWebhookSnapshot(order, body);
    }

    return { success: true };
  }

  private normalizeState(state?: string): string | undefined {
    if (!state) {
      return undefined;
    }
    return String(state).trim().toUpperCase();
  }

  private async applySuccessState(order: Order, webhookBody: Record<string, any>): Promise<void> {
    order.paymentStatus = PaymentStatus.PAID;
    order.status = order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status;
    order.amountPaid = order.totalAmount;
    order.paymentData = {
      ...(order.paymentData || {}),
      lastWebhook: webhookBody,
    };

    await this.orderRepository.save(order);
    await this.updateCustomerTransaction(order, webhookBody, CustomerTransactionStatus.COMPLETED);
  }

  private async applyFailedState(order: Order, webhookBody: Record<string, any>): Promise<void> {
    order.paymentStatus = PaymentStatus.FAILED;
    order.paymentData = {
      ...(order.paymentData || {}),
      lastWebhook: webhookBody,
    };

    await this.orderRepository.save(order);
    await this.updateCustomerTransaction(order, webhookBody, CustomerTransactionStatus.FAILED);
  }

  private async appendWebhookSnapshot(order: Order, webhookBody: Record<string, any>): Promise<void> {
    order.paymentData = {
      ...(order.paymentData || {}),
      lastWebhook: webhookBody,
    };
    await this.orderRepository.save(order);
  }

  private async updateCustomerTransaction(
    order: Order,
    webhookBody: Record<string, any>,
    status: CustomerTransactionStatus,
  ): Promise<void> {
    const transaction = await this.customerTransactionRepository.findOne({
      where: {
        relatedEntityType: 'order',
        relatedEntityId: order.id,
      },
    });

    if (!transaction) {
      return;
    }

    transaction.status = status;
    transaction.processedAt = new Date();
    transaction.metadata = {
      ...(transaction.metadata || {}),
      payosWebhook: webhookBody,
    };

    await this.customerTransactionRepository.save(transaction);
  }
}
