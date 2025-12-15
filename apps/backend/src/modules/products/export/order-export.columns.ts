import { ExportColumnDefinition } from '../../export/entities/data-export-job.entity';

export const ORDER_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  { key: 'orderNumber', label: 'Order Number' },
  { key: 'status', label: 'Status' },
  { key: 'paymentStatus', label: 'Payment Status' },
  { key: 'source', label: 'Source' },
  { key: 'totalAmount', label: 'Total Amount' },
  { key: 'amountPaid', label: 'Amount Paid' },
  { key: 'currency', label: 'Currency' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'customerEmail', label: 'Customer Email' },
  { key: 'customerPhone', label: 'Customer Phone' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'shippingMethod', label: 'Shipping Method' },
  { key: 'trackingNumber', label: 'Tracking Number' },
  { key: 'shippingCountry', label: 'Shipping Country', path: 'shippingCountry' },
  { key: 'shippingCity', label: 'Shipping City', path: 'shippingCity' },
  { key: 'orderDate', label: 'Order Date' },
  { key: 'shippedDate', label: 'Shipped Date' },
  { key: 'deliveredDate', label: 'Delivered Date' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
];
