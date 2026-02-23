export type AppRoute = 'home' | 'products' | 'about' | 'contact' | 'news' | 'blog' | 'services';

export const ROUTES_CONFIG: Record<AppRoute, { en: string; vi: string }> = {
    home: {
        en: '/',
        vi: '/',
    },
    products: {
        en: '/products',
        vi: '/san-pham',
    },
    about: {
        en: '/about',
        vi: '/gioi-thieu',
    },
    contact: {
        en: '/contact',
        vi: '/lien-he',
    },
    news: {
        en: '/news',
        vi: '/tin-tuc',
    },
    blog: {
        en: '/blog',
        vi: '/blog',
    },
    services: {
        en: '/services',
        vi: '/dich-vu',
    },
};

export function getLocalizedPath(path: string, locale: string): string {
    // Find a route match
    for (const [key, config] of Object.entries(ROUTES_CONFIG)) {
        // Check for exact match
        if (config.en === path || config.vi === path) {
            return locale === 'vi' ? config.vi : config.en;
        }

        // Check for nested paths (e.g. /products/slug)
        const enPrefix = config.en + '/';
        const viPrefix = config.vi + '/';

        if (path.startsWith(enPrefix)) {
            const slug = path.slice(enPrefix.length);
            return locale === 'vi' ? `${config.vi}/${slug}` : `${config.en}/${slug}`;
        }

        if (path.startsWith(viPrefix)) {
            const slug = path.slice(viPrefix.length);
            return locale === 'vi' ? `${config.vi}/${slug}` : `${config.en}/${slug}`;
        }
    }

    // Handle dynamic routes or unknown routes
    return path;
}

export function getCanonicalPath(path: string): string {
    // Convert any localized path back to the English (canonical) version
    for (const [key, config] of Object.entries(ROUTES_CONFIG)) {
        if (config.vi === path) {
            return config.en;
        }
    }
    return path;
}
