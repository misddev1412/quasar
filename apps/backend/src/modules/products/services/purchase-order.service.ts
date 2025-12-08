import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository';
import { InventoryItemRepository } from '../repositories/inventory-item.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem, InventoryItem, MovementType, MovementReason } from '../entities';

export interface CreatePurchaseOrderDto {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdBy?: string;
  items: {
    productVariantId: string;
    quantityOrdered: number;
    unitCost: number;
    notes?: string;
  }[];
}

export interface UpdatePurchaseOrderDto {
  supplierId?: string;
  warehouseId?: string;
  expectedDeliveryDate?: Date;
  notes?: string;
  termsAndConditions?: string;
  items?: {
    id?: string;
    productVariantId: string;
    quantityOrdered: number;
    unitCost: number;
    notes?: string;
  }[];
}

export interface ReceiveItemsDto {
  receivedBy?: string;
  items: {
    purchaseOrderItemId: string;
    quantityReceived: number;
    locationId?: string;
    batchNumber?: string;
    expiryDate?: Date;
    notes?: string;
  }[];
}

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly inventoryRepository: InventoryItemRepository,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async createPurchaseOrder(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const orderNumber = await this.purchaseOrderRepository.generateOrderNumber();

    // Calculate totals
    const subtotal = createDto.items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);

    const purchaseOrder = this.purchaseOrderRepository.create({
      orderNumber,
      supplierId: createDto.supplierId,
      warehouseId: createDto.warehouseId,
      expectedDeliveryDate: createDto.expectedDeliveryDate,
      notes: createDto.notes,
      termsAndConditions: createDto.termsAndConditions,
      createdBy: createDto.createdBy,
      subtotal,
      totalAmount: subtotal, // For now, no tax or shipping
    });

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    // Create order items
    const items = createDto.items.map((item, index) => ({
      purchaseOrderId: savedOrder.id,
      productVariantId: item.productVariantId,
      quantityOrdered: item.quantityOrdered,
      unitCost: item.unitCost,
      totalCost: item.quantityOrdered * item.unitCost,
      notes: item.notes,
      sortOrder: index,
    }));

    // Note: You'll need to create PurchaseOrderItemRepository similar to other repositories
    // For now, assuming the items are saved through the relation

    return this.purchaseOrderRepository.findById(savedOrder.id);
  }

  async updatePurchaseOrder(id: string, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (!order.isEditable) {
      throw new BadRequestException('Purchase order cannot be edited in current status');
    }

    // Update basic fields
    if (updateDto.supplierId) order.supplierId = updateDto.supplierId;
    if (updateDto.warehouseId) order.warehouseId = updateDto.warehouseId;
    if (updateDto.expectedDeliveryDate) order.expectedDeliveryDate = updateDto.expectedDeliveryDate;
    if (updateDto.notes !== undefined) order.notes = updateDto.notes;
    if (updateDto.termsAndConditions !== undefined) order.termsAndConditions = updateDto.termsAndConditions;

    // Recalculate totals if items are updated
    if (updateDto.items) {
      const subtotal = updateDto.items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);
      order.subtotal = subtotal;
      order.totalAmount = subtotal;
      // Handle items update (you'll need to implement this logic)
    }

    return this.purchaseOrderRepository.save(order);
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (!order.isEditable) {
      throw new BadRequestException('Purchase order cannot be deleted in current status');
    }

    await this.purchaseOrderRepository.delete(id);
  }

  async approvePurchaseOrder(id: string, approvedBy?: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (order.status !== PurchaseOrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be approved');
    }

    order.status = PurchaseOrderStatus.APPROVED;
    order.approvedBy = approvedBy;
    order.approvedAt = new Date();

    return this.purchaseOrderRepository.save(order);
  }

  async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (order.status !== PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException('Only approved orders can be sent');
    }

    order.status = PurchaseOrderStatus.ORDERED;
    return this.purchaseOrderRepository.save(order);
  }

  async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (order.isCompleted) {
      throw new BadRequestException('Completed orders cannot be cancelled');
    }

    order.status = PurchaseOrderStatus.CANCELLED;
    return this.purchaseOrderRepository.save(order);
  }

  async receiveItems(id: string, receiveDto: ReceiveItemsDto): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (!order.canReceive) {
      throw new BadRequestException('Order is not in receivable status');
    }

    // Process each received item
    for (const receivedItem of receiveDto.items) {
      // Find the order item
      const orderItem = order.items.find(item => item.id === receivedItem.purchaseOrderItemId);
      if (!orderItem) {
        throw new NotFoundException(`Purchase order item not found: ${receivedItem.purchaseOrderItemId}`);
      }

      if (receivedItem.quantityReceived > orderItem.quantityPending) {
        throw new BadRequestException(`Cannot receive more than pending quantity for item ${orderItem.id}`);
      }

      // Update order item
      orderItem.quantityReceived += receivedItem.quantityReceived;
      if (orderItem.quantityReceived >= orderItem.quantityOrdered) {
        orderItem.receivedAt = new Date();
      }

      // Update or create inventory
      let inventoryItem = await this.inventoryRepository.findByVariantAndWarehouse(
        orderItem.productVariantId,
        order.warehouseId,
      );

      if (!inventoryItem) {
        inventoryItem = this.inventoryRepository.create({
          productVariantId: orderItem.productVariantId,
          warehouseId: order.warehouseId,
          locationId: receivedItem.locationId,
          quantity: receivedItem.quantityReceived,
          unitCost: orderItem.unitCost,
          batchNumber: receivedItem.batchNumber,
          expiryDate: receivedItem.expiryDate,
          lastRestockedAt: new Date(),
        });
      } else {
        inventoryItem.quantity += receivedItem.quantityReceived;
        inventoryItem.unitCost = orderItem.unitCost; // Update with latest cost
        inventoryItem.lastRestockedAt = new Date();
        if (receivedItem.locationId) {
          inventoryItem.locationId = receivedItem.locationId;
        }
      }

      await this.inventoryRepository.save(inventoryItem);

      // Create stock movement
      const stockMovement = this.stockMovementRepository.create({
        inventoryItemId: inventoryItem.id,
        warehouseId: order.warehouseId,
        locationId: receivedItem.locationId,
        type: MovementType.IN,
        reason: MovementReason.PURCHASE,
        quantity: receivedItem.quantityReceived,
        unitCost: orderItem.unitCost,
        referenceId: order.id,
        referenceType: 'PURCHASE_ORDER',
        notes: receivedItem.notes,
        userId: receiveDto.receivedBy,
        movementDate: new Date(),
        previousQuantity: inventoryItem.quantity - receivedItem.quantityReceived,
        newQuantity: inventoryItem.quantity,
      });

      await this.stockMovementRepository.save(stockMovement);
    }

    // Update order status
    const allItemsReceived = order.items.every(item => item.isFullyReceived);
    const someItemsReceived = order.items.some(item => item.quantityReceived > 0);

    if (allItemsReceived) {
      order.status = PurchaseOrderStatus.RECEIVED;
      order.actualDeliveryDate = new Date();
    } else if (someItemsReceived) {
      order.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }

    return this.purchaseOrderRepository.save(order);
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }
    return order;
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findAll({
      relations: ['supplier', 'warehouse'],
      order: { orderDate: 'DESC' },
    });
  }

  async getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findByStatus(status as PurchaseOrderStatus);
  }

  async getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findBySupplier(supplierId);
  }

  async getPurchaseOrdersByWarehouse(warehouseId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findByWarehouse(warehouseId);
  }

  async getOverdueOrders(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findOverdueOrders();
  }

  async getPendingReceivingOrders(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findPendingReceiving();
  }

  async getOrderStats(warehouseId?: string) {
    return this.purchaseOrderRepository.getOrderStats(warehouseId);
  }
}