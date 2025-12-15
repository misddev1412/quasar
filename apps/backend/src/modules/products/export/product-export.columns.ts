import { ExportColumnDefinition } from '../../export/entities/data-export-job.entity';

export const PRODUCT_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'status', label: 'Status' },
  { key: 'isActive', label: 'Active' },
  { key: 'isFeatured', label: 'Featured' },
  { key: 'priceRange', label: 'Price Range' },
  { key: 'variantCount', label: 'Variants' },
  { key: 'brand', label: 'Brand' },
  { key: 'categories', label: 'Categories' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
];
