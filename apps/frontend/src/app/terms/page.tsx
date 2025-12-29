import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  buildMetadataFromSiteContent,
  resolvePreferredLocale,
  resolveSiteContent,
} from '../pages/_lib/site-content.server';

const TERMS_CANDIDATES = [
  { type: 'code' as const, value: 'terms_of_service' },
  { type: 'code' as const, value: 'terms-of-service' },
  { type: 'code' as const, value: 'terms' },
  { type: 'slug' as const, value: 'terms-of-service' },
  { type: 'slug' as const, value: 'terms' },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(TERMS_CANDIDATES, locale);

  if (!siteContent) {
    return {
      title: 'Terms of Service | Quasar',
      description: 'Review our terms of service to understand the rules and guidelines for using the Quasar storefront.',
    };
  }

  return await buildMetadataFromSiteContent(siteContent);
}

export default async function TermsOfServicePage() {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(TERMS_CANDIDATES, locale);

  if (!siteContent) {
    notFound();
  }

  redirect(`/pages/${siteContent.slug}`);
}

