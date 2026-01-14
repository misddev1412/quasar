import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  buildMetadataFromSiteContent,
  resolvePreferredLocale,
  resolveSiteContent,
} from '../pages/_lib/site-content.server';
import { getPublicSiteName } from '../../lib/site-name';

const ABOUT_CANDIDATES = [
  { type: 'code' as const, value: 'about_us' },
  { type: 'code' as const, value: 'about' },
  { type: 'code' as const, value: 'company_overview' },
  { type: 'slug' as const, value: 'about-us' },
  { type: 'slug' as const, value: 'about' },
  { type: 'slug' as const, value: 'our-story' },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(ABOUT_CANDIDATES, locale);

  if (!siteContent) {
    const siteName = getPublicSiteName();
    return {
      title: `About Us | ${siteName}`,
      description: `Discover the mission, vision, and team behind the ${siteName} storefront experience.`,
    };
  }

  return await buildMetadataFromSiteContent(siteContent);
}

export default async function AboutPage() {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(ABOUT_CANDIDATES, locale);

  if (!siteContent) {
    notFound();
  }

  redirect(`/pages/${siteContent.slug}`);
}
