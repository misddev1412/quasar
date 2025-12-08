import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductVariant } from '../types/product';
import { buildVariantAttributes, buildVariantSelectionMap } from '../utils/variantAttributes';

interface UseProductVariantsProps {
  variants: ProductVariant[] | undefined;
}

export const useProductVariants = ({ variants }: UseProductVariantsProps) => {
  const initialVariant = useMemo<ProductVariant | null>(() => {
    if (!variants || variants.length === 0) {
      return null;
    }

    return variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
  }, [variants]);

  const variantAttributes = useMemo(
    () => buildVariantAttributes(variants),
    [variants]
  );

  const variantSelectionMap = useMemo(
    () => buildVariantSelectionMap(variants),
    [variants]
  );

  const computeSelectionsFromVariant = useCallback((variant: ProductVariant | null) => {
    if (!variant) {
      return {};
    }

    const selections = variantSelectionMap.get(variant.id);
    return selections ? { ...selections } : {};
  }, [variantSelectionMap]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initialVariant);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    initialVariant ? computeSelectionsFromVariant(initialVariant) : {}
  );

  const attributeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    variantAttributes.forEach((attribute, index) => {
      map.set(attribute.attributeId, index);
    });
    return map;
  }, [variantAttributes]);

  const hasAttributeBasedVariants = variantAttributes.length > 0;

  const findMatchingVariant = useCallback((selections: Record<string, string>) => {
    const selectionEntries = Object.entries(selections).filter(([, valueId]) => Boolean(valueId));

    if (selectionEntries.length === 0) {
      return null;
    }

    return variants?.find((variant) => {
      const variantSelections = variantSelectionMap.get(variant.id);
      if (!variantSelections) {
        return false;
      }

      return selectionEntries.every(([attributeId, valueId]) => variantSelections[attributeId] === valueId);
    }) || null;
  }, [variants, variantSelectionMap]);

  const selectVariant = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedAttributes(computeSelectionsFromVariant(variant));
  }, [computeSelectionsFromVariant]);

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

      // Reset selections for subsequent attributes so users progress step-by-step
      for (let i = attributeIndex + 1; i < variantAttributes.length; i += 1) {
        const nextAttributeId = variantAttributes[i].attributeId;
        if (nextSelections[nextAttributeId]) {
          delete nextSelections[nextAttributeId];
        }
      }

      return nextSelections;
    });
  }, [attributeIndexMap, variantAttributes]);

  const isOptionDisabled = useCallback((attributeId: string, valueId: string) => {
    const attributeIndex = attributeIndexMap.get(attributeId);
    if (attributeIndex === undefined) {
      return true;
    }

    const isActiveStep = attributeIndex === 0 || Boolean(selectedAttributes[variantAttributes[attributeIndex - 1].attributeId]);
    if (!isActiveStep) {
      return true;
    }

    const tentativeSelections = {
      ...selectedAttributes,
      [attributeId]: valueId,
    };

    return !variants?.some((variant) => {
      const selections = variantSelectionMap.get(variant.id);
      if (!selections) {
        return false;
      }

      return Object.entries(tentativeSelections).every(([attrId, attrValueId]) => selections[attrId] === attrValueId);
    });
  }, [attributeIndexMap, variants, selectedAttributes, variantAttributes, variantSelectionMap]);

  useEffect(() => {
    if (!initialVariant) {
      setSelectedVariant((prev) => (prev ? null : prev));
      setSelectedAttributes((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }

    if (hasAttributeBasedVariants) {
      setSelectedVariant((prev) => (prev ? null : prev));
      setSelectedAttributes((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }

    selectVariant(initialVariant);
  }, [hasAttributeBasedVariants, initialVariant, selectVariant]);

  useEffect(() => {
    if (!hasAttributeBasedVariants) {
      return;
    }

    const selectedCount = Object.values(selectedAttributes).filter(Boolean).length;

    if (selectedCount < variantAttributes.length) {
      if (selectedVariant) {
        setSelectedVariant(null);
      }
      return;
    }

    const matchingVariant = findMatchingVariant(selectedAttributes);

    if (matchingVariant) {
      if (matchingVariant.id !== selectedVariant?.id) {
        setSelectedVariant(matchingVariant);
      }
    } else if (selectedVariant) {
      setSelectedVariant(null);
    }
  }, [findMatchingVariant, hasAttributeBasedVariants, selectedAttributes, selectedVariant, variantAttributes.length]);

  return {
    selectedVariant,
    selectedAttributes,
    variantAttributes,
    attributeIndexMap,
    hasAttributeBasedVariants,
    isOptionDisabled,
    handleAttributeSelect,
    selectVariant,
    setSelectedVariant,
  };
};