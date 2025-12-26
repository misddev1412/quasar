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
  SITE_CONTENT = 'site_content',
  SEARCH_BUTTON = 'search_button',
  SEARCH_BAR = 'search_bar',
  LOCALE_SWITCHER = 'locale_switcher',
  THEME_TOGGLE = 'theme_toggle',
  CART_BUTTON = 'cart_button',
  USER_PROFILE = 'user_profile',
  CALL_BUTTON = 'call_button',
  ORDER_TRACKING = 'order_tracking',
  TOP_PHONE = 'top_phone',
  TOP_EMAIL = 'top_email',
  TOP_CURRENT_TIME = 'top_current_time',
  TOP_MARQUEE = 'top_marquee',
}

export enum MenuTarget {
  SELF = '_self',
  BLANK = '_blank',
}

export enum TopMenuTimeFormat {
  HOURS_MINUTES = 'HH:mm',
  HOURS_MINUTES_SECONDS = 'HH:mm:ss',
  HOURS_MINUTES_DAY_MONTH_YEAR = 'HH:mm - DD/MM/YYYY',
  DAY_MONTH_YEAR_HOURS_MINUTES = 'DD/MM/YYYY HH:mm',
}

export const TOP_MENU_TIME_FORMAT_LABELS: Record<TopMenuTimeFormat, string> = {
  [TopMenuTimeFormat.HOURS_MINUTES]: 'HH:mm (Default)',
  [TopMenuTimeFormat.HOURS_MINUTES_SECONDS]: 'HH:mm:ss',
  [TopMenuTimeFormat.HOURS_MINUTES_DAY_MONTH_YEAR]: 'HH:mm - DD/MM/YYYY',
  [TopMenuTimeFormat.DAY_MONTH_YEAR_HOURS_MINUTES]: 'DD/MM/YYYY HH:mm',
};

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
  [MenuType.SITE_CONTENT]: 'Site Content',
  [MenuType.SEARCH_BUTTON]: 'Search Button',
  [MenuType.SEARCH_BAR]: 'Search Bar',
  [MenuType.LOCALE_SWITCHER]: 'Locale Switcher',
  [MenuType.THEME_TOGGLE]: 'Dark/Light Toggle',
  [MenuType.CART_BUTTON]: 'Cart Button',
  [MenuType.USER_PROFILE]: 'User Profile',
  [MenuType.CALL_BUTTON]: 'Call Button',
  [MenuType.ORDER_TRACKING]: 'Order Tracking',
  [MenuType.TOP_PHONE]: 'Phone Call',
  [MenuType.TOP_EMAIL]: 'Email',
  [MenuType.TOP_CURRENT_TIME]: 'Current Time',
  [MenuType.TOP_MARQUEE]: 'Marquee Ticker',
};

export const MENU_TARGET_LABELS: Record<MenuTarget, string> = {
  [MenuTarget.SELF]: 'Same window',
  [MenuTarget.BLANK]: 'New window',
};
