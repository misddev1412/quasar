import { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import ServicesContainer from '../../components/services/ServicesContainer';
import { getPublicSiteName } from '../../lib/site-name';

// Generate metadata for services page
export async function generateMetadata(): Promise<Metadata> {
    const siteName = getPublicSiteName();
    const title = `Services - ${siteName}`;

    return {
        title,
        description: 'Explore our professional services and solutions.',
        keywords: 'services, professional solutions, booking, consultation',
        openGraph: {
            title,
            description: 'Explore our professional services and solutions.',
            type: 'website',
        },
    };
}

export default function ServicesPage() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-16 lg:py-20 -mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Our Professional
                            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mt-2">
                                Services
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                            Tailored solutions designed to meet your specific needs and help you achieve your goals
                        </p>
                    </div>
                </div>
            </section>

            {/* Services List */}
            <section className="py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Available Services</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                    <ServicesContainer />
                </div>
            </section>
        </Layout>
    );
}
