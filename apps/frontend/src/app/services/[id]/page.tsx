import { Metadata } from 'next';
import Layout from '../../../components/layout/Layout';
import ServiceDetail from '../../../components/services/ServiceDetail';
import { getPublicSiteName } from '../../../lib/site-name';

// Generate metadata - ideally fetch service name
export async function generateMetadata(): Promise<Metadata> {
    const siteName = getPublicSiteName();

    return {
        title: `Service Details - ${siteName}`,
        description: 'Service details and pricing.',
        robots: { // Prevent indexing if no data, ideally we fetch data here
            index: true,
            follow: true
        }
    };
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Layout>
            <div className="bg-gray-50 dark:bg-black min-h-screen py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ServiceDetail id={id} />
                </div>
            </div>
        </Layout>
    );
}
