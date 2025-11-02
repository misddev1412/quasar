'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button } from '@heroui/react';
import CheckoutForm, {
  CheckoutFormData,
  SavedAddress,
  CheckoutCountry,
} from '../../components/ecommerce/CheckoutForm';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useTranslations } from 'next-intl';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../contexts/AuthContext';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';

const currencySymbolMap: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  VND: '₫',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

function getCurrencySymbol(currency?: string): string {
  if (!currency) {
    return '$';
  }
  const upper = currency.toUpperCase();
  return currencySymbolMap[upper] || (upper.length <= 3 ? upper : '$');
}

const CheckoutPageClient = () => {
  const router = useRouter();
  const t = useTranslations('ecommerce.checkout');
  const { showToast } = useToast();
  const { items, summary, validation, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const addressesQuery = trpc.clientAddressBook.getAddresses.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });
  const countriesQuery = trpc.clientAddressBook.getCountries.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });

  const savedAddresses = useMemo(() => {
    const raw = addressesQuery.data;
    if (!raw) return [] as SavedAddress[];
    if (Array.isArray(raw)) return raw as SavedAddress[];
    if (Array.isArray((raw as any).data)) return (raw as any).data as SavedAddress[];
    return [] as SavedAddress[];
  }, [addressesQuery.data]);

  const availableCountries = useMemo(() => {
    const raw = countriesQuery.data;
    if (!raw) return [] as CheckoutCountry[];
    if (Array.isArray(raw)) return raw as CheckoutCountry[];
    if (Array.isArray((raw as any).data)) return (raw as any).data as CheckoutCountry[];
    return [] as CheckoutCountry[];
  }, [countriesQuery.data]);

  const hasCartIssues = validation.errors.length > 0 || validation.warnings.length > 0;

  const currencySymbol = useMemo(() => getCurrencySymbol(summary.totals.currency), [summary.totals.currency]);

  const handleContinueShopping = useCallback(() => {
    router.push('/products');
  }, [router]);

  const handleCheckoutSubmit = useCallback(
    async (data: CheckoutFormData) => {
      if (summary.isEmpty) {
        showToast({
          type: 'warning',
          title: t('toast.empty.title'),
          message: t('toast.empty.message'),
        });
        router.push('/products');
        return;
      }

      if (validation.errors.length > 0) {
        showToast({
          type: 'warning',
          title: t('toast.validation.title'),
          message: t('toast.validation.message'),
        });
        return;
      }

      setIsSubmitting(true);
      try {
        // TODO: Replace with real checkout API integration
        await new Promise((resolve) => setTimeout(resolve, 1200));

        showToast({
          type: 'success',
          title: t('toast.success.title'),
          message: t('toast.success.message'),
        });

        await clearCart();
        router.push('/profile/orders');
      } catch (error) {
        console.error('Checkout submission failed', error);
        showToast({
          type: 'error',
          title: t('toast.error.title'),
          message: t('toast.error.message'),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearCart, router, showToast, summary.isEmpty, t, validation.errors.length]
  );

  const renderEmptyState = () => (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-4xl">
        🛍️
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">{t('empty.title')}</h2>
      <p className="mt-3 text-gray-600">{t('empty.description')}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button color="primary" onPress={handleContinueShopping}>
          {t('empty.action')}
        </Button>
        <Button variant="flat" onPress={() => router.push('/')}>
          {t('actions.go_home')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <section className="relative isolate -mt-8 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
          <div className="absolute bottom-0 left-24 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100 shadow-sm">
              {t('breadcrumb.checkout')}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-lg text-slate-200 sm:text-xl">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <PageBreadcrumbs
        items={[
          { label: t('breadcrumb.home'), href: '/' },
          { label: t('breadcrumb.checkout'), isCurrent: true },
        ]}
        fullWidth
      />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasCartIssues && !summary.isEmpty && (
            <div className="mb-8 space-y-3">
              {validation.errors.map((error, index) => (
                <Alert key={`error-${error.itemId ?? index}`} color="danger" variant="flat">
                  {error.message}
                </Alert>
              ))}
              {validation.warnings.map((warning, index) => (
                <Alert key={`warning-${index}`} color="warning" variant="flat">
                  {warning.message}
                </Alert>
              ))}
            </div>
          )}

          {summary.isEmpty ? (
            renderEmptyState()
          ) : (
            <CheckoutForm
              cartItems={items}
              subtotal={summary.totals.subtotal}
              shippingCost={summary.totals.shipping}
              tax={summary.totals.tax}
              total={summary.totals.total}
              onSubmit={handleCheckoutSubmit}
              loading={isSubmitting}
              currency={currencySymbol}
              savedAddresses={savedAddresses}
              countries={availableCountries}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default CheckoutPageClient;
