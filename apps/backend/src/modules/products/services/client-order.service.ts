import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, OrderSource } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ProductVariantRepository } from '../repositories/product-variant.repository';
import { DeliveryMethodService } from './delivery-method.service';
import {
  CustomerTransaction,
  CustomerTransactionEntry,
  CustomerTransactionStatus,
  CustomerTransactionType,
  LedgerAccountType,
  LedgerEntryDirection,
  TransactionChannel,
} from '../../user/entities/customer-transaction.entity';

export interface OrderFilters {
  page: number;
  limit: number;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientOrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface ClientCheckoutTotals {
  subtotal: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  totalAmount?: number;
  currency?: string;
}

export interface ClientCheckoutPaymentMethod {
  type: string;
  cardholderName?: string;
  last4?: string;
  provider?: string;
  reference?: string;
}

export interface CreateClientOrderItemDto {
  productId: string;
  productVariantId?: string;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
  taxAmount?: number;
  productName?: string;
  productSku?: string;
  variantName?: string;
  variantSku?: string;
  productImage?: string;
  productAttributes?: Record<string, string>;
}

interface EnrichedClientOrderItem extends CreateClientOrderItemDto {
  unitPrice: number;
  productName: string;
  productSku?: string;
  variantName?: string;
  variantSku?: string;
  productImage?: string;
  weight?: number;
  dimensions?: string;
}

export interface CreateClientOrderDto {
  email: string;
  shippingAddress: ClientOrderAddress;
  billingAddress?: ClientOrderAddress;
  shippingMethodId?: string;
  paymentMethod: ClientCheckoutPaymentMethod;
  orderNotes?: string;
  items: CreateClientOrderItemDto[];
  totals?: ClientCheckoutTotals;
  agreeToMarketing?: boolean;
}

@Injectable()
export class ClientOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderOrmRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerOrmRepository: Repository<Customer>,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly deliveryMethodService: DeliveryMethodService,
  ) {}

  private mapOrderAddress(address?: ClientOrderAddress | null) {
    if (!address) {
      return undefined;
    }

    return {
      firstName: address.firstName?.trim() ?? '',
      lastName: address.lastName?.trim() ?? '',
      company: address.company?.trim() || undefined,
      address1: address.address1?.trim() ?? '',
      address2: address.address2?.trim() || undefined,
      city: address.city?.trim() ?? '',
      state: address.state?.trim() ?? '',
      postalCode: address.postalCode?.trim() ?? '',
      country: address.country?.trim() ?? '',
    };
  }

  private buildVariantAttributes(variant?: any): Record<string, string> | undefined {
    if (!variant?.variantItems || !Array.isArray(variant.variantItems)) {
      return undefined;
    }

    const attributes: Record<string, string> = {};

    for (const variantItem of variant.variantItems) {
      const key =
        variantItem?.attribute?.displayName ||
        variantItem?.attribute?.name ||
        variantItem?.attributeId ||
        null;
      const value =
        variantItem?.attributeValue?.displayValue ||
        variantItem?.attributeValue?.value ||
        variantItem?.attributeValueId ||
        null;

      if (key && value) {
        attributes[String(key)] = String(value);
      }
    }

    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }

  private async enrichOrderItem(item: CreateClientOrderItemDto): Promise<EnrichedClientOrderItem> {
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Invalid quantity for order item');
    }

    if (item.productVariantId) {
      const variant = await this.productVariantRepository.findById(item.productVariantId, [
        'product',
        'product.media',
        'variantItems',
        'variantItems.attribute',
        'variantItems.attributeValue',
      ]);
      if (!variant) {
        throw new Error(`Product variant with ID ${item.productVariantId} not found`);
      }

      if (!variant.isActive || !variant.canPurchase) {
        throw new Error(`Product variant ${item.productVariantId} is not available for purchase`);
      }

      const parentProduct = variant.product;
      const unitPrice = Number.isFinite(Number(variant.price))
        ? Number(variant.price)
        : Number(item.unitPrice ?? 0);
      const productName = parentProduct?.name ?? item.productName ?? 'Unknown product';
      const productSku = parentProduct?.sku ?? variant.sku ?? item.productSku ?? undefined;
      const variantName = variant.name ?? item.variantName ?? undefined;
      const variantSku = variant.sku ?? item.variantSku ?? undefined;
      const productImage =
        variant.image ||
        (Array.isArray(parentProduct?.media) ? parentProduct?.media?.find((media) => media.isPrimary)?.url : undefined) ||
        (Array.isArray(parentProduct?.media) ? parentProduct?.media?.[0]?.url : undefined) ||
        item.productImage;
      const productAttributes = this.buildVariantAttributes(variant);

      if (Number.isFinite(Number(item.unitPrice)) && Number(item.unitPrice) !== unitPrice) {
        console.warn(
          `Checkout price mismatch detected for variant ${item.productVariantId}: payload=${item.unitPrice}, actual=${unitPrice}`
        );
      }

      return {
        ...item,
        unitPrice,
        productName,
        productSku,
        variantName,
        variantSku,
        productImage,
        productAttributes,
        weight: variant.weight ?? undefined,
        dimensions: variant.dimensions ?? undefined,
      };
    }

    const product = await this.productRepository.findById(item.productId, [
      'media',
      'variants',
    ]);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    const availableVariant = product.variants?.find(variant => variant.isActive && variant.canPurchase)
      ?? product.variants?.[0];

    const resolvedVariantPrice = Number.isFinite(Number(availableVariant?.price))
      ? Number(availableVariant?.price)
      : undefined;
    const unitPrice = resolvedVariantPrice ?? Number(item.unitPrice ?? 0);
    const productSku = product.sku ?? availableVariant?.sku ?? item.productSku ?? undefined;
    const productName = product.name ?? item.productName ?? 'Unknown product';
    const variantName = availableVariant?.name ?? item.variantName ?? undefined;
    const variantSku = availableVariant?.sku ?? item.variantSku ?? undefined;
    const productImage =
      (Array.isArray(product.media) ? product.media.find((media) => media.isPrimary)?.url : undefined) ||
      (Array.isArray(product.media) ? product.media[0]?.url : undefined) ||
      item.productImage;
    const productAttributes = this.buildVariantAttributes(availableVariant);

    if (Number.isFinite(Number(item.unitPrice)) && Number(item.unitPrice) !== unitPrice) {
      console.warn(
        `Checkout price mismatch detected for product ${item.productId}: payload=${item.unitPrice}, actual=${unitPrice}`
      );
    }

    return {
      ...item,
      unitPrice,
      productName,
      productSku,
      variantName,
      variantSku,
      productImage,
      productAttributes,
      weight: availableVariant?.weight ?? undefined,
      dimensions: availableVariant?.dimensions ?? undefined,
    };
  }

  async getUserOrders(filters: OrderFilters): Promise<PaginatedResult<Order>> {
    const { page, limit, status, paymentStatus, sortBy, sortOrder, userId, startDate, endDate } = filters;

    // Find customer associated with the user
    const customer = await this.customerOrmRepository.findOne({
      where: { userId },
      relations: ['orders'],
    });

    if (!customer) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const queryBuilder = this.orderOrmRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.customerId = :customerId', { customerId: customer.id });

    // Apply status filter
    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere('order.status IN (:...status)', { status });
      } else {
        queryBuilder.andWhere('order.status = :status', { status });
      }
    }

    // Apply payment status filter
    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    // Apply date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate });
    }

    // Apply sorting
    const sortColumn = this.getSortColumn(sortBy);
    queryBuilder.orderBy(`order.${sortColumn}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.offset(offset).limit(limit);

    const orders = await queryBuilder.getMany();

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, userId: string): Promise<Order | null> {
    // Find customer associated with the user
    const customer = await this.customerOrmRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      return null;
    }

    const order = await this.orderOrmRepository.findOne({
      where: {
        id: orderId,
        customerId: customer.id,
      },
      relations: ['items', 'items.product', 'customer'],
    });

    return order;
  }

  /**
   * Lookup order by order number and email or phone (for guest order tracking)
   * This allows customers to track their orders without logging in
   * @param orderNumber - The order number to search for
   * @param emailOrPhone - Either email address or phone number used during checkout
   */
  async lookupOrderByNumberAndContact(orderNumber: string, emailOrPhone: string): Promise<Order | null> {
    const sanitizedContact = emailOrPhone?.trim().toLowerCase();
    const sanitizedOrderNumber = orderNumber?.trim().toUpperCase();

    if (!sanitizedContact || !sanitizedOrderNumber) {
      return null;
    }

    // Check if the contact looks like an email or phone
    const isEmail = sanitizedContact.includes('@');
    
    // Build query based on contact type
    const queryBuilder = this.orderOrmRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.fulfillments', 'fulfillments')
      .where('order.orderNumber = :orderNumber', { orderNumber: sanitizedOrderNumber });

    if (isEmail) {
      queryBuilder.andWhere('LOWER(order.customerEmail) = :contact', { contact: sanitizedContact });
    } else {
      // For phone, remove common formatting characters and search
      const cleanPhone = sanitizedContact.replace(/[\s\-\(\)\+\.]/g, '');
      queryBuilder.andWhere(
        `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(order.customerPhone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') LIKE :phone`,
        { phone: `%${cleanPhone}%` }
      );
    }

    const order = await queryBuilder.getOne();

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string): Promise<void> {
    // Find customer associated with the user
    const customer = await this.customerOrmRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const order = await this.orderOrmRepository.findOne({
      where: {
        id: orderId,
        customerId: customer.id,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (!order.canCancel) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Update order status and add cancellation reason
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelledReason = reason;
    order.internalNotes = (order.internalNotes || '') + `\n\nCancelled by customer: ${reason}`;

    await this.orderOrmRepository.save(order);
  }

  async createOrder(payload: CreateClientOrderDto, userId?: string): Promise<Order> {
    if (!payload?.items || payload.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (!payload.shippingAddress) {
      throw new Error('Shipping address is required');
    }

    const sanitizedEmail = payload.email?.trim();
    if (!sanitizedEmail) {
      throw new Error('A valid email is required to place an order');
    }

    const shippingAddress = payload.shippingAddress;
    const billingAddress = payload.billingAddress ?? payload.shippingAddress;

    const enrichedItems = await Promise.all(payload.items.map(item => this.enrichOrderItem(item)));

    const totalsInput = payload.totals ?? { subtotal: 0 };

    const subtotal = enrichedItems.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
    const discountAmount = totalsInput.discountAmount ?? enrichedItems.reduce((sum, item) => sum + Number(item.discountAmount ?? 0), 0);
    const taxAmount = totalsInput.taxAmount ?? enrichedItems.reduce((sum, item) => sum + Number(item.taxAmount ?? 0), 0);

    let shippingCost = totalsInput.shippingCost ?? 0;
    let shippingMethodLabel: string | undefined;

    if (payload.shippingMethodId) {
      try {
        const deliveryMethod = await this.deliveryMethodService.findById(payload.shippingMethodId);
        shippingCost = deliveryMethod.deliveryCost ?? shippingCost;
        shippingMethodLabel = deliveryMethod.name ?? payload.shippingMethodId;
      } catch (error) {
        shippingMethodLabel = payload.shippingMethodId;
      }
    }

    const computedTotal = subtotal + shippingCost + taxAmount - discountAmount;
    const totalAmount = totalsInput.totalAmount ?? Math.max(0, computedTotal);
    const currency = totalsInput.currency ?? 'USD';

    const orderNumber = await this.orderRepository.generateOrderNumber();
    const customerDisplayName = `${shippingAddress.firstName ?? ''} ${shippingAddress.lastName ?? ''}`.trim();

    return this.orderOrmRepository.manager.transaction(async (manager) => {
      const customerRepository = manager.getRepository(Customer);
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);

      let customer: Customer | null = null;

      if (userId) {
        customer = await customerRepository.findOne({ where: { userId } });
      }

      if (!customer) {
        customer = await customerRepository.findOne({ where: { email: sanitizedEmail } });
      }

      if (!customer) {
        customer = customerRepository.create({
          userId: userId ?? null,
          email: sanitizedEmail,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          marketingConsent: Boolean(payload.agreeToMarketing),
          defaultShippingAddress: this.mapOrderAddress(shippingAddress),
          defaultBillingAddress: this.mapOrderAddress(billingAddress),
        });
      } else {
        if (userId && !customer.userId) {
          customer.userId = userId;
        }
        customer.email = sanitizedEmail;
        customer.firstName = customer.firstName ?? shippingAddress.firstName;
        customer.lastName = customer.lastName ?? shippingAddress.lastName;
        customer.phone = shippingAddress.phone ?? customer.phone;
        if (payload.agreeToMarketing !== undefined) {
          customer.marketingConsent = payload.agreeToMarketing;
        }
        customer.defaultShippingAddress = this.mapOrderAddress(shippingAddress);
        customer.defaultBillingAddress = this.mapOrderAddress(billingAddress);
      }

      customer = await customerRepository.save(customer);

      const orderEntity = orderRepository.create({
        orderNumber,
        customerId: customer.id,
        customerEmail: sanitizedEmail,
        customerPhone: shippingAddress.phone,
        customerName: customerDisplayName || sanitizedEmail,
        source: OrderSource.WEBSITE,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderDate: new Date(),
        subtotal,
        taxAmount,
        shippingCost,
        discountAmount,
        totalAmount,
        amountPaid: 0,
        currency,
        billingAddress: this.mapOrderAddress(billingAddress),
        shippingAddress: this.mapOrderAddress(shippingAddress),
        paymentMethod: payload.paymentMethod?.type ?? 'unknown',
        paymentReference: payload.paymentMethod?.reference ?? payload.paymentMethod?.last4 ?? null,
        shippingMethod: shippingMethodLabel,
        notes: payload.orderNotes,
        customerNotes: payload.orderNotes,
      });

      const savedOrder = await orderRepository.save(orderEntity);

      for (const [index, item] of enrichedItems.entries()) {
        const orderItem = orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          productName: item.productName,
          productSku: item.productSku,
          variantName: item.variantName,
          variantSku: item.variantSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: Number(item.unitPrice) * Number(item.quantity),
          discountAmount: item.discountAmount ?? 0,
          taxAmount: item.taxAmount ?? 0,
          productImage: item.productImage,
          productAttributes: item.productAttributes,
          requiresShipping: true,
          sortOrder: index,
        });

        await orderItemRepository.save(orderItem);
      }

      customer.updateOrderStats(Number(totalAmount));
      await customerRepository.save(customer);

      await this.recordOrderPaymentTransaction(manager, {
        customerId: customer.id,
        order: savedOrder,
        paymentMethod: payload.paymentMethod,
        subtotal,
        taxAmount,
        shippingCost,
        discountAmount,
        totalAmount,
        currency,
        itemCount: enrichedItems.length,
      });

      return orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items'],
      }) as Promise<Order>;
    });
  }

  async getOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  }> {
    // Find customer associated with the user
    const customer = await this.customerOrmRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
      };
    }

    const orders = await this.orderOrmRepository.find({
      where: { customerId: customer.id },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const pendingOrders = orders.filter(order =>
      [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter(order => order.status === OrderStatus.CANCELLED).length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
    };
  }

  private getSortColumn(sortBy: string): string {
    switch (sortBy) {
      case 'totalAmount':
        return 'totalAmount';
      case 'status':
        return 'status';
      case 'orderDate':
      default:
        return 'orderDate';
    }
  }

  private async recordOrderPaymentTransaction(
    manager: EntityManager,
    params: {
      customerId: string;
      order: Order;
      paymentMethod?: ClientCheckoutPaymentMethod;
      subtotal: number;
      taxAmount: number;
      shippingCost: number;
      discountAmount: number;
      totalAmount: number;
      currency?: string;
      itemCount: number;
    },
  ): Promise<void> {
    const normalizedAmount = this.normalizeCurrencyValue(params.totalAmount);
    if (normalizedAmount <= 0 || !params.order?.id) {
      return;
    }

    const transactionRepository = manager.getRepository(CustomerTransaction);

    const existingTransaction = await transactionRepository.findOne({
      where: {
        relatedEntityType: 'order',
        relatedEntityId: params.order.id,
      },
    });

    if (existingTransaction) {
      return;
    }

    const currency = (params.currency || params.order.currency || 'USD').toUpperCase();
    const paymentType = params.paymentMethod?.type || params.order.paymentMethod || 'unknown';
    const referenceId =
      params.paymentMethod?.reference ||
      params.order.paymentReference ||
      params.paymentMethod?.last4 ||
      params.order.orderNumber;
    const description = `Payment for order #${params.order.orderNumber ?? params.order.id} via ${paymentType}`;

    const entryCount = 2;
    const transactionPayload = {
      customerId: params.customerId,
      type: CustomerTransactionType.ORDER_PAYMENT,
      status: CustomerTransactionStatus.PENDING,
      impactDirection: LedgerEntryDirection.DEBIT,
      impactAmount: normalizedAmount,
      currency,
      channel: TransactionChannel.CUSTOMER,
      referenceId: referenceId ?? undefined,
      description,
      relatedEntityType: 'order' as const,
      relatedEntityId: params.order.id,
      metadata: {
        orderId: params.order.id,
        orderNumber: params.order.orderNumber,
        paymentMethod: params.paymentMethod?.type ?? params.order.paymentMethod,
        paymentReference: params.paymentMethod?.reference ?? params.order.paymentReference,
        provider: params.paymentMethod?.provider,
        last4: params.paymentMethod?.last4,
        totals: {
          subtotal: this.normalizeCurrencyValue(params.subtotal),
          taxAmount: this.normalizeCurrencyValue(params.taxAmount),
          shippingCost: this.normalizeCurrencyValue(params.shippingCost),
          discountAmount: this.normalizeCurrencyValue(params.discountAmount),
          totalAmount: normalizedAmount,
        },
        itemCount: params.itemCount,
      },
      transactionCode: this.generateTransactionCode(),
      totalAmount: normalizedAmount,
      entryCount,
    };

    const insertResult = await transactionRepository
      .createQueryBuilder()
      .insert()
      .values(transactionPayload)
      .returning(['id'])
      .execute();

    const transactionId = insertResult.identifiers?.[0]?.id as string | undefined;
    if (!transactionId) {
      return;
    }

    const entries = this.buildLedgerEntries(
      transactionId,
      normalizedAmount,
      currency,
      LedgerEntryDirection.DEBIT,
      LedgerAccountType.PLATFORM_CLEARING,
      description,
    );

    const entryRepository = manager.getRepository(CustomerTransactionEntry);
    await entryRepository
      .createQueryBuilder()
      .insert()
      .values(entries)
      .execute();
  }

  private buildLedgerEntries(
    transactionId: string,
    amount: number,
    currency: string,
    direction: LedgerEntryDirection,
    counterAccount: LedgerAccountType,
    description?: string,
  ): Array<Partial<CustomerTransactionEntry>> {
    const primaryEntry: Partial<CustomerTransactionEntry> = {
      transactionId,
      ledgerAccount: LedgerAccountType.CUSTOMER_BALANCE,
      entryDirection: direction,
      amount,
      currency,
      description,
    };

    const counterEntry: Partial<CustomerTransactionEntry> = {
      transactionId,
      ledgerAccount: counterAccount,
      entryDirection:
        direction === LedgerEntryDirection.CREDIT
          ? LedgerEntryDirection.DEBIT
          : LedgerEntryDirection.CREDIT,
      amount,
      currency,
      description,
    };

    return [primaryEntry, counterEntry];
  }

  private generateTransactionCode(): string {
    return `CTX-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
  }

  private normalizeCurrencyValue(value?: number | null): number {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }
    return Math.round((numericValue + Number.EPSILON) * 100) / 100;
  }
}
