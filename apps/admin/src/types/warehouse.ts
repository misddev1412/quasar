export interface Warehouse {
  id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  locationCount: number;
  totalItems: number;
  totalInventoryValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  parentLocationId?: string;
  parentLocation?: {
    id: string;
    name: string;
    code: string;
  } | null;
  fullPath?: string;
  maxCapacity?: number;
  currentCapacity: number;
  capacityPercentage?: number;
  isActive: boolean;
  sortOrder: number;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface WarehouseFiltersType {
  isActive?: boolean;
  isDefault?: boolean;
}
