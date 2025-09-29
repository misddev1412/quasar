'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from '@heroui/react';
import { FiX, FiShoppingCart, FiCheck } from 'react-icons/fi';
import type { Product, ProductVariant, ProductVariantItem, Attribute } from '../../types/product';

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

  // Group attributes by their names
  const groupedAttributes = React.useMemo(() => {
    if (!product.variants) return {};

    const attributes: Record<string, Attribute[]> = {};

    product.variants.forEach(variant => {
      variant.variantItems?.forEach(item => {
        if (item.attribute) {
          const attributeName = item.attribute.name;
          if (!attributes[attributeName]) {
            attributes[attributeName] = [];
          }
          if (!attributes[attributeName].find(attr => attr.id === item.attribute!.id)) {
            attributes[attributeName].push(item.attribute);
          }
        }
      });
    });

    return attributes;
  }, [product.variants]);

  // Get available attribute values for a specific attribute
  const getAvailableValues = (attributeName: string) => {
    if (!product.variants) return [];

    const values: Array<{ value: string; displayValue: string; attributeValueId: string }> = [];

    product.variants.forEach(variant => {
      variant.variantItems?.forEach(item => {
        if (item.attribute?.name === attributeName && item.attributeValue) {
          const exists = values.find(v => v.value === item.attributeValue!.value);
          if (!exists) {
            values.push({
              value: item.attributeValue.value,
              displayValue: item.attributeValue.displayValue || item.attributeValue.value,
              attributeValueId: item.attributeValue.id
            });
          }
        }
      });
    });

    return values.sort((a, b) => a.displayValue.localeCompare(b.displayValue));
  };

  // Find variant based on selected attributes
  const findMatchingVariant = React.useCallback(() => {
    if (!product.variants || Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    return product.variants.find(variant => {
      if (!variant.variantItems) return false;

      return Object.entries(selectedAttributes).every(([attrName, selectedValue]) => {
        const variantItem = variant.variantItems?.find(item =>
          item.attribute?.name === attrName &&
          item.attributeValue?.value === selectedValue
        );
        return !!variantItem;
      });
    });
  }, [product.variants, selectedAttributes]);

  // Update selected variant when attributes change
  useEffect(() => {
    const matchingVariant = findMatchingVariant();
    setSelectedVariant(matchingVariant || null);

    // Reset quantity if variant changes
    if (matchingVariant) {
      setQuantity(1);
    }
  }, [selectedAttributes, findMatchingVariant]);

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

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
                {Object.entries(groupedAttributes).map(([attributeName, attributes]) => (
                  <div key={attributeName} className="space-y-2">
                    <h4 className="font-medium text-sm">
                      {attributes[0]?.displayName || attributeName}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableValues(attributeName).map((value) => (
                        <Button
                          key={value.value}
                          size="sm"
                          variant={
                            selectedAttributes[attributeName] === value.value
                              ? 'solid'
                              : 'bordered'
                          }
                          color={
                            selectedAttributes[attributeName] === value.value
                              ? 'primary'
                              : 'default'
                          }
                          onPress={() => handleAttributeSelect(attributeName, value.value)}
                          className="text-sm"
                        >
                          {value.displayValue}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

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
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Quantity:</label>
                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {Array.from(
                            { length: Math.min(10, selectedVariant.stockQuantity) },
                            (_, i) => i + 1
                          ).map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
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