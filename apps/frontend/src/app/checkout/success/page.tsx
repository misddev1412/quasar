import type { Metadata } from 'next';
import Layout from '../../../components/layout/Layout';
import CheckoutSuccessPageClient from './CheckoutSuccessPageClient';
import { getPublicSiteName } from '../../../lib/site-name';

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

const getParam = (params: SearchParams, key: string): string | undefined => {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
};

const siteName = getPublicSiteName();
const title = `Order Confirmed | ${siteName}`;

export const metadata: Metadata = {
  title,
  description: 'Thank you for your order. We have sent a confirmation to your email address.',
  openGraph: {
    title,
    description: 'Thank you for your order. We have sent a confirmation to your email address.',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: 'Thank you for your order. We have sent a confirmation to your email address.',
  },
};

interface CheckoutSuccessPageProps {
  searchParams: SearchParams;
}

export default function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const orderNumber = getParam(searchParams, 'orderNumber');
  const orderId = getParam(searchParams, 'orderId');
  const email = getParam(searchParams, 'email');
  const total = getParam(searchParams, 'total');
  const currency = getParam(searchParams, 'currency');

  return (
    <Layout>
      <CheckoutSuccessPageClient
        orderNumber={orderNumber}
        orderId={orderId}
        email={email}
        total={total}
        currency={currency}
      />
    </Layout>
  );
}
