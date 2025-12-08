import { createServerTRPCClient } from './seo-server';
import type { SEOData } from '../types/trpc';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Generate sitemap XML using SEO data from backend
 */
export async function generateSitemap(): Promise<string> {
  try {
    const client = createServerTRPCClient();

    // Common pages that should be in sitemap
    const commonPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/about', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/products', priority: 0.9, changefreq: 'daily' as const },
      { path: '/blog', priority: 0.7, changefreq: 'weekly' as const },
      { path: '/contact', priority: 0.6, changefreq: 'monthly' as const },
    ];

    const urls: SitemapURL[] = [];

    // Add common pages
    for (const page of commonPages) {
      urls.push({
        loc: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${page.path}`,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      });
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap on error
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Disallow certain paths if needed
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

`;
}

/**
 * Get SEO data for multiple paths (useful for bulk operations)
 */
export async function getBulkSEOData(paths: string[]): Promise<Record<string, SEOData>> {
  try {
    const client = createServerTRPCClient();
    const results: Record<string, SEOData> = {};

    // Fetch SEO data for each path
    for (const path of paths) {
      try {
        const response = await client.seo.getByPath.query({ path });
        if (response && response.status === 'OK' && response.data) {
          results[path] = response.data as SEOData;
        }
      } catch (error) {
        console.warn(`Failed to fetch SEO data for path ${path}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching bulk SEO data:', error);
    return {};
  }
}