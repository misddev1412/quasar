# Vietnamese DateTime Formatting

## Overview
The Table component now supports Vietnamese (vi) datetime formatting that automatically adapts based on the current user language setting.

## Features

### Multi-language Support
- **English (en)**: Standard English relative time formatting
- **Vietnamese (vi)**: Vietnamese relative time formatting with proper Vietnamese date formats

### Relative Time Display

When displaying datetime columns with `type: 'datetime'`, the system shows:

#### English Format:
- `Just now` - for items created within the last minute
- `1 minute ago`, `5 minutes ago` - for recent minutes
- `1 hour ago`, `3 hours ago` - for recent hours  
- `Yesterday` - for yesterday
- `2 days ago`, `5 days ago` - for recent days
- `Jan 15, 2024` - for dates older than a week

#### Vietnamese Format:
- `Vừa xong` - for items created within the last minute
- `1 phút trước`, `5 phút trước` - for recent minutes
- `1 giờ trước`, `3 giờ trước` - for recent hours
- `Hôm qua` - for yesterday
- `2 ngày trước`, `5 ngày trước` - for recent days
- `15 tháng 1, 2024` - for dates older than a week (full Vietnamese date format)

### Raw Data Display
Both formats display the raw ISO timestamp on a second line for precision:
```
Vừa xong
2024-01-15T10:30:00.000Z
```

## Implementation

### How It Works
1. The `DateTimeDisplay` component automatically detects the current language using `useTranslationWithBackend()`
2. The `formatDateTime` function formats dates based on the detected locale
3. Vietnamese users see Vietnamese relative time, English users see English relative time

### Usage in Tables
Simply add `type: 'datetime'` to any column definition:

```tsx
const columns: Column<MyType>[] = [
  {
    id: 'createdAt',
    header: 'Created At',
    accessor: 'createdAt', 
    type: 'datetime', // This enables Vietnamese/English formatting
    isSortable: true,
    hideable: true,
  },
  // ... other columns
];
```

### Language Detection
The system automatically detects the current language from:
- `i18n.resolvedLanguage` from the translation hook
- Falls back to 'en' if language detection fails

## Examples

### Vietnamese (vi locale):
- Recent: `Vừa xong`, `5 phút trước`, `2 giờ trước`
- Yesterday: `Hôm qua`
- Past week: `3 ngày trước`
- Older: `15 tháng 1, 2024`

### English (en locale):
- Recent: `Just now`, `5 minutes ago`, `2 hours ago`  
- Yesterday: `Yesterday`
- Past week: `3 days ago`
- Older: `Jan 15, 2024`

## Pages Updated
All admin pages now support Vietnamese datetime formatting:
- ✅ Permissions page (`createdAt`)
- ✅ Users page (`createdAt`) 
- ✅ Roles page (`createdAt`)
- ✅ Mail Templates page (`updatedAt`)
- ✅ Posts page (`createdAt`, `publishedAt`)
- ✅ Languages page (`createdAt`)

## Technical Details

### Components
- `formatDateTime(value, locale, t)`: Core formatting function
- `DateTimeDisplay`: React component that renders formatted datetime
- Automatically detects locale and formats accordingly

### Supported Locales
- `en`: English
- `vi`: Vietnamese

Future locales can be easily added by extending the `formatDateTime` function.