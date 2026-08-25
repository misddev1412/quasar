type SidebarItemFontSize = 'xs' | 'sm' | 'base' | 'lg';

const SIDEBAR_ITEM_FONT_SIZE_CLASSES: Record<SidebarItemFontSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

export const getSidebarItemFontSizeClass = (
  size: SidebarItemFontSize,
): string => SIDEBAR_ITEM_FONT_SIZE_CLASSES[size] || 'text-[10px]';
