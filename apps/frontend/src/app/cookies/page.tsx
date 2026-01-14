import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  buildMetadataFromSiteContent,
  resolvePreferredLocale,
  resolveSiteContent,
} from '../pages/_lib/site-content.server';
import { getPublicSiteName } from '../../lib/site-name';

const COOKIE_CANDIDATES = [
  { type: 'code' as const, value: 'cookie_policy' },
  { type: 'code' as const, value: 'cookie-policy' },
  { type: 'code' as const, value: 'cookies' },
  { type: 'slug' as const, value: 'cookie-policy' },
  { type: 'slug' as const, value: 'cookies' },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(COOKIE_CANDIDATES, locale);

  if (!siteContent) {
    const siteName = getPublicSiteName();
    return {
      title: `Cookie Policy | ${siteName}`,
      description: `Learn how ${siteName} uses cookies to enhance your browsing experience and keep your data secure.`,
    };
  }

  return await buildMetadataFromSiteContent(siteContent);
}

export default async function CookiePolicyPage() {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(COOKIE_CANDIDATES, locale);

  if (!siteContent) {
    notFound();
  }

  redirect(`/pages/${siteContent.slug}`);
}
