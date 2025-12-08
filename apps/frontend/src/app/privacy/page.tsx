import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  buildMetadataFromSiteContent,
  resolvePreferredLocale,
  resolveSiteContent,
} from '../pages/_lib/site-content.server';

const PRIVACY_CANDIDATES = [
  { type: 'code' as const, value: 'privacy_policy' },
  { type: 'code' as const, value: 'privacy-policy' },
  { type: 'code' as const, value: 'privacy' },
  { type: 'slug' as const, value: 'privacy-policy' },
  { type: 'slug' as const, value: 'privacy' },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(PRIVACY_CANDIDATES, locale);

  if (!siteContent) {
    return {
      title: 'Privacy Policy | Quasar',
      description: 'Read our privacy policy to learn how we protect and manage your personal information.',
    };
  }

  return buildMetadataFromSiteContent(siteContent);
}

export default async function PrivacyPolicyPage() {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(PRIVACY_CANDIDATES, locale);

  if (!siteContent) {
    notFound();
  }

  redirect(`/pages/${siteContent.slug}`);
}

