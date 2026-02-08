import { ExportColumnDefinition } from '@backend/modules/export/entities/data-export-job.entity';

export const BRAND_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'website', label: 'Website' },
  { key: 'logo', label: 'Logo' },
  { key: 'isActive', label: 'Active' },
  { key: 'productCount', label: 'Products' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
];

export const BRAND_TEMPLATE_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  { key: 'id', label: 'Brand ID' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'website', label: 'Website' },
  { key: 'logo', label: 'Logo' },
  { key: 'isActive', label: 'Is Active' },
  { key: 'sortOrder', label: 'Sort Order' },
];
