export const menuStyles = {
  // Drag and drop styles
  dragHandle: 'p-1 text-gray-600 hover:text-white transition-colors cursor-grab',
  dragHandleDisabled: 'cursor-not-allowed opacity-50',
  dragHandleActive: 'cursor-grabbing opacity-80',
  dragOverRow: 'ring-2 ring-blue-300 dark:ring-blue-600',
  draggedRow: 'opacity-60 cursor-grabbing',

  // Menu item display
  menuItemContainer: 'flex items-start gap-2',
  menuItemContent: 'flex flex-col flex-1',
  menuItemLabel: 'font-medium text-gray-900 dark:text-gray-100',
  menuItemUrl: 'text-sm text-gray-500 dark:text-gray-400 truncate',
  menuItemIcon: 'text-xs text-gray-600',

  // Expand/collapse button
  expandButton: 'p-1 hover:bg-gray-200 rounded',
  expandIcon: 'w-3 h-3',

  // Status badges
  statusBadge: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
  statusActive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  statusInactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',

  // Type badges
  typeBadge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',

  // Form styles
  formContainer: 'space-y-6',
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  formLabel: 'block text-sm font-medium text-gray-700',
  formInput: 'mt-1',
  formTextarea: 'mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
  formTextareaMono: 'mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500',

  // Translation tabs
  translationHeader: 'flex items-center justify-between',
  translationTitle: 'text-sm font-semibold text-gray-700',
  translationTabs: 'flex items-center gap-2',
  translationTab: 'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
  translationTabActive: 'bg-blue-600 text-white border-blue-600',
  translationTabInactive: 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100',
  translationContent: 'space-y-3 border rounded-lg p-4 bg-gray-50',

  // Form actions
  formActions: 'flex justify-end gap-3 pt-6 border-t',

  // Product selector styles
  productOption: 'flex items-center gap-3 text-inherit',
  productImage: 'w-10 h-10 rounded-md object-cover',
  productImagePlaceholder: 'w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400',
  productInfo: 'flex flex-col',
  productLabel: 'text-sm font-medium',
  productMeta: 'text-xs opacity-80',
  productSelectedImage: 'w-6 h-6 rounded object-cover',
  productSelectedPlaceholder: 'w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500',
  productSelectedContent: 'flex items-center gap-2',

  // Statistics cards
  statisticsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  statisticCard: 'bg-white rounded-lg shadow p-6',
  statisticTitle: 'text-sm font-medium text-gray-600',
  statisticValue: 'text-2xl font-bold text-gray-900',
  statisticIcon: 'text-blue-500',

  // Loading states
  loadingSpinner: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600',
  loadingContainer: 'flex items-center justify-center py-8',

  // Responsive utilities
  responsiveContainer: 'w-full',
  responsiveGrid: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
  responsiveFullWidth: 'col-span-full',

  // Animation utilities
  transitionColors: 'transition-colors',
  transitionTransform: 'transition-transform',

  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500',
  focusRingOffset: 'focus:ring-offset-2',

  // Hover states
  hoverBgGray: 'hover:bg-gray-100',
  hoverBgGray200: 'hover:bg-gray-200',
  hoverTextWhite: 'hover:text-white',

  // Spacing utilities
  spaceY3: 'space-y-3',
  spaceY4: 'space-y-4',
  spaceY6: 'space-y-6',
  gap2: 'gap-2',
  gap3: 'gap-3',
  gap4: 'gap-4',

  // Border utilities
  border: 'border',
  borderGray: 'border-gray-200',
  borderGray300: 'border-gray-300',
  rounded: 'rounded',
  roundedLg: 'rounded-lg',
  roundedMd: 'rounded-md',

  // Text utilities
  textXs: 'text-xs',
  textSm: 'text-sm',
  textBase: 'text-base',
  textLg: 'text-lg',
  fontMedium: 'font-medium',
  fontSemibold: 'font-semibold',
  textGray600: 'text-gray-600',
  textGray700: 'text-gray-700',
  textGray900: 'text-gray-900',
  textGray500: 'text-gray-500',

  // Background utilities
  bgWhite: 'bg-white',
  bgGray50: 'bg-gray-50',
  bgGray100: 'bg-gray-100',
  bgBlue600: 'bg-blue-600',
  bgGreen100: 'bg-green-100',
  bgRed100: 'bg-red-100',
  bgBlue100: 'bg-blue-100',

  // Display utilities
  flex: 'flex',
  flexCol: 'flex-col',
  flex1: 'flex-1',
  itemsCenter: 'items-center',
  itemsStart: 'items-start',
  justifyCenter: 'justify-center',
  justifyEnd: 'justify-end',
  justifyBetween: 'justify-between',
  block: 'block',
  inlineFlex: 'inline-flex',

  // Position utilities
  relative: 'relative',
  absolute: 'absolute',

  // Size utilities
  w4: 'w-4',
  w5: 'w-5',
  w6: 'w-6',
  h4: 'h-4',
  h5: 'h-5',
  h6: 'h-6',
  w10: 'w-10',
  h10: 'h-10',
  w3: 'w-3',
  h3: 'h-3',
  w35: 'w-3.5',
  h35: 'h-3.5',
  wFull: 'w-full',
  minH64: 'min-h-[16rem]',

  // Shadow utilities
  shadow: 'shadow',
  shadowLg: 'shadow-lg',

  // Z-index utilities
  z50: 'z-50',
} as const;

// Re-export cn utility for convenience
export { cn } from '@admin/lib/utils';