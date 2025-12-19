import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { ProductWarehouseQuantity } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';

interface ProductWarehouseQuantityManagerProps {
  warehouseQuantities: ProductWarehouseQuantity[];
  onChange: (quantities: ProductWarehouseQuantity[]) => void;
}

export const ProductWarehouseQuantityManager: React.FC<ProductWarehouseQuantityManagerProps> = ({
  warehouseQuantities,
  onChange,
}) => {
  const { t } = useTranslationWithBackend();

  // Fetch warehouses
  const { data: warehousesData, isLoading } = trpc.adminWarehouses.getAll.useQuery(undefined, {
    retry: 1,
  });

  const warehouses = (warehousesData as any)?.data?.data || [];

  const addWarehouse = () => {
    const newQuantity: ProductWarehouseQuantity = {
      warehouseId: '',
      quantity: 0,
    };
    onChange([...warehouseQuantities, newQuantity]);
  };

  const removeWarehouse = (index: number) => {
    const newQuantities = warehouseQuantities.filter((_, i) => i !== index);
    onChange(newQuantities);
  };

  const updateWarehouse = (index: number, field: keyof ProductWarehouseQuantity, value: any) => {
    const newQuantities = [...warehouseQuantities];
    newQuantities[index] = { ...newQuantities[index], [field]: value };

    // If warehouse changed, update the warehouse object
    if (field === 'warehouseId') {
      const warehouse = warehouses.find((w: Warehouse) => w.id === value);
      if (warehouse) {
        newQuantities[index].warehouse = {
          id: warehouse.id,
          name: warehouse.name,
          code: warehouse.code,
        };
      }
    }

    onChange(newQuantities);
  };

  const warehouseOptions = warehouses.map((warehouse: Warehouse) => ({
    value: warehouse.id,
    label: `${warehouse.name} (${warehouse.code})`,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {t('common.loading', 'Loading warehouses...')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('products.warehouse_quantities', 'Warehouse Quantities')}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addWarehouse}
          icon={<Plus className="w-4 h-4" />}
        >
          {t('products.add_warehouse', 'Add Warehouse')}
        </Button>
      </div>

      {warehouseQuantities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">
            {t('products.no_warehouses_added', 'No warehouses added yet. Click "Add Warehouse" to start tracking inventory.')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {warehouseQuantities.map((wq, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <Select
                  value={wq.warehouseId}
                  onChange={(value) => updateWarehouse(index, 'warehouseId', value)}
                  options={warehouseOptions}
                  placeholder={t('products.select_warehouse', 'Select warehouse')}
                  className="w-full"
                />
              </div>

              <div className="w-32">
                <Input
                  type="number"
                  min="0"
                  value={wq.quantity}
                  onChange={(e) => updateWarehouse(index, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeWarehouse(index)}
                icon={<Trash2 className="w-4 h-4" />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('common.delete', 'Delete')}
              </Button>
            </div>
          ))}
        </div>
      )}

      {warehouseQuantities.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('products.total_quantity', 'Total Quantity')}: {warehouseQuantities.reduce((sum, wq) => sum + wq.quantity, 0)}
        </div>
      )}
    </div>
  );
};
