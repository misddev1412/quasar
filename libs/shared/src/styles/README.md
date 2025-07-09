# Quasar Design System

A comprehensive design system for the Quasar application with consistent colors, typography, spacing, and components.

## Overview

The Quasar Design System provides:

- **Design Tokens**: CSS custom properties and TypeScript constants for colors, typography, spacing, shadows, and borders
- **CSS Reset**: Modern CSS reset with accessibility considerations
- **Base Styles**: Typography, layout, and form styles
- **Responsive System**: Mobile-first responsive utilities
- **Tailwind Integration**: Pre-configured Tailwind CSS theme
- **Animation Utilities**: Smooth transitions and animations

## Installation

The design system is automatically available when you import from the shared library:

```typescript
import { colorTokens, typography, spacing } from '@quasar/shared';
```

The CSS is automatically imported in both admin and client applications via the global stylesheets.

## Color System

### Color Palette

Our color system uses semantic color tokens for consistent theming:

- **Primary**: `#3b82f6` (Blue) - Primary brand color
- **Secondary**: `#0ea5e9` (Sky) - Secondary actions and accents
- **Success**: `#22c55e` (Green) - Success states and positive actions
- **Warning**: `#f59e0b` (Orange) - Warning states and caution
- **Error**: `#ef4444` (Red) - Error states and destructive actions
- **Info**: `#0ea5e9` (Blue) - Informational content
- **Neutral**: Grayscale palette for text and backgrounds

### Usage

#### CSS Custom Properties
```css
.my-element {
  background-color: var(--color-primary-500);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}
```

#### Tailwind CSS Classes
```html
<div class="bg-primary-500 text-white border border-neutral-200">
  Primary button
</div>
```

#### TypeScript
```typescript
import { colorTokens } from '@quasar/shared';

const primaryColor = colorTokens.primary[500]; // '#3b82f6'
const textColor = colorTokens.semantic.text.primary;
```

## Typography

### Font Families

- **Sans**: Inter (default), system fonts fallback
- **Mono**: JetBrains Mono, Monaco, Consolas fallback
- **Serif**: Georgia, serif fallback

### Typography Scale

Our type scale provides consistent sizing and spacing:

- **Headings**: h1 (48px) to h6 (18px)
- **Body**: Base (16px), Large (18px), Small (14px)
- **Captions**: XS (12px)

### Usage

#### CSS Classes
```html
<h1>Main Heading</h1>
<p class="text-large">Large body text</p>
<span class="text-small text-secondary">Secondary text</span>
```

#### Custom Elements
```css
.custom-heading {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}
```

## Spacing System

### Spacing Scale

Our spacing system uses a 4px base unit with logical scaling:

- **Component**: 4px, 8px, 16px, 24px, 32px
- **Layout**: 16px, 24px, 32px, 48px, 64px, 96px
- **Section**: 32px, 48px, 64px, 96px, 128px

### Usage

#### CSS Custom Properties
```css
.container {
  padding: var(--spacing-layout-md);
  margin-bottom: var(--spacing-section-sm);
}
```

#### Tailwind CSS
```html
<div class="p-4 mb-8 gap-6">
  Content with consistent spacing
</div>
```

## Components

### Buttons

```html
<!-- Primary Button -->
<button class="btn">Primary Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Outline Button -->
<button class="btn btn-outline">Outline Button</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>

<!-- Button Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
```

### Form Elements

```html
<form class="form">
  <div class="form-group">
    <label for="email" class="label-required">Email</label>
    <input type="email" id="email" placeholder="Enter your email">
    <div class="form-help">We'll never share your email</div>
  </div>
  
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" placeholder="Your message"></textarea>
  </div>
  
  <button type="submit" class="btn">Submit</button>
</form>
```

### Layout

```html
<!-- Container -->
<div class="container">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow-md p-6">Card content</div>
  </div>
</div>

<!-- Flexbox -->
<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
  <div class="flex-1">Content</div>
  <div class="flex-none">Sidebar</div>
</div>
```

## Responsive Design

### Breakpoints

- **xs**: 0px (mobile first)
- **sm**: 640px (large mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large)

### Responsive Utilities

```html
<!-- Show/Hide at breakpoints -->
<div class="show-md-up">Visible on tablet and up</div>
<div class="hide-lg-up">Hidden on desktop and up</div>

<!-- Responsive layouts -->
<div class="flex-col md:flex-row">
  <div class="w-full md:w-1/2">Content</div>
</div>
```

## Animations

### Transitions

```html
<div class="transition-all duration-300 hover:scale-105">
  Hover to scale
</div>
```

### Keyframe Animations

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in-up">Slides in from bottom</div>
<div class="animate-zoom-in">Zooms in</div>
```

## CSS Custom Properties Reference

### Colors
- `--color-primary-[50-950]`: Primary brand colors
- `--color-text-primary`: Primary text color
- `--color-background-primary`: Primary background color
- `--color-border-default`: Default border color

### Typography
- `--font-family-sans`: Default sans-serif font stack
- `--font-size-base`: Base font size (16px)
- `--font-weight-medium`: Medium font weight (500)
- `--line-height-normal`: Normal line height (1.5)

### Spacing
- `--spacing-[0-96]`: Spacing scale from 0 to 384px
- `--spacing-component-md`: Medium component spacing
- `--spacing-layout-lg`: Large layout spacing

### Shadows
- `--shadow-sm`: Small shadow for subtle elevation
- `--shadow-md`: Medium shadow for cards
- `--shadow-lg`: Large shadow for modals

## Dark Mode

The design system is prepared for dark mode implementation. To enable dark mode:

1. Add dark mode variants to CSS custom properties
2. Use Tailwind's dark mode classes
3. Update the theme configuration

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #1f2937;
    --color-text-primary: #f9fafb;
  }
}
```

## Best Practices

1. **Use semantic tokens**: Prefer `--color-text-primary` over specific color values
2. **Follow spacing scale**: Use predefined spacing values for consistency
3. **Mobile-first responsive**: Design for mobile, enhance for larger screens
4. **Accessibility**: Ensure adequate color contrast and focus states
5. **Performance**: Use CSS custom properties for runtime theming
6. **Consistency**: Stick to the design system for UI consistency

## Contributing

When adding new design tokens:

1. Add TypeScript definitions in `/tokens/`
2. Add CSS custom properties in `/css/tokens/`
3. Update Tailwind config if needed
4. Document usage examples
5. Test across all applications

## Migration Guide

### From Custom Styles

Replace custom styles with design system equivalents:

```css
/* Before */
.my-button {
  background: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
}

/* After */
.my-button {
  background: var(--color-primary-500);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-lg);
}
```

### From Inline Styles

Use utility classes instead of inline styles:

```html
<!-- Before -->
<div style="background: #f3f4f6; padding: 16px;">

<!-- After -->
<div class="bg-neutral-100 p-4">
``` 