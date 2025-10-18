'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from '@heroui/react';
import { FiX, FiShoppingCart, FiLoader } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import type { Product, ProductVariant } from '../../types/product';
import { buildVariantAttributes, buildVariantSelectionMap } from '../../utils/variantAttributes';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../common/Input';
import { useAddToCart } from '../../hooks/useAddToCart';

interface VariantSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onVariantAdded?: (variant: ProductVariant, quantity: number) => Promise<void> | void;
}

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  product,
  onVariantAdded,
}) => {
  const t = useTranslations('product.detail');
  const { showToast } = useToast();
  const { addToCart, isAdding } = useAddToCart();
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
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    const hasSelections = Object.keys(selectedAttributes).length > 0;

    // Try to find exact match first
    let matchingVariant = product.variants.find((variant) => {
      const selections = variantSelectionMap.get(variant.id);

      if (selections && Object.keys(selections).length > 0) {
        const allVariantAttributesSelected = Object.entries(selections).every(([attributeId, valueId]) => {
          return selectedAttributes[attributeId] === valueId;
        });

        const noConflictingSelections = Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
          const variantValue = selections[attributeId];
          return variantValue === undefined || variantValue === valueId;
        });

        return allVariantAttributesSelected && noConflictingSelections;
      }

      if (!hasSelections) {
        return false;
      }

      // Fallback to attributes object comparison if variantItems are not available
      if (variant.attributes && Object.keys(variant.attributes).length > 0) {
        return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
          const variantValue = variant.attributes?.[attributeId];
          return variantValue !== undefined && String(variantValue) === String(valueId);
        });
      }

      return false;
    });

    // If no exact match found, try fuzzy matching based on variant names
    if (!matchingVariant && product.variants.length === 1) {
      const singleVariant = product.variants[0];

      // For single variant products, if it has a simple name that matches one of the selected values
      const selectedValues = Object.values(selectedAttributes);
      const variantName = singleVariant.name?.trim();

      if (variantName && selectedValues.some(value =>
        value.toLowerCase().includes(variantName.toLowerCase()) ||
        variantName.toLowerCase().includes(value.toLowerCase())
      )) {
        matchingVariant = singleVariant;
      }
    }

    if (!matchingVariant && hasSelections) {
      const subsetMatches = product.variants.filter((variant) => {
        const selections = variantSelectionMap.get(variant.id);

        if (selections && Object.keys(selections).length > 0) {
          return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
            return selections[attributeId] === valueId;
          });
        }

        if (variant.attributes && Object.keys(variant.attributes).length > 0) {
          return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
            const variantValue = variant.attributes?.[attributeId];
            return variantValue !== undefined && String(variantValue) === String(valueId);
          });
        }

        return false;
      });

      if (subsetMatches.length === 1) {
        matchingVariant = subsetMatches[0];
      }
    }

    return matchingVariant;
  }, [product.variants, selectedAttributes, variantSelectionMap]);

  // Update selected variant when attributes change
  useEffect(() => {
    const matchingVariant = findMatchingVariant();
    setSelectedVariant(matchingVariant || null);

    if (matchingVariant) {
      setQuantity(1);
    }
  }, [selectedAttributes, findMatchingVariant]);

  useEffect(() => {
    if (!selectedVariant) {
      return;
    }

    const selections = variantSelectionMap.get(selectedVariant.id);
    if (!selections || Object.keys(selections).length === 0) {
      return;
    }

    setSelectedAttributes((prev) => {
      const needsUpdate = Object.entries(selections).some(([attributeId, valueId]) => prev[attributeId] !== valueId);

      if (!needsUpdate) {
        return prev;
      }

      return {
        ...prev,
        ...selections,
      };
    });
  }, [selectedVariant, variantSelectionMap]);

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

      // Clear subsequent attribute selections
      for (let i = attributeIndex + 1; i < variantAttributes.length; i += 1) {
        const nextAttributeId = variantAttributes[i].attributeId;
        if (nextSelections[nextAttributeId]) {
          delete nextSelections[nextAttributeId];
        }
      }

      return nextSelections;
    });
  }, [attributeIndexMap, variantAttributes]);

  useEffect(() => {
    if (!selectedVariant && product.variants && product.variants.length === 1) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product.variants, selectedVariant]);

  useEffect(() => {
    if (selectedVariant || !product.variants || product.variants.length === 0) {
      return;
    }

    const hasSelections = Object.keys(selectedAttributes).length > 0;
    if (!hasSelections) {
      return;
    }

    const subsetMatches = product.variants.filter((variant) => {
      const selections = variantSelectionMap.get(variant.id);

      if (selections && Object.keys(selections).length > 0) {
        return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
          return selections[attributeId] === valueId;
        });
      }

      if (variant.attributes && Object.keys(variant.attributes).length > 0) {
        return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
          const variantValue = variant.attributes?.[attributeId];
          return variantValue !== undefined && String(variantValue) === String(valueId);
        });
      }

      return false;
    });

    if (subsetMatches.length === 1) {
      setSelectedVariant(subsetMatches[0]);
    }
  }, [product.variants, selectedAttributes, selectedVariant, variantSelectionMap]);

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

  const tryAddVariantToCart = async (variant: ProductVariant) => {
    const result = await addToCart({ product, variant, quantity });

    if (!result.success) {
      return false;
    }

    if (onVariantAdded) {
      await onVariantAdded(variant, quantity);
    }

    onOpenChange(false);
    return true;
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      // If no variant is selected, try to select a fallback that is in stock
      if (product.variants && product.variants.length > 0) {
        const firstAvailableVariant = product.variants.find(v => v.stockQuantity > 0) || product.variants[0];

        if (firstAvailableVariant) {
          setSelectedVariant(firstAvailableVariant);

          if (firstAvailableVariant.stockQuantity <= 0) {
            showToast({
              type: 'error',
              title: 'Out of stock',
              message: 'This variant is currently out of stock.',
            });
            return;
          }

          const added = await tryAddVariantToCart(firstAvailableVariant);
          if (!added) {
            return;
          }
        }
      }
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      showToast({
        type: 'error',
        title: 'Out of stock',
        message: 'This variant is currently out of stock.',
      });
      return;
    }

    await tryAddVariantToCart(selectedVariant);
  };

  const selectedVariantSelections = useMemo(() => {
    if (!selectedVariant) {
      return null;
    }
    return variantSelectionMap.get(selectedVariant.id) || null;
  }, [selectedVariant, variantSelectionMap]);

  const missingRequiredSelections = useMemo(() => {
    if (!selectedVariant) {
      return true;
    }

    if (selectedVariantSelections && Object.keys(selectedVariantSelections).length > 0) {
      return Object.entries(selectedVariantSelections).some(([attributeId, valueId]) => selectedAttributes[attributeId] !== valueId);
    }

    if (variantAttributes.length > 0) {
      return Object.keys(selectedAttributes).length < variantAttributes.length;
    }

    return false;
  }, [selectedVariant, selectedVariantSelections, selectedAttributes, variantAttributes]);

  const selectionProgress = useMemo(() => {
    if (selectedVariantSelections && Object.keys(selectedVariantSelections).length > 0) {
      const total = Object.keys(selectedVariantSelections).length;
      const current = Object.entries(selectedVariantSelections).reduce((count, [attributeId, valueId]) => {
        return selectedAttributes[attributeId] === valueId ? count + 1 : count;
      }, 0);

      return { current, total };
    }

    return {
      current: Object.keys(selectedAttributes).length,
      total: variantAttributes.length,
    };
  }, [selectedVariantSelections, selectedAttributes, variantAttributes]);

  const shouldShowSelectionMessage = selectionProgress.total > 0 && selectionProgress.current < selectionProgress.total;

  const isAddToCartDisabled = !selectedVariant || selectedVariant.stockQuantity <= 0 || missingRequiredSelections || isAdding;

  // Debug logging for button state
  console.log('Button State Debug:', {
    selectedVariant: selectedVariant?.name || 'None',
    selectedVariantId: selectedVariant?.id,
    stockQuantity: selectedVariant?.stockQuantity,
    variantAttributesLength: variantAttributes.length,
    selectedAttributesLength: Object.keys(selectedAttributes).length,
    isAddToCartDisabled
  });

  // Fallback: If no variant is selected but attributes are selected, try to find a fallback variant
  const handleAddToCartWithFallback = async () => {
    console.log('handleAddToCartWithFallback called');

    if (!selectedVariant && product.variants && product.variants.length > 0 && Object.keys(selectedAttributes).length > 0) {
      console.log('No variant selected, trying fallback selection');

      // Try to find any variant that has stock
      const availableVariant = product.variants.find(v => v.stockQuantity > 0);
      if (availableVariant) {
        console.log('Using available variant as fallback:', availableVariant.name);
        await handleAddToCart();
        return;
      }
    }

    await handleAddToCart();
  };
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
                <h3 className="text-lg font-semibold">{t('actions.selectVariant')}</h3>
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
                
                {/* Fallback: Show direct variant selection if attributes building fails */}
                {variantAttributes.length === 0 && product.variants && product.variants.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">Select Variant:</h4>
                    <div className="space-y-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            selectedVariant?.id === variant.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          disabled={variant.stockQuantity <= 0}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{variant.name}</span>
                            <span className="font-semibold">${variant.price.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Stock: {variant.stockQuantity} | SKU: {variant.sku || 'N/A'}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Quantity selector for fallback */}
                    {selectedVariant && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Quantity:</h4>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          >
                            -
                          </button>
                          <div className="w-20 text-center border border-gray-200 rounded-lg px-3 py-2">
                            {quantity}
                          </div>
                          <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Attribute Selection */
                  variantAttributes.map((attribute) => {
                    const attributeIndexFromMap = attributeIndexMap.get(attribute.attributeId) ?? 0;
                    const previousAttributeId = attributeIndexFromMap > 0 ? variantAttributes[attributeIndexFromMap - 1]?.attributeId : undefined;
                    const hasPreviousSelection = previousAttributeId ? Boolean(selectedAttributes[previousAttributeId]) : true;
                    const isActiveStep = attributeIndexFromMap === 0 || hasPreviousSelection;
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
                })
                )}

                <Divider />

                {/* Selected Variant Info */}
                {selectedVariant && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{t('actions.selectedVariant')}</h4>
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
                          {t('variants.inStock', { count: selectedVariant.stockQuantity })}
                        </span>
                      ) : (
                        <span className="text-red-600">{t('variants.outOfStock')}</span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    {selectedVariant.stockQuantity > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">{t('common.quantity')}:</span>
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
                    <p className="text-gray-500">{t('actions.noVariantFound')}</p>
                  </div>
                )}

                {shouldShowSelectionMessage && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      {t('actions.selectRequiredAttributes', {
                        current: selectionProgress.current,
                        total: selectionProgress.total
                      })}
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                isDisabled={isAdding}
              >
                {t('common.cancel')}
              </Button>
              <Button
                color="primary"
                onPress={handleAddToCartWithFallback}
                isDisabled={isAddToCartDisabled}
                isLoading={isAdding}
                startContent={
                  isAdding ? <FiLoader className="animate-spin" /> : <FiShoppingCart />
                }
              >
                {t('actions.addToCart')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VariantSelectionModal;
