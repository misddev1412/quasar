import { getLocalizedPath } from './routes.config';

/**
 * Generates a localized product link
 * @param slug Product slug
 * @param locale Current locale ('en' | 'vi')
 */
export function getProductLink(slug: string, locale: string): string {
    if (!slug) return locale === 'vi' ? '/san-pham' : '/products';
    // Ensure we use the canonical English path as the base for getLocalizedPath
    return getLocalizedPath(`/products/${slug}`, locale);
}

/**
 * Generates a localized news/post link
 * @param slug Post slug
 * @param locale Current locale ('en' | 'vi')
 */
export function getNewsLink(slug: string, locale: string): string {
    if (!slug) return locale === 'vi' ? '/tin-tuc' : '/news';
    // Ensure we use the canonical English path as the base for getLocalizedPath
    return getLocalizedPath(`/news/${slug}`, locale);
}

/**
 * Generates a localized category link
 * @param slug Category slug (referenceId)
 * @param locale Current locale
 */
export function getCategoryLink(slug: string, locale: string): string {
    if (!slug) return locale === 'vi' ? '/danh-muc' : '/categories';
    return getLocalizedPath(`/categories/${slug}`, locale);
}

/**
 * Generates a localized brand link
 * @param slug Brand slug (referenceId)
 * @param locale Current locale
 */
export function getBrandLink(slug: string, locale: string): string {
    if (!slug) return locale === 'vi' ? '/thuong-hieu' : '/brands';
    return getLocalizedPath(`/brands/${slug}`, locale);
}

/**
 * Generates a localized link for any general page
 * @param path Canonical English path (e.g. '/about')
 * @param locale Current locale
 */
export function getLocalizedLink(path: string, locale: string): string {
    return getLocalizedPath(path, locale);
}
