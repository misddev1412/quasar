# Input Icon Spacing System

This document outlines the reusable CSS classes and component patterns for input fields with icons, ensuring consistent spacing throughout the application.

## CSS Utility Classes

### Left Icon Spacing Classes

These classes provide consistent left padding for input fields with left-positioned icons:

```css
/* Standard spacing - recommended for most use cases */
.input-with-left-icon {
  padding-left: 3.5rem !important; /* 56px */
}

/* Compact spacing - for tighter layouts */
.input-with-left-icon-compact {
  padding-left: 2.75rem !important; /* 44px */
}

/* Large spacing - for bigger icons or generous layouts */
.input-with-left-icon-large {
  padding-left: 4rem !important; /* 64px */
}
```

### Icon Positioning Class

```css
.input-icon-left {
  position: absolute;
  left: 0.75rem; /* 12px from left edge */
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: theme('colors.gray.400');
}
```

## Component Usage

### 1. InputWithIcon Component (Recommended)

```tsx
import { InputWithIcon } from '../common/InputWithIcon';
import { FiSearch, FiUser } from 'react-icons/fi';

// Standard spacing (default)
<InputWithIcon
  leftIcon={<FiSearch className="h-5 w-5" />}
  placeholder="Search..."
  iconSpacing="standard"
/>

// Compact spacing
<InputWithIcon
  leftIcon={<FiUser className="h-4 w-4" />}
  placeholder="Username"
  iconSpacing="compact"
/>

// Large spacing
<InputWithIcon
  leftIcon={<FiSearch className="h-6 w-6" />}
  placeholder="Search with large icon"
  iconSpacing="large"
/>
```

### 2. Manual Implementation with CSS Classes

```tsx
<div className="relative">
  <div className="input-icon-left">
    <FiSearch className="h-5 w-5" />
  </div>
  <input
    type="text"
    className="block w-full input-with-left-icon pr-3 py-2 border border-gray-300 rounded-md"
    placeholder="Search..."
  />
</div>
```

## Spacing Guidelines

### Icon Sizes and Recommended Spacing

| Icon Size | Tailwind Class | Recommended Spacing | Use Case |
|-----------|----------------|-------------------|----------|
| 16px (4x4) | `h-4 w-4` | `compact` (44px) | Small forms, compact layouts |
| 20px (5x5) | `h-5 w-5` | `standard` (56px) | Most common use case |
| 24px (6x6) | `h-6 w-6` | `large` (64px) | Prominent search fields, headers |

### Visual Spacing Breakdown

```
Standard Spacing (56px total):
[12px margin] [20px icon] [24px gap] [text starts here...]
|-------------|-----------|---------|

Compact Spacing (44px total):
[12px margin] [16px icon] [16px gap] [text starts here...]
|-------------|-----------|---------|

Large Spacing (64px total):
[12px margin] [24px icon] [28px gap] [text starts here...]
|-------------|-----------|---------|
```

## Migration Guide

### From Inline Styles to Utility Classes

**Before:**
```tsx
<input
  className="pl-14 ..." // 56px inline
  style={{ paddingLeft: '56px' }}
/>
```

**After:**
```tsx
<input
  className="input-with-left-icon ..." // 56px via utility class
/>
```

### From FormInput Component

The existing `FormInput` component uses a different pattern with bordered icon containers. For consistency with the new system:

**Before (FormInput with icon):**
```tsx
<FormInput
  icon={<FiSearch />}
  placeholder="Search..."
/>
```

**After (InputWithIcon):**
```tsx
<InputWithIcon
  leftIcon={<FiSearch className="h-5 w-5" />}
  placeholder="Search..."
  iconSpacing="standard"
/>
```

## Best Practices

1. **Use the InputWithIcon component** for new implementations
2. **Choose appropriate spacing** based on icon size and layout context
3. **Maintain consistent icon sizes** within the same interface section
4. **Use semantic HTML** with proper labels and ARIA attributes
5. **Test in both light and dark modes** to ensure proper contrast

## Examples in Codebase

- `QuickAddPermissionModal.tsx` - Uses standard spacing with search icon
- `FormInput.tsx` - Legacy pattern with bordered icon container
- Table search inputs - Uses large spacing (60px) for backward compatibility

## Accessibility Notes

- Icons are automatically set to `pointer-events: none` to prevent interference with input focus
- Color contrast is maintained in both light and dark modes
- The InputWithIcon component supports all standard ARIA attributes
