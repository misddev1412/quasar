import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ChatBubbleLeftRightIcon,
  EnvelopeOpenIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  FileText,
  Headset,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wallet,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';
import {
  buildMetadataFromSiteContent,
  extractSummary,
  resolvePreferredLocale,
  resolveSiteContent,
} from '../pages/_lib/site-content.server';

const HELP_CANDIDATES = [
  { type: 'code' as const, value: 'help_center' },
  { type: 'code' as const, value: 'support_center' },
  { type: 'code' as const, value: 'help' },
  { type: 'slug' as const, value: 'help-center' },
  { type: 'slug' as const, value: 'support' },
  { type: 'slug' as const, value: 'help' },
];

type HelpPageSearchParams = Record<string, string | string[] | undefined>;

interface HelpPageProps {
  searchParams?: HelpPageSearchParams;
}

export async function generateMetadata({ searchParams }: HelpPageProps = {}): Promise<Metadata> {
  const locale = await resolvePreferredLocale(searchParams);
  const siteContent = await resolveSiteContent(HELP_CANDIDATES, locale);

  if (siteContent) {
    return await buildMetadataFromSiteContent(siteContent);
  }

  const t = await getTranslations({ locale, namespace: 'pages.help.seo' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HelpPage({ searchParams }: HelpPageProps = {}) {
  const locale = await resolvePreferredLocale(searchParams);
  const t = await getTranslations({ locale, namespace: 'pages.help' });
  const siteContent = await resolveSiteContent(HELP_CANDIDATES, locale);

  const heroTitle = siteContent?.title ?? t('hero.title');
  const heroDescription =
    siteContent?.summary ?? (siteContent ? extractSummary(siteContent, 220) : t('hero.subtitle'));
  const richContent = siteContent?.content ?? null;

  const popularSearches = [
    { label: t('hero.popular.trackOrder'), query: t('hero.popular.trackOrderQuery') },
    { label: t('hero.popular.updateAccount'), query: t('hero.popular.updateAccountQuery') },
    { label: t('hero.popular.returnProduct'), query: t('hero.popular.returnProductQuery') },
  ];

  const quickLinks = [
    {
      icon: ShoppingBag,
      title: t('quickLinks.orders.title'),
      description: t('quickLinks.orders.description'),
      href: '/profile/orders',
    },
    {
      icon: Wallet,
      title: t('quickLinks.payments.title'),
      description: t('quickLinks.payments.description'),
      href: '/profile/payment',
    },
    {
      icon: ShieldCheck,
      title: t('quickLinks.security.title'),
      description: t('quickLinks.security.description'),
      href: '/profile/security',
    },
    {
      icon: Headset,
      title: t('quickLinks.support.title'),
      description: t('quickLinks.support.description'),
      href: '/contact',
    },
  ];

  const resourceHighlights = [
    {
      icon: Sparkles,
      title: t('resources.guides.title'),
      description: t('resources.guides.description'),
      href: `/search?q=${encodeURIComponent(t('resources.guides.title'))}`,
    },
    {
      icon: FileText,
      title: t('resources.shipping.title'),
      description: t('resources.shipping.description'),
      href: `/search?q=${encodeURIComponent(t('resources.shipping.title'))}`,
    },
    {
      icon: ShoppingBag,
      title: t('resources.returns.title'),
      description: t('resources.returns.description'),
      href: `/search?q=${encodeURIComponent(t('resources.returns.title'))}`,
    },
    {
      icon: Headset,
      title: t('resources.community.title'),
      description: t('resources.community.description'),
      href: `/search?q=${encodeURIComponent(t('resources.community.title'))}`,
    },
  ];

  const faqItems = [
    {
      id: 'shipping',
      question: t('faq.items.shipping.question'),
      answer: t('faq.items.shipping.answer'),
    },
    {
      id: 'returns',
      question: t('faq.items.returns.question'),
      answer: t('faq.items.returns.answer'),
    },
    {
      id: 'account',
      question: t('faq.items.account.question'),
      answer: t('faq.items.account.answer'),
    },
    {
      id: 'payments',
      question: t('faq.items.payments.question'),
      answer: t('faq.items.payments.answer'),
    },
  ];

  const contactMethods = [
    {
      id: 'chat',
      icon: ChatBubbleLeftRightIcon,
      title: t('contact.chat.title'),
      description: t('contact.chat.description'),
      href: '/contact?method=chat',
    },
    {
      id: 'email',
      icon: EnvelopeOpenIcon,
      title: t('contact.email.title'),
      description: t('contact.email.description'),
      href: 'mailto:support@quasar.dev',
    },
    {
      id: 'call',
      icon: PhoneIcon,
      title: t('contact.call.title'),
      description: t('contact.call.description'),
      href: 'tel:+18001234567',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white">
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-30">
            <div className="absolute inset-0 rotate-12 bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wide text-white/90">
                  {t('hero.badge')}
                </span>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                  {heroTitle}
                </h1>
                <p className="mt-4 text-lg text-white/80 md:text-xl">
                  {heroDescription}
                </p>

                <form
                  action="/search"
                  method="get"
                  className="mt-10 flex w-full flex-col gap-4 rounded-2xl bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-lg sm:flex-row sm:items-center"
                >
                  <div className="flex w-full flex-1 items-center gap-3 rounded-xl bg-white/90 px-4 py-3 text-gray-900">
                    <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M18 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                    </svg>
                    <input
                      type="search"
                      name="q"
                      placeholder={t('hero.searchPlaceholder')}
                      className="w-full bg-transparent text-base text-gray-800 placeholder-gray-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/20 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/30"
                  >
                    {t('hero.searchButton')}
                  </button>
                </form>

                <div className="mt-8">
                  <p className="text-sm uppercase tracking-wide text-white/60">
                    {t('hero.popular.title')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {popularSearches.map((item) => (
                      <Link
                        key={item.label}
                        href={`/search?q=${encodeURIComponent(item.query)}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-lg">
                <div>
                  <p className="text-sm font-semibold text-white/80">{t('hero.support.title')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('hero.support.description')}</p>
                </div>
                <div className="flex flex-col gap-3 text-sm text-white/70">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>{t('hero.support.averageReply')}</span>
                    <span className="text-sm font-semibold text-emerald-200">{t('hero.support.averageReplyValue')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>{t('hero.support.availability')}</span>
                    <span className="text-sm font-semibold text-emerald-200">{t('hero.support.availabilityValue')}</span>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                  >
                    <Headset className="h-4 w-4" />
                    {t('hero.support.cta')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PageBreadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: '/' },
            { label: t('breadcrumbs.help'), isCurrent: true },
          ]}
          fullWidth
        />

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <section className="mb-16">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('quickLinks.title')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('quickLinks.description')}</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map(({ icon: Icon, title, description, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-500 transition group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3">
                    {t('quickLinks.cta')}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {richContent && (
            <section className="mb-16">
              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-white via-white to-indigo-50 p-8 shadow-sm dark:border-indigo-900/40 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/40">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('resources.featured.title')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('resources.featured.description')}</p>
                <article className="prose prose-slate mt-6 max-w-none dark:prose-invert">
                  <div className="prose-headings:scroll-mt-24" dangerouslySetInnerHTML={{ __html: richContent }} />
                </article>
                <div className="mt-6 flex items-center justify-end">
                  {siteContent?.slug && (
                    <Link
                      href={`/pages/${siteContent.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                      {t('resources.featured.cta')}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="mb-16" id="contact">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('contact.title')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('contact.description')}</p>
              </div>
              <div className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-500/10 dark:text-indigo-200">
                {t('contact.note')}
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {contactMethods.map(({ id, icon: Icon, title, description, href }) => (
                <a
                  key={id}
                  href={href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-500 transition group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3">
                    {t('contact.cta')}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="mb-16" id="resources">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('resources.title')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('resources.description')}</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {resourceHighlights.map(({ icon: Icon, title, description, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-500 transition group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3">
                    {t('resources.cta')}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-16" id="faq">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('faq.title')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('faq.description')}</p>
              </div>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition open:border-indigo-500 open:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-left text-base font-semibold text-gray-900 outline-none transition focus:text-indigo-600 group-open:text-indigo-600 dark:text-white">
                    <span>{item.question}</span>
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition group-open:rotate-45 group-open:border-indigo-200 group-open:bg-indigo-50 group-open:text-indigo-600 dark:border-gray-700 dark:bg-gray-900">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 p-10 text-white shadow-lg dark:border-indigo-900/40">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -left-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                  {t('cta.title')}
                </h2>
                <p className="mt-3 text-lg text-white/80">{t('cta.description')}</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
              >
                {t('cta.button')}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
