# Component Config Form - Translation Replacement Guide

## Summary
The `ComponentConfigForm.tsx` file contains **200+ hardcoded Vietnamese strings** that need to be replaced with `t()` translation calls.

## Translation Keys Added
✅ Added **193 translation keys** to both `en/common.json` and `vi/common.json`
✅ All keys are under `componentConfigs.*` namespace

## Files Modified
1. `/apps/admin/src/i18n/locales/en/common.json` - Added English translations
2. `/apps/admin/src/i18n/locales/vi/common.json` - Added Vietnamese translations

## Next Steps - Systematic Replacement

The hardcoded strings in `ComponentConfigForm.tsx` need to be replaced in these sections:

### 1. Product Card Layout Options (Lines 1621-1660)
**Current:**
```typescript
const PRODUCT_CARD_LAYOUT_OPTIONS: SelectOption[] = [
  { value: 'vertical', label: 'Dọc • Ảnh ở trên, nội dung ở dưới' },
  { value: 'horizontal', label: 'Ngang • Ảnh bên trái, nội dung bên phải' },
];
```

**Replace with:**
```typescript
const PRODUCT_CARD_LAYOUT_OPTIONS: SelectOption[] = [
  { value: 'vertical', label: t('componentConfigs.productCardLayoutVertical', 'Vertical • Image on top, content below') },
  { value: 'horizontal', label: t('componentConfigs.productCardLayoutHorizontal', 'Horizontal • Image on left, content on right') },
];
```

### 2. Font/Style Options (Lines 1626-1660)
Replace all hardcoded Vietnamese labels with their corresponding translation keys.

### 3. Structure Tab Content (Lines 1210-1428)
Replace all hardcoded labels and placeholders:
- "Component visibility" → `t('componentConfigs.componentVisibility', 'Component visibility')`
- "Disabled components stay callable..." → `t('componentConfigs.componentVisibilityDesc', '...')`
- "Component Key" → `t('componentConfigs.componentKey', 'Component Key')`
- And ~50 more similar replacements

### 4. Product Card Editors (Lines 1678-2105)
Replace all Vietnamese strings in:
- `ProductCardDefaultsEditor`
- `ProductCardTitleEditor`
- `ProductCardPriceEditor`

### 5. Sidebar Editor (Lines 2211-2797)
Replace all Vietnamese strings in:
- `ProductsByCategorySidebarEditor`
- `SidebarSectionEditor`
- `SidebarItemEditor`

## Complete Replacement Needed

Would you like me to proceed with the complete file replacement? This will:
1. Replace ALL 200+ hardcoded strings with proper `t()` calls
2. Maintain all existing functionality
3. Make the component fully translatable

The changes are extensive but straightforward - every hardcoded Vietnamese string will be replaced with its corresponding translation key using the `t()` function that's already imported.

**Estimated replacements:** 200+ strings across ~1500 lines of code

Confirm to proceed with the full replacement?
