import type { ProductVariant, ProductVariantItem, Attribute } from '../types/product';

interface VariantAttributeEntry {
  attributeId: string;
  name: string;
  valueId: string;
  label: string;
  sortOrder: number;
}

const slugify = (value: string, fallback: string) => {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return base || fallback;
};

const ensureAttributeId = (
  attributeId: string | undefined,
  attribute: Attribute | undefined,
  fallbackIndex: number
) => {
  if (attributeId && attributeId.trim().length > 0) {
    return attributeId;
  }

  const attributeName = attribute?.displayName || attribute?.name;
  if (attributeName) {
    return `attr-${slugify(attributeName, `attribute-${fallbackIndex}`)}`;
  }

  return `attr-${fallbackIndex}`;
};

const ensureValueId = (
  valueId: string | undefined,
  attributeId: string,
  label: string,
  fallbackIndex: number
) => {
  if (valueId && valueId.trim().length > 0) {
    return valueId;
  }

  return `${attributeId}-val-${slugify(label, `${fallbackIndex}`)}`;
};

const normalizeVariantItem = (item: ProductVariantItem, index: number): VariantAttributeEntry | null => {
  const attributeId = ensureAttributeId(item.attributeId, item.attribute, index);
  const attributeName = item.attribute?.displayName || item.attribute?.name || 'Option';

  const rawLabel = item.attributeValue?.displayValue || item.attributeValue?.value || String(item.attributeValueId || 'Value');
  const valueId = ensureValueId(item.attributeValueId, attributeId, rawLabel, index);

  const result = {
    attributeId,
    name: attributeName,
    valueId,
    label: rawLabel,
    sortOrder: item.sortOrder ?? index,
  };

  return result;
};

export const extractVariantAttributeEntries = (variant: ProductVariant): VariantAttributeEntry[] => {
  const entries: VariantAttributeEntry[] = [];

  // Check for variantItems
  const items = Array.isArray(variant.variantItems) ? variant.variantItems : [];

  if (items.length > 0) {
    items.forEach((item, index) => {
      const normalized = normalizeVariantItem(item, index);
      if (normalized) {
        entries.push(normalized);
      }
    });
  }

  if (entries.length > 0) {
    return entries;
  }
  return [];
};

export interface VariantAttributeValueOption {
  valueId: string;
  label: string;
  sortOrder: number;
}

export interface VariantAttributeDefinition {
  attributeId: string;
  name: string;
  values: VariantAttributeValueOption[];
}

export type VariantSelectionMap = Map<string, Record<string, string>>;

export const buildVariantAttributes = (variants?: ProductVariant[]): VariantAttributeDefinition[] => {
  if (!variants || variants.length === 0) {
    return [];
  }

  const attributeMap = new Map<string, {
    attributeId: string;
    name: string;
    order: number;
    values: Map<string, VariantAttributeValueOption>;
  }>();

  let attributeOrder = 0;

  variants.forEach((variant) => {
    const entries = extractVariantAttributeEntries(variant);

    entries.forEach((entry, index) => {
      if (!attributeMap.has(entry.attributeId)) {
        attributeMap.set(entry.attributeId, {
          attributeId: entry.attributeId,
          name: entry.name,
          order: attributeOrder++,
          values: new Map(),
        });
      }

      const attributeAccumulator = attributeMap.get(entry.attributeId)!;

      if (!attributeAccumulator.values.has(entry.valueId)) {
        attributeAccumulator.values.set(entry.valueId, {
          valueId: entry.valueId,
          label: entry.label,
          sortOrder: entry.sortOrder ?? index,
        });
      }
    });
  });

  const result = Array.from(attributeMap.values())
    .sort((a, b) => a.order - b.order)
    .map(({ attributeId, name, values }) => ({
      attributeId,
      name,
      values: Array.from(values.values())
        .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    }));

  return result;
};

export const buildVariantSelectionMap = (variants?: ProductVariant[]): VariantSelectionMap => {
  const selectionMap: VariantSelectionMap = new Map();

  if (!variants || variants.length === 0) {
    return selectionMap;
  }

  variants.forEach((variant) => {
    const entries = extractVariantAttributeEntries(variant);

    if (entries.length === 0) {
      return;
    }

    const selections: Record<string, string> = {};
    entries.forEach((entry) => {
      selections[entry.attributeId] = entry.valueId;
    });

    selectionMap.set(variant.id, selections);
  });

  return selectionMap;
};
