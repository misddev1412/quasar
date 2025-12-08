import type { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import CheckoutPageClient from './CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout | Quasar Storefront',
  description: 'Securely complete your purchase on the Quasar storefront.',
  openGraph: {
    title: 'Checkout | Quasar Storefront',
    description: 'Securely complete your purchase on the Quasar storefront.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checkout | Quasar Storefront',
    description: 'Securely complete your purchase on the Quasar storefront.',
  },
};

export default function CheckoutPage() {
  return (
    <Layout>
      <CheckoutPageClient />
    </Layout>
  );
}
