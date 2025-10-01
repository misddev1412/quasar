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

  return {
    attributeId,
    name: attributeName,
    valueId,
    label: rawLabel,
    sortOrder: item.sortOrder ?? index,
  };
};

const normalizeFromAttributesRecord = (
  attributes: Record<string, unknown>,
  fallbackOffset = 0
): VariantAttributeEntry[] => {
  return Object.entries(attributes).map(([rawAttributeId, rawValue], index) => {
    const attributeId = rawAttributeId.trim().length > 0
      ? rawAttributeId
      : `attr-${fallbackOffset + index}`;

    const label = String(rawValue ?? 'Value');
    const valueId = ensureValueId(String(rawValue ?? ''), attributeId, label, index);

    return {
      attributeId,
      name: rawAttributeId || `Option ${fallbackOffset + index + 1}`,
      valueId,
      label,
      sortOrder: index,
    };
  });
};

const normalizeFromVariantName = (name: string, fallbackOffset = 0): VariantAttributeEntry[] => {
  if (!name) {
    return [];
  }

  const sanitized = name.replace(/[()]/g, ' ');
  const separators = ['/', '|', ',', ';', '+'];

  let parts = [sanitized];
  for (const separator of separators) {
    if (sanitized.includes(separator)) {
      parts = sanitized.split(separator);
      break;
    }
  }

  const colonBasedEntries: VariantAttributeEntry[] = [];

  parts.forEach((rawPart, index) => {
    const part = rawPart.trim();
    if (!part) {
      return;
    }

    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) {
      return;
    }

    const attributeName = part.slice(0, colonIndex).trim();
    const valueLabel = part.slice(colonIndex + 1).trim();

    if (!attributeName || !valueLabel) {
      return;
    }

    const attributeId = `attr-${slugify(attributeName, `name-${fallbackOffset + index}`)}`;
    const valueId = ensureValueId(undefined, attributeId, valueLabel, index);

    colonBasedEntries.push({
      attributeId,
      name: attributeName,
      valueId,
      label: valueLabel,
      sortOrder: index,
    });
  });

  if (colonBasedEntries.length > 0) {
    return colonBasedEntries;
  }

  if (parts.length === 1) {
    return [];
  }

  return parts.map((rawPart, index) => {
    const valueLabel = rawPart.trim();
    const attributeId = `attr-option-${fallbackOffset + index}`;
    const attributeName = `Option ${fallbackOffset + index + 1}`;
    const valueId = ensureValueId(undefined, attributeId, valueLabel, index);

    return {
      attributeId,
      name: attributeName,
      valueId,
      label: valueLabel,
      sortOrder: index,
    };
  });
};

export const extractVariantAttributeEntries = (variant: ProductVariant): VariantAttributeEntry[] => {
  const entries: VariantAttributeEntry[] = [];

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

  if (variant.attributes && Object.keys(variant.attributes).length > 0) {
    return normalizeFromAttributesRecord(variant.attributes, entries.length);
  }

  return normalizeFromVariantName(variant.name || '', entries.length);
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

  return Array.from(attributeMap.values())
    .sort((a, b) => a.order - b.order)
    .map(({ attributeId, name, values }) => ({
      attributeId,
      name,
      values: Array.from(values.values())
        .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    }));
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
