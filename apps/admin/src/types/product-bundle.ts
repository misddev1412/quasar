export interface ProductBundleCategoryRef {
  id: string;
}

export interface ProductBundleProductRef {
  id: string;
}

export interface ProductBundleItem {
  label: string;
  mode: 'category' | 'product';
  categories?: ProductBundleCategoryRef[];
  products?: ProductBundleProductRef[];
}

export interface ProductBundle {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  items: ProductBundleItem[];
}

export interface ProductBundleFormInput {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  items?: Array<{
    label: string;
    mode: 'category' | 'product';
    categoryIds?: string[];
    productIds?: string[];
  }>;
}
