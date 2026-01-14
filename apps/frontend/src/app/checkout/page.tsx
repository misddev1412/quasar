import type { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import CheckoutPageClient from './CheckoutPageClient';
import { getPublicSiteName } from '../../lib/site-name';

const siteName = getPublicSiteName();
const title = `Checkout | ${siteName}`;

export const metadata: Metadata = {
  title,
  description: 'Securely complete your purchase on the storefront.',
  openGraph: {
    title,
    description: 'Securely complete your purchase on the storefront.',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: 'Securely complete your purchase on the storefront.',
  },
};

export default function CheckoutPage() {
  return (
    <Layout>
      <CheckoutPageClient />
    </Layout>
  );
}
