# Shared Icons

Thư mục này chứa các icon SVG dùng chung cho cả **Storefront** (Frontend) và **Admin**.

## Cấu trúc

```
icons/
├── README.md          # File hướng dẫn này
├── index.ts           # Export tất cả icons
└── [icon-name].svg    # Các file SVG icon
```

## Cách sử dụng

### 1. Thêm icon mới

Đặt file SVG vào thư mục này với tên mô tả rõ ràng, ví dụ:
- `menu-icon.svg`
- `user-profile.svg`
- `shopping-cart.svg`

### 2. Import icon trong Frontend

```tsx
import MenuIcon from '@shared/icons/menu-icon.svg';

// Sử dụng trong component
<img src={MenuIcon} alt="Menu" />
```

### 3. Import icon trong Admin

```tsx
import MenuIcon from '@shared/icons/menu-icon.svg';

// Sử dụng trong component
<img src={MenuIcon} alt="Menu" />
```

## Best Practices

1. **Tên file**: Sử dụng kebab-case (ví dụ: `user-profile.svg`)
2. **Tối ưu SVG**: Sử dụng công cụ như SVGO để tối ưu kích thước file
3. **ViewBox**: Đảm bảo SVG có thuộc tính `viewBox` để dễ dàng scale
4. **Màu sắc**: Sử dụng `currentColor` cho fill/stroke để dễ dàng thay đổi màu qua CSS
5. **Kích thước**: Không hard-code width/height trong SVG, sử dụng CSS để điều chỉnh

## Ví dụ SVG tối ưu

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
</svg>
```
