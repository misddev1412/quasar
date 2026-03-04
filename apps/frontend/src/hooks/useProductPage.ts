import { useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useProductState } from '@frontend/hooks/useProductState';
import { useProductVariants } from '@frontend/hooks/useProductVariants';
import type { Product, ProductVariant, ProductMedia, ProductSpecification } from '@frontend/types/product';
import { useLocalePath } from '@frontend/lib/routing';

interface UseProductPageProps {
    product: Product;
    onAddToCart?: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
    onWishlistToggle?: (productId: string) => void;
    onReviewSubmit?: (review: { rating: number; title: string; comment: string }) => void;
}

export const useProductPage = ({
    product,
    onAddToCart,
    onWishlistToggle,
    onReviewSubmit,
}: UseProductPageProps) => {
    const t = useTranslations('product.detail');
    const router = useRouter();
    const { createLocalUrl } = useLocalePath();
    const detailTabsRef = useRef<HTMLDivElement | null>(null);

    const {
        id,
        name,
        description,
        images,
        slug,
        sku,
        status,
        isActive,
        isFeatured,
        variants,
        media,
        categories,
        brand,
        tags,
        specifications,
    } = product;

    // Product state hook
    const {
        quantity,
        wishlistAdded,
        selectedImageIndex,
        activeDetailTab,
        handleQuantityChange,
        handleAddToCart: handleAddToCartState,
        handleWishlistToggle,
        handleImageSelect,
        handleDetailTabChange,
    } = useProductState({
        productId: product.id,
        onAddToCart,
        onWishlistToggle,
    });

    // Product variants hook
    const {
        selectedVariant,
        selectedAttributes,
        variantAttributes,
        attributeIndexMap,
        hasAttributeBasedVariants,
        isOptionDisabled,
        handleAttributeSelect,
        selectVariant,
    } = useProductVariants({
        variants: product.variants,
    });

    // Get primary image or first image
    const getPrimaryImage = useCallback(() => {
        if (media && media.length > 0) {
            const primaryMedia = media.find((m: ProductMedia) => m.isPrimary);
            return primaryMedia?.url || media[0].url;
        }
        if (images && images.length > 0) {
            return images[0];
        }
        return '/placeholder-product.png';
    }, [media, images]);

    const breadcrumbItems = useMemo(() => {
        const items: { label: string; href?: string; isCurrent?: boolean }[] = [{ label: t('breadcrumb.home'), href: '/' }];
        items.push({
            label: t('breadcrumb.categories'),
            href: createLocalUrl('/categories'),
        });

        if (categories && categories.length > 0) {
            const primaryCategory = categories[0] as any;
            if (primaryCategory) {
                const categoryName = primaryCategory.name ?? primaryCategory?.title ?? t('breadcrumb.categoryFallback');
                const categorySlug = primaryCategory.slug;

                items.push({
                    label: categoryName,
                    href: categorySlug ? createLocalUrl(`/categories/${categorySlug}`) : undefined,
                });
            }
        }

        items.push({ label: name, isCurrent: true });

        return items;
    }, [categories, createLocalUrl, name, t]);

    // Get images for gallery
    const productImages = useMemo(() => {
        const mediaImages = (media ?? [])
            .filter((m: ProductMedia) => m.isImage && typeof m.url === 'string' && m.url.trim().length > 0)
            .sort((a: ProductMedia, b: ProductMedia) => {
                if (a.isPrimary !== b.isPrimary) {
                    return a.isPrimary ? -1 : 1;
                }
                return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
            })
            .map((m: ProductMedia) => m.url.trim());

        const fallbackImages = (images ?? [])
            .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
            .map((url) => url.trim());

        const mergedImages = [...mediaImages, ...fallbackImages];
        const uniqueImages = Array.from(new Set(mergedImages));

        return uniqueImages.length > 0 ? uniqueImages : [getPrimaryImage()];
    }, [media, images, getPrimaryImage]);

    // Get videos
    const productVideos = useMemo(() => {
        if (!media) {
            return [];
        }

        return media
            .filter((m: ProductMedia) => m.type === 'video')
            .map((m: ProductMedia) => ({
                url: m.url,
                title: t('videos.itemTitle', { name }),
                thumbnail: undefined,
            }));
    }, [media, name, t]);

    // Check if product is in stock
    const inStock = isActive && status === 'ACTIVE';

    const productFeatures = useMemo(() => {
        const raw = t.raw('overview.features');
        return Array.isArray(raw) ? (raw as string[]) : [];
    }, [t]);

    const defaultDescriptionDetails = useMemo(() => {
        const raw = t.raw('description.defaults');
        if (raw && typeof raw === 'object') {
            return raw as {
                materials?: string;
                careInstructions?: string[];
                dimensions?: string;
                weight?: string;
                origin?: string;
                warranty?: string;
            };
        }
        return {};
    }, [t]);

    const specificationItems = useMemo(() => {
        const explicit = (specifications ?? [])
            .filter((spec: ProductSpecification) => spec && typeof spec.name === 'string' && spec.name.trim() !== '' && spec.value !== undefined && spec.value !== null && String(spec.value).trim() !== '')
            .map((spec: ProductSpecification) => ({
                id: spec.id ?? `spec-${spec.name}-${spec.sortOrder ?? ''}`,
                name: spec.name.trim(),
                value: String(spec.value).trim(),
                sortOrder: spec.sortOrder ?? 0,
            }))
            .sort((a: { sortOrder: number }, b: { sortOrder: number }) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        const existingNames = new Set(explicit.map((spec) => spec.name.toLowerCase()));

        const autoEntries: { id: string; name: string; value: string; sortOrder: number }[] = [];
        const appendAuto = (name: string, rawValue: unknown) => {
            if (rawValue === undefined || rawValue === null) {
                return;
            }

            const value = typeof rawValue === 'string' ? rawValue : String(rawValue);
            if (!value.trim()) {
                return;
            }

            const lowerName = name.toLowerCase();
            if (existingNames.has(lowerName)) {
                return;
            }

            autoEntries.push({
                id: `auto-${lowerName}`,
                name,
                value: value.trim(),
                sortOrder: explicit.length + autoEntries.length,
            });
            existingNames.add(lowerName);
        };

        const autoLabels = {
            category: t('specifications.autoLabels.category'),
        };

        appendAuto(autoLabels.category, (categories?.[0] as any)?.name);

        return [...explicit, ...autoEntries];
    }, [specifications, categories, t]);

    const formatSpecificationLabel = (label: string) => {
        const withSpaces = label
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const normalized = withSpaces.toLocaleLowerCase('vi-VN');

        return normalized
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0).toLocaleUpperCase('vi-VN') + word.slice(1))
            .join(' ');
    };

    // Product details
    const productDetails = {
        materials: defaultDescriptionDetails.materials ?? '',
        careInstructions: Array.isArray(defaultDescriptionDetails.careInstructions)
            ? defaultDescriptionDetails.careInstructions
            : [],
        dimensions: variants?.[0]?.dimensions || defaultDescriptionDetails.dimensions || '',
        weight: variants?.[0]?.weight
            ? String(variants[0].weight)
            : defaultDescriptionDetails.weight || '',
        origin: defaultDescriptionDetails.origin ?? '',
        warranty: defaultDescriptionDetails.warranty ?? '',
    };

    const descriptionText = description && description.trim().length > 0
        ? description
        : t('description.fallback');

    const handleScrollToReviews = useCallback(() => {
        handleDetailTabChange('reviews');

        if (typeof window === 'undefined') {
            return;
        }

        requestAnimationFrame(() => {
            detailTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }, [handleDetailTabChange]);

    const handleAddToCart = useCallback(() => {
        handleAddToCartState(product, selectedVariant);
    }, [handleAddToCartState, product, selectedVariant]);

    const handleBuyNow = useCallback(() => {
        if (!inStock) {
            return;
        }

        if (hasAttributeBasedVariants && !selectedVariant) {
            return;
        }

        handleAddToCartState(product, selectedVariant);
        router.push('/checkout');
    }, [handleAddToCartState, hasAttributeBasedVariants, inStock, product, router, selectedVariant]);

    const handleReviewSubmit = useCallback((review: { rating: number; title: string; comment: string }) => {
        if (onReviewSubmit) {
            onReviewSubmit(review);
        }
    }, [onReviewSubmit]);

    return {
        // State
        quantity,
        wishlistAdded,
        selectedImageIndex,
        activeDetailTab,
        selectedVariant,
        selectedAttributes,
        variantAttributes,
        attributeIndexMap,
        detailTabsRef,

        // Data
        productImages,
        productVideos,
        breadcrumbItems,
        productFeatures,
        productDetails,
        specificationItems,
        descriptionText,
        inStock,
        hasAttributeBasedVariants,
        isOptionDisabled,

        // Helpers
        formatSpecificationLabel,

        // Handlers
        handleQuantityChange,
        handleAddToCart,
        handleWishlistToggle,
        handleImageSelect,
        handleDetailTabChange,
        handleAttributeSelect,
        selectVariant,
        handleBuyNow,
        handleScrollToReviews,
        handleReviewSubmit,
    };
};
