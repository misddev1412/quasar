export enum MenuType {
  LINK = 'link',
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
  NEW_PRODUCTS = 'new_products',
  SALE_PRODUCTS = 'sale_products',
  FEATURED_PRODUCTS = 'featured_products',
  BANNER = 'banner',
  CUSTOM_HTML = 'custom_html',
}

export enum MenuTarget {
  SELF = '_self',
  BLANK = '_blank',
}

export const MENU_TYPE_LABELS: Record<MenuType, string> = {
  [MenuType.LINK]: 'Custom Link',
  [MenuType.PRODUCT]: 'Product',
  [MenuType.CATEGORY]: 'Category',
  [MenuType.BRAND]: 'Brand',
  [MenuType.NEW_PRODUCTS]: 'New Products',
  [MenuType.SALE_PRODUCTS]: 'Sale Products',
  [MenuType.FEATURED_PRODUCTS]: 'Featured Products',
  [MenuType.BANNER]: 'Banner',
  [MenuType.CUSTOM_HTML]: 'Custom HTML',
};

export const MENU_TARGET_LABELS: Record<MenuTarget, string> = {
  [MenuTarget.SELF]: 'Same window',
  [MenuTarget.BLANK]: 'New window',
};