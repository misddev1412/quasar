import { ExportColumnDefinition } from '@backend/modules/export/entities/data-export-job.entity';

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
  { key: 'updatedAt', label: 'Updated At' },
];

export const PRODUCT_TEMPLATE_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  { key: 'id', label: 'Product ID' },
  { key: 'name', label: 'Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'description', label: 'Description' },
  { key: 'shortDescription', label: 'Short Description' },
  { key: 'status', label: 'Status' },
  { key: 'price', label: 'Price' },
  { key: 'compareAtPrice', label: 'Compare At Price' },
  { key: 'costPrice', label: 'Cost Price' },
  { key: 'stockQuantity', label: 'Stock Quantity' },
  { key: 'trackInventory', label: 'Track Inventory' },
  { key: 'brandId', label: 'Brand ID' },
  { key: 'warrantyId', label: 'Warranty ID' },
  { key: 'isFeatured', label: 'Is Featured' },
  { key: 'isContactPrice', label: 'Contact Price' },
  { key: 'isActive', label: 'Is Active' },
  { key: 'images', label: 'Images (comma separated)' },
  { key: 'categoryIds', label: 'Category IDs (comma separated)' },
  // Variant specific fields
  { key: 'variantName', label: 'Variant Name' },
  { key: 'variantSku', label: 'Variant SKU' },
  { key: 'variantPrice', label: 'Variant Price' },
  { key: 'variantStock', label: 'Variant Stock' },
  { key: 'variantAttributes', label: 'Variant Attributes (format: Name:Value|Name:Value)' },
];
