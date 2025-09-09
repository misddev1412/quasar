# tRPC Best Practices Guide

## 🎯 Problem Solved
This setup eliminates the duplication between tRPC router implementations and type definitions, preventing the common issue where `@Router({ alias: 'xyz' })` decorators get out of sync with TypeScript types.

## 📁 New Architecture

```
src/trpc/
├── router-config.ts          # ✨ Single source of truth for all router aliases
├── routers/
│   └── admin/
│       ├── product-categories.router.ts  # Uses ALIASES.adminProductCategories
│       ├── product-brands.router.ts      # Uses ALIASES.adminProductBrands  
│       └── product-products.router.ts    # Uses ALIASES.adminProductProducts
└── types/
    └── app-router.ts         # ✨ Uses ROUTER_ALIASES for consistency
```

## 🚀 Implementation Steps

### Phase 1: Immediate Fix (Current)
✅ **Created central router config** (`router-config.ts`)
✅ **Updated type definitions** to use central config  
✅ **Fixed product categories router** to use `ALIASES.adminProductCategories`

### Phase 2: Migrate Remaining Routers (Next)
```typescript
// Before (error-prone):
@Router({ alias: 'adminProductBrands' })

// After (consistent):
import { ALIASES } from '../../router-config';
@Router({ alias: ALIASES.adminProductBrands })
```

### Phase 3: Add Code Generation (Future)
- Implement the generator script at `tools/generate-router-types.js`
- Add npm script: `"generate:router-types": "node tools/generate-router-types.js"`
- Integrate into build process

## 🔧 Usage Examples

### In Router Files:
```typescript
import { ALIASES } from '../../router-config';

@Router({ alias: ALIASES.adminProductCategories })
export class AdminProductCategoriesRouter {
  // Implementation...
}
```

### In Client Code:
```typescript
// This now works without type errors:
const { data } = trpc.adminProductCategories.getTree.useQuery({
  includeInactive: false
});
```

## ✅ Benefits

1. **Single Source of Truth**: All router names defined in one place
2. **Type Safety**: IDE autocomplete for router aliases
3. **Consistency**: Impossible to have mismatched aliases
4. **Maintainable**: Easy to rename or refactor routers
5. **Future-Proof**: Ready for code generation when needed

## 🔄 Migration Checklist

- [x] Create `router-config.ts` with all aliases
- [x] Update `app-router.ts` to use central config
- [x] Fix `AdminProductCategoriesRouter` implementation
- [ ] Update remaining router files to use `ALIASES.*`
- [ ] Test all tRPC endpoints work correctly
- [ ] Consider implementing code generation script

## 🚨 Important Notes

- Always use `ALIASES.routerName` instead of string literals
- Keep the router config organized by functional groups  
- Update both the config AND the router when adding new endpoints
- Test TypeScript compilation after changes

## 🎯 Next Steps

1. **Immediate**: Update remaining router files to use central config
2. **Short-term**: Add validation to ensure all routers use the config
3. **Long-term**: Implement code generation to eliminate manual type definitions

This approach gives you the benefits of both maintainable code and strong TypeScript support!