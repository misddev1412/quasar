import { Supplier } from './product';

export enum PurchaseOrderStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    ORDERED = 'ORDERED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    RECEIVED = 'RECEIVED',
    CANCELLED = 'CANCELLED',
    CLOSED = 'CLOSED',
}

export interface PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    productVariantId: string;
    productVariant?: any; // Assuming ProductVariant is available
    quantityOrdered: number;
    quantityReceived: number;
    unitCost: number;
    totalCost: number;
    notes?: string;
    sortOrder: number;
    receivedAt?: Date;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplier?: Supplier;
    warehouseId?: string;
    warehouse?: any; // Assuming Warehouse is available
    status: PurchaseOrderStatus;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    totalAmount: number;
    notes?: string;
    termsAndConditions?: string;
    createdBy?: string;
    approvedBy?: string;
    approvedAt?: Date;
    items?: PurchaseOrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PurchaseOrderFiltersType {
    status?: PurchaseOrderStatus;
    supplierId?: string;
    warehouseId?: string;
}
