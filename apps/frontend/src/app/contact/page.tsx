import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  buildMetadataFromSiteContent,
  resolvePreferredLocale,
  resolveSiteContent,
} from '../pages/_lib/site-content.server';

const CONTACT_CANDIDATES = [
  { type: 'code' as const, value: 'contact_us' },
  { type: 'code' as const, value: 'support' },
  { type: 'code' as const, value: 'contact' },
  { type: 'slug' as const, value: 'contact-us' },
  { type: 'slug' as const, value: 'support' },
  { type: 'slug' as const, value: 'contact' },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(CONTACT_CANDIDATES, locale);

  if (!siteContent) {
    return {
      title: 'Contact Us | Quasar',
      description: 'Reach the Quasar support team for product questions, orders, or partnership inquiries.',
    };
  }

  return buildMetadataFromSiteContent(siteContent);
}

export default async function ContactPage() {
  const locale = await resolvePreferredLocale();
  const siteContent = await resolveSiteContent(CONTACT_CANDIDATES, locale);

  if (!siteContent) {
    notFound();
  }

  redirect(`/pages/${siteContent.slug}`);
}

