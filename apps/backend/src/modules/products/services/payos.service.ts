import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import crypto from 'crypto';
import { PaymentMethodProviderRepository } from '../repositories/payment-method-provider.repository';
import { PaymentMethodProvider } from '../entities/payment-method-provider.entity';

export interface PayosCheckoutItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  taxPercentage?: number;
}

export interface PayosCreatePaymentParams {
  paymentMethodId?: string;
  amount: number;
  currency?: string;
  orderCode: number;
  description: string;
  returnUrl?: string;
  cancelUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  items?: PayosCheckoutItem[];
  metadata?: Record<string, any>;
}

export interface PayosPaymentRequestResult {
  providerId: string;
  providerKey: string;
  displayName: string;
  orderCode: number;
  amount: number;
  checkoutUrl?: string;
  qrCode?: string;
  paymentLinkId?: string;
  expiresAt?: number;
  payload: any;
}

@Injectable()
export class PayosService {
  private readonly logger = new Logger(PayosService.name);

  constructor(
    private readonly paymentMethodProviderRepository: PaymentMethodProviderRepository,
  ) {}

  async createPaymentRequest(params: PayosCreatePaymentParams): Promise<PayosPaymentRequestResult> {
    const provider = await this.resolveProvider(params.paymentMethodId);
    if (!provider) {
      throw new BadRequestException('PayOS provider configuration is missing or inactive.');
    }

    if (!provider.clientId || !provider.apiKey || !provider.checksumKey) {
      throw new BadRequestException('PayOS credentials are not fully configured.');
    }

    const amount = Math.max(1, Math.round(Number(params.amount) || 0));
    const description = params.description?.trim() || `Order ${params.orderCode}`;
    const returnUrl = params.returnUrl || params.metadata?.returnUrl || provider.callbackUrl || process.env.PAYOS_RETURN_URL;
    const cancelUrl = params.cancelUrl || params.metadata?.cancelUrl || provider.settings?.cancelUrl || process.env.PAYOS_CANCEL_URL;

    if (!returnUrl || !cancelUrl) {
      throw new BadRequestException('Return and cancel URLs are required for PayOS payments.');
    }

    const payload: Record<string, any> = {
      orderCode: params.orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
      buyerName: params.buyerName,
      buyerEmail: params.buyerEmail,
      buyerPhone: params.buyerPhone,
      currency: params.currency || 'VND',
    };

    if (Array.isArray(params.items) && params.items.length > 0) {
      payload.items = params.items.map((item) => ({
        name: item.name,
        quantity: Math.max(1, Math.round(Number(item.quantity) || 0)),
        price: Math.max(0, Math.round(Number(item.price) || 0)),
        unit: item.unit,
        taxPercentage: item.taxPercentage,
      }));
    }

    const signature = this.buildPaymentSignature(payload, provider.checksumKey);
    payload.signature = signature;

    const apiBase = this.resolveApiBaseUrl(provider);
    try {
      const response = await axios.post(`${apiBase}/v2/payment-requests`, payload, {
        headers: {
          'x-client-id': provider.clientId,
          'x-api-key': provider.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      const responseBody = response.data ?? {};
      if (responseBody.code && responseBody.code !== '00') {
        throw new BadRequestException(responseBody.desc || 'PayOS rejected the payment request');
      }

      const responseData = responseBody.data ?? {};

      return {
        providerId: provider.id,
        providerKey: provider.providerKey,
        displayName: provider.displayName ?? provider.providerKey ?? 'PayOS',
        orderCode: params.orderCode,
        amount,
        checkoutUrl: responseData.checkoutUrl,
        qrCode: responseData.qrCode,
        paymentLinkId: responseData.paymentLinkId,
        expiresAt: responseData.expiredAt,
        payload: responseBody,
      };
    } catch (error) {
      this.logger.error('PayOS payment request failed', error);
      if (error.response?.data?.desc) {
        throw new BadRequestException(`PayOS error: ${error.response.data.desc}`);
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create PayOS payment request');
    }
  }

  verifyWebhookSignature(data: Record<string, any>, signature: string | undefined, checksumKey: string): boolean {
    if (!signature) {
      return false;
    }

    const sorted = this.deepSortObject(data);
    const normalizedPayload = JSON.stringify(sorted);
    const computedSignature = crypto.createHmac('sha256', checksumKey).update(normalizedPayload).digest('hex');
    return computedSignature === signature;
  }

  async findProviderById(providerId?: string): Promise<PaymentMethodProvider | null> {
    if (!providerId) {
      return null;
    }
    return this.paymentMethodProviderRepository.findById(providerId);
  }

  private async resolveProvider(paymentMethodId?: string): Promise<PaymentMethodProvider | null> {
    if (paymentMethodId) {
      const provider = await this.paymentMethodProviderRepository.findByPaymentMethod(paymentMethodId);
      if (provider?.isActive) {
        return provider;
      }
    }

    return this.paymentMethodProviderRepository.findActiveByProviderKey('PAYOS');
  }

  private resolveApiBaseUrl(provider: PaymentMethodProvider): string {
    const base =
      provider.settings?.apiBaseUrl ||
      provider.settings?.baseUrl ||
      provider.metadata?.apiBaseUrl ||
      process.env.PAYOS_API_BASE_URL ||
      'https://api-merchant.payos.vn';
    return base.replace(/\/$/, '');
  }

  private buildPaymentSignature(payload: Record<string, any>, checksumKey: string): string {
    const segments = [
      `amount=${payload.amount}`,
      `cancelUrl=${payload.cancelUrl}`,
      `description=${payload.description}`,
      `orderCode=${payload.orderCode}`,
      `returnUrl=${payload.returnUrl}`,
    ];
    return crypto.createHmac('sha256', checksumKey).update(segments.join('&')).digest('hex');
  }

  private deepSortObject(obj: Record<string, any>): Record<string, any> {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.deepSortObject(item))
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }

    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        const value = obj[key];
        if (value === undefined || value === null) {
          acc[key] = '';
        } else {
          acc[key] = this.deepSortObject(value);
        }
        return acc;
      }, {} as Record<string, any>);
  }
}
