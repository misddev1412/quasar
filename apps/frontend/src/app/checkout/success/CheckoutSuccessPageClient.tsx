'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../contexts/AuthContext';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';

interface CheckoutSuccessPageClientProps {
  orderId?: string;
  orderNumber?: string;
  email?: string;
  total?: string;
  currency?: string;
}

const CheckoutSuccessPageClient: React.FC<CheckoutSuccessPageClientProps> = ({
  orderId,
  orderNumber,
  email,
  total,
  currency,
}) => {
  const router = useRouter();
  const t = useTranslations('ecommerce.checkout');
  const { isAuthenticated } = useAuth();

  const formattedTotal = useMemo(() => {
    if (!total) {
      return undefined;
    }

    const numericTotal = Number(total);
    if (!Number.isFinite(numericTotal)) {
      return total;
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency && currency.length === 3 ? currency : 'USD',
      }).format(numericTotal);
    } catch (error) {
      console.warn('Failed to format total amount', error);
      return total;
    }
  }, [currency, total]);

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleViewOrders = () => {
    router.push('/profile/orders');
  };

  return (
    <>
      <section className="relative isolate -mt-8 overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/40 blur-3xl" />
          <div className="absolute bottom-0 left-24 h-64 w-64 rounded-full bg-teal-400/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100 shadow-sm">
            {t('success.badge')}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t('success.title')}
          </h1>
          <p className="mt-4 text-lg text-teal-100 sm:text-xl">
            {t('success.subtitle')}
          </p>
        </div>
      </section>

      <PageBreadcrumbs
        items={[
          { label: t('breadcrumb.home'), href: '/' },
          { label: t('breadcrumb.checkout'), href: '/checkout' },
          { label: t('success.breadcrumb'), isCurrent: true },
        ]}
        fullWidth
      />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                ✓
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                {t('success.heading')}
              </h2>
              <p className="mt-3 max-w-2xl text-gray-600">
                {email ? t('success.description_with_email', { email }) : t('success.description')}
              </p>

              <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 text-left">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('success.orderNumber')}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {orderNumber ?? t('success.pendingNumber')}
                  </div>
                  {orderId && (
                    <div className="mt-2 text-xs text-gray-500">
                      {t('success.orderId', { orderId })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 text-left">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('success.orderTotal')}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {formattedTotal ?? t('success.pendingTotal')}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {t('success.orderStatus')}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button color="primary" onPress={handleContinueShopping}>
                  {t('success.actions.continueShopping')}
                </Button>
                {isAuthenticated ? (
                  <Button variant="flat" onPress={handleViewOrders}>
                    {t('success.actions.viewOrders')}
                  </Button>
                ) : (
                  <Button variant="flat" onPress={() => router.push('/login')}>
                    {t('success.actions.createAccount')}
                  </Button>
                )}
              </div>

              <p className="mt-6 text-xs text-gray-500">
                {t('success.helpText')}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
};

export default CheckoutSuccessPageClient;
