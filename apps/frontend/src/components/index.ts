// Common UI Components
export { Button } from './common/Button';
export { Input } from './common/Input';
export { Modal } from './common/Modal';
export { Alert } from './common/Alert';
export { Container } from './common/Container';

// Marketing Components
export { HeroSection } from './marketing/HeroSection';
export { FeatureGrid } from './marketing/FeatureGrid';
export { PricingCard } from './marketing/PricingCard';
export { Testimonial } from './marketing/Testimonial';
export { CTASection } from './marketing/CTASection';

// Authentication Components
export { LoginForm } from './auth/LoginForm';
export { RegisterForm } from './auth/RegisterForm';
export { ForgotPasswordForm } from './auth/ForgotPasswordForm';

// Layout Components
export { Header } from './layout/Header';
export { Footer, defaultSocialIcons } from './layout/Footer';
export { Sidebar } from './layout/Sidebar';

// Utility Components
export { Loading } from './utility/Loading';
export { ErrorBoundary } from './utility/ErrorBoundary';
export { SEO } from './utility/SEO';

// E-commerce Components
export { default as ProductCard, Product } from './ecommerce/ProductCard';
export { default as PriceDisplay } from './ecommerce/PriceDisplay';
export { default as Rating } from './ecommerce/Rating';
export { default as AddToCartButton } from './ecommerce/AddToCartButton';
export { default as ProductList } from './ecommerce/ProductList';
export { default as ProductGrid } from './ecommerce/ProductGrid';
export { default as ShoppingCart, CartItemData } from './ecommerce/ShoppingCart';
export { default as CartItem } from './ecommerce/CartItem';
export { default as ProductFilter, FilterOption, FilterSection } from './ecommerce/ProductFilter';
export { default as ProductSort, SortOption } from './ecommerce/ProductSort';
export { default as ProductSearch } from './ecommerce/ProductSearch';
export { default as Wishlist } from './ecommerce/Wishlist';
export { default as ProductDetails } from './ecommerce/ProductDetails';
export { default as ProductGallery } from './ecommerce/ProductGallery';
export { default as ProductVariants } from './ecommerce/ProductVariants';
export { default as ReviewList, Review } from './ecommerce/ReviewList';
export { default as ReviewForm } from './ecommerce/ReviewForm';
export { default as CheckoutForm, CheckoutFormData } from './ecommerce/CheckoutForm';
export { default as OrderSummary } from './ecommerce/OrderSummary';
export { default as AddressForm, AddressData } from './ecommerce/AddressForm';
export { default as PaymentMethodForm, PaymentMethodData } from './ecommerce/PaymentMethodForm';
export { default as CategoryList, Category } from './ecommerce/CategoryList';
export { default as CategoryCard } from './ecommerce/CategoryCard';
export { default as Breadcrumb, BreadcrumbItem } from './ecommerce/Breadcrumb';

// Type exports
export type { Feature } from './marketing/FeatureGrid';