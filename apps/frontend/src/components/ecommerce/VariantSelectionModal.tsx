'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from '@heroui/react';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import type { Product, ProductVariant } from '../../types/product';
import { buildVariantAttributes, buildVariantSelectionMap } from '../../utils/variantAttributes';
import Input from '../common/Input';

interface VariantSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onVariantSelect: (variant: ProductVariant, quantity: number) => void;
}

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  product,
  onVariantSelect,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null);
      setQuantity(1);
      setSelectedAttributes({});
    }
  }, [isOpen]);

  const variantAttributes = useMemo(
    () => buildVariantAttributes(product.variants),
    [product.variants]
  );

  const variantSelectionMap = useMemo(
    () => buildVariantSelectionMap(product.variants),
    [product.variants]
  );

  const attributeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    variantAttributes.forEach((attribute, index) => {
      map.set(attribute.attributeId, index);
    });
    return map;
  }, [variantAttributes]);

  const maxSelectableQuantity = useMemo(() => {
    if (!selectedVariant || typeof selectedVariant.stockQuantity !== 'number') {
      return 99;
    }
    return Math.min(99, Math.max(1, selectedVariant.stockQuantity));
  }, [selectedVariant]);

  // Find variant based on selected attributes
  const findMatchingVariant = useCallback(() => {
    if (!product.variants || Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    return product.variants.find(variant => {
      const selections = variantSelectionMap.get(variant.id);
      if (!selections) {
        return false;
      }

      return Object.entries(selectedAttributes).every(([attributeId, valueId]) => valueId && selections[attributeId] === valueId);
    });
  }, [product.variants, selectedAttributes, variantSelectionMap]);

  // Update selected variant when attributes change
  useEffect(() => {
    const matchingVariant = findMatchingVariant();
    setSelectedVariant(matchingVariant || null);

    if (matchingVariant) {
      setQuantity(1);
    }
  }, [selectedAttributes, findMatchingVariant]);

  const handleAttributeSelect = useCallback((attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => {
      const attributeIndex = attributeIndexMap.get(attributeId);

      if (attributeIndex === undefined) {
        return prev;
      }

      if (prev[attributeId] === valueId) {
        return prev;
      }

      const nextSelections = {
        ...prev,
        [attributeId]: valueId,
      };

      for (let i = attributeIndex + 1; i < variantAttributes.length; i += 1) {
        const nextAttributeId = variantAttributes[i].attributeId;
        if (nextSelections[nextAttributeId]) {
          delete nextSelections[nextAttributeId];
        }
      }

      return nextSelections;
    });
  }, [attributeIndexMap, variantAttributes]);

  const handleQuantityChange = useCallback((nextValue: number) => {
    if (Number.isNaN(nextValue)) {
      return;
    }

    const clamped = Math.min(maxSelectableQuantity, Math.max(1, Math.floor(nextValue)));
    setQuantity(clamped);
  }, [maxSelectableQuantity]);

  const isOptionDisabled = useCallback((attributeId: string, valueId: string) => {
    const attributeIndex = attributeIndexMap.get(attributeId);
    if (attributeIndex === undefined) {
      return true;
    }

    const previousAttributeId = attributeIndex > 0 ? variantAttributes[attributeIndex - 1]?.attributeId : undefined;
    const hasPreviousSelection = previousAttributeId ? Boolean(selectedAttributes[previousAttributeId]) : true;

    if (!hasPreviousSelection) {
      return true;
    }

    const tentativeSelections = {
      ...selectedAttributes,
      [attributeId]: valueId,
    };

    return !product.variants?.some((variant) => {
      const selections = variantSelectionMap.get(variant.id);
      if (!selections) {
        return false;
      }

      return Object.entries(tentativeSelections).every(([attrId, attrValueId]) => selections[attrId] === attrValueId);
    });
  }, [attributeIndexMap, product.variants, selectedAttributes, variantAttributes, variantSelectionMap]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      onVariantSelect(selectedVariant, quantity);
      onOpenChange(false);
    }
  };

  const isAddToCartDisabled = !selectedVariant || selectedVariant.stockQuantity <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Variant</h3>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={onClose}
                >
                  <FiX className="text-lg" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">{product.name}</p>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-6">
                {/* Attribute Selection */}
                {variantAttributes.map((attribute) => {
                  const attributeIndex = attributeIndexMap.get(attribute.attributeId) ?? 0;
                  const previousAttributeId = attributeIndex > 0 ? variantAttributes[attributeIndex - 1]?.attributeId : undefined;
                  const hasPreviousSelection = previousAttributeId ? Boolean(selectedAttributes[previousAttributeId]) : true;
                  const isActiveStep = attributeIndex === 0 || hasPreviousSelection;
                  const selectedLabel = attribute.values.find((value) => value.valueId === selectedAttributes[attribute.attributeId])?.label;

                  return (
                    <div
                      key={attribute.attributeId}
                      className={`space-y-3 rounded-2xl border p-4 shadow-sm transition-colors ${
                        isActiveStep
                          ? 'border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/40'
                          : 'border-dashed border-gray-200 bg-gray-100/80 dark:border-gray-700/60 dark:bg-gray-900/30 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {attribute.name}
                        </h4>
                        {selectedLabel && (
                          <span className="text-xs font-medium text-gray-500">
                            {selectedLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attribute.values.map((value) => {
                          const isSelected = selectedAttributes[attribute.attributeId] === value.valueId;
                          const disabled = isOptionDisabled(attribute.attributeId, value.valueId);

                          return (
                            <Button
                              key={value.valueId}
                              size="sm"
                              variant={isSelected ? 'solid' : 'bordered'}
                              color={isSelected ? 'primary' : 'default'}
                              isDisabled={disabled}
                              onPress={() => handleAttributeSelect(attribute.attributeId, value.valueId)}
                              className={`rounded-full px-4 py-1 text-sm font-medium transition-all duration-150 ${
                                isSelected
                                  ? 'shadow-sm'
                                  : 'bg-white/95 text-gray-600 hover:border-gray-300 dark:bg-gray-900/60 dark:text-gray-300'
                              } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                            >
                              {value.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <Divider />

                {/* Selected Variant Info */}
                {selectedVariant && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Selected Variant</h4>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          ${selectedVariant.price.toFixed(2)}
                        </div>
                        {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                          <div className="text-sm text-gray-500 line-through">
                            ${selectedVariant.compareAtPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedVariant.sku && (
                      <div className="text-sm text-gray-600">
                        SKU: {selectedVariant.sku}
                      </div>
                    )}

                    <div className="text-sm">
                      {selectedVariant.stockQuantity > 0 ? (
                        <span className="text-green-600">
                          In Stock ({selectedVariant.stockQuantity} available)
                        </span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    {selectedVariant.stockQuantity > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="rounded-full"
                            onPress={() => handleQuantityChange(quantity - 1)}
                            isDisabled={quantity <= 1}
                          >
                            <span className="text-base font-semibold">−</span>
                          </Button>
                          <div className="w-20">
                            <Input
                              type="number"
                              value={String(quantity)}
                              min={1}
                              max={maxSelectableQuantity}
                              variant="bordered"
                              size="sm"
                              inputMode="numeric"
                              onValueChange={(value) => {
                                const parsed = Number(value);
                                if (Number.isNaN(parsed)) {
                                  return;
                                }
                                handleQuantityChange(parsed);
                              }}
                              classNames={{
                                inputWrapper: 'h-9 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/70',
                                input: 'text-center font-semibold text-sm'
                              }}
                            />
                          </div>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="rounded-full"
                            onPress={() => handleQuantityChange(quantity + 1)}
                            isDisabled={quantity >= maxSelectableQuantity}
                          >
                            <span className="text-base font-semibold">+</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!selectedVariant && Object.keys(selectedAttributes).length > 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No variant found with selected attributes</p>
                  </div>
                )}

                {Object.keys(selectedAttributes).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Please select product attributes</p>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleAddToCart}
                isDisabled={isAddToCartDisabled}
                startContent={<FiShoppingCart />}
              >
                Add to Cart
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VariantSelectionModal;
