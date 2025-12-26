import { BannerLinkType } from './types';

export const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const ensureNumber = (value: unknown, fallback: number) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const buildBannerLinkHref = (type: BannerLinkType, referenceId?: string) => {
    if (!referenceId) {
        return '';
    }
    switch (type) {
        case 'category':
            return `/categories/${referenceId}`;
        case 'product':
            return `/products/${referenceId}`;
        default:

            return referenceId;
    }
};

export const mapProductToOption = (product: any, t: any): import('./types').ProductOption => {
    let priceLabel: string | null = null;
    if (product?.priceRange) {
        priceLabel = product.priceRange;
    } else if (product?.lowestPrice != null && product?.highestPrice != null && product.lowestPrice !== product.highestPrice) {
        priceLabel = `${currencyFormatter.format(product.lowestPrice)} – ${currencyFormatter.format(product.highestPrice)}`;
    } else if (product?.lowestPrice != null) {
        priceLabel = currencyFormatter.format(product.lowestPrice);
    }

    const primaryImage = product?.primaryImage || product?.imageUrls?.[0] || product?.media?.[0]?.url || null;

    return {
        value: product.id,
        label: product.name || t('sections.manager.productsByCategory.unnamedProduct'),
        sku: product.sku,
        image: primaryImage,
        priceLabel,
        brandName: product?.brand?.name ?? null,
    };
};
