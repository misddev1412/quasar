import { Metadata } from 'next';
import Layout from '../../../components/layout/Layout';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import ServiceDetail from '../../../components/services/ServiceDetail';
import { getPublicSiteName } from '../../../lib/site-name';
import { getLocale, getTranslations } from 'next-intl/server';
import { serverTrpc } from '../../../utils/trpc-server';
import { redirect } from 'next/navigation';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getTranslationValue = (
    service: any,
    locale: string,
    field: 'name' | 'slug'
): string | undefined => {
    const normalizedLocale = locale.split('-')[0].toLowerCase();
    return service?.translations?.find((tr: any) => tr?.locale?.toLowerCase() === normalizedLocale)?.[field]
        || service?.translations?.find((tr: any) => tr?.locale?.toLowerCase() === 'en')?.[field]
        || service?.translations?.find((tr: any) => tr?.[field])?.[field];
};

const resolveService = async (identifier: string, locale: string) => {
    if (UUID_REGEX.test(identifier)) {
        const response = await (serverTrpc as any).clientServices.getServiceById.query({ id: identifier });
        return response?.data || null;
    }

    const response = await (serverTrpc as any).clientServices.getServiceBySlug.query({
        slug: identifier,
        locale: locale.split('-')[0],
    });
    return response?.data || null;
};

// Generate metadata - ideally fetch service name
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const siteName = getPublicSiteName();
    const { id: identifier } = await params;
    const locale = await getLocale();

    try {
        const service = await resolveService(identifier, locale);
        if (service) {
            const name = getTranslationValue(service, locale, 'name') || 'Service Details';
            const slug = getTranslationValue(service, locale, 'slug') || identifier;
            return {
                title: `${name} - ${siteName}`,
                description: `Service details and pricing for ${name}.`,
                alternates: {
                    canonical: `/services/${slug}`,
                },
                robots: {
                    index: true,
                    follow: true,
                },
            };
        }
    } catch {
        // Fallback metadata below
    }

    return {
        title: `Service Details - ${siteName}`,
        description: 'Service details and pricing.',
        robots: {
            index: true,
            follow: true
        }
    };
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
    const { id: identifier } = await params;
    const tCommon = await getTranslations('common');
    const locale = await getLocale();

    if (UUID_REGEX.test(identifier)) {
        try {
            const service = await resolveService(identifier, locale);
            const slug = service ? getTranslationValue(service, locale, 'slug') : undefined;
            if (slug && slug !== identifier) {
                redirect(`/services/${slug}`);
            }
        } catch {
            // Let client component show error state if service is not found
        }
    }

    return (
        <Layout>
            <PageBreadcrumbs
                items={[
                    { label: tCommon('home'), href: '/' },
                    { label: tCommon('services'), href: '/services' },
                    { label: tCommon('service_details'), isCurrent: true },
                ]}
                fullWidth
            />
            <div className="bg-gray-50 dark:bg-black min-h-screen py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ServiceDetail identifier={identifier} />
                </div>
            </div>
        </Layout>
    );
}
