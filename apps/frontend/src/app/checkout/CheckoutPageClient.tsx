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
import { trpc, trpcClient } from '../../utils/trpc';
import { useAuth } from '../../contexts/AuthContext';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';
import { useSettings } from '../../hooks/useSettings';
import type { Product, ProductVariant } from '../../types/product';

const normalizeCurrencyValue = (value: number | null | undefined) => {
  if (!Number.isFinite(Number(value))) {
    return 0;
  }

  const numericValue = Number(value);
  return Math.round((numericValue + Number.EPSILON) * 100) / 100;
};

const CheckoutPageClient = () => {
  const router = useRouter();
  const t = useTranslations('ecommerce.checkout');
  const { showToast } = useToast();
  const { items, summary, validation, clearCart } = useCart();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { getSetting } = useSettings();
  const { mutateAsync: placeOrder, isPending: isSubmitting } = trpc.clientOrders.create.useMutation();
  const [isPreparingOrder, setIsPreparingOrder] = useState(false);
  const defaultCheckoutCountryId = useMemo(
    () => (getSetting('storefront.checkout_default_country_id', '') || '').trim(),
    [getSetting]
  );

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

  const fetchLatestProductSnapshots = useCallback(async () => {
    const uniqueProductIds = Array.from(
      new Set(items.map((item) => item.product?.id).filter((productId): productId is string => Boolean(productId)))
    );

    if (uniqueProductIds.length === 0) {
      return new Map<string, Product>();
    }

    const productMap = new Map<string, Product>();

    await Promise.all(
      uniqueProductIds.map(async (productId) => {
        try {
          const response = await trpcClient.clientProducts.getProductById.query({ id: productId });
          const productData = (response as any)?.data?.product ?? (response as any)?.product;
          if (productData) {
            productMap.set(productId, productData as Product);
          }
        } catch (error) {
          console.error('Failed to refresh product snapshot for checkout', productId, error);
        }
      })
    );

    return productMap;
  }, [items]);

  const hasCartIssues = validation.errors.length > 0 || validation.warnings.length > 0;


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

      const selectBillingAddress = data.billingAddressSameAsShipping
        ? data.shippingAddress
        : data.billingAddress ?? data.shippingAddress;

      const formatAddress = (address: CheckoutFormData['shippingAddress']) => ({
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company || undefined,
        address1: address.address1,
        address2: address.address2 || undefined,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode || undefined,
        country: address.country,
        phone: address.phone || undefined,
      });

      const paymentType = data.paymentMethod.type;
      const isCardPayment = paymentType === 'credit_card';
      const isPayosPayment = paymentType === 'payos';
      const siteOrigin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

      const paymentMethodPayload = {
        type: paymentType,
        cardholderName: isCardPayment ? data.paymentMethod.cardholderName?.trim() || undefined : undefined,
        last4: isCardPayment && data.paymentMethod.cardNumber ? data.paymentMethod.cardNumber.slice(-4) : undefined,
        provider: isPayosPayment ? 'PAYOS' : paymentType,
        reference:
          paymentType === 'paypal'
            ? data.paymentMethod.paypalEmail || undefined
            : paymentType === 'bank_transfer'
              ? data.paymentMethod.bankAccountNumber
                ? data.paymentMethod.bankAccountNumber.slice(-4)
                : undefined
            : paymentType === 'cash_on_delivery'
              ? 'COD'
              : undefined,
        metadata: isPayosPayment
          ? {
              returnUrl: `${siteOrigin}/checkout/success`,
              cancelUrl: `${siteOrigin}/checkout?status=cancelled`,
              customerEmail: data.email,
              customerName: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`.trim(),
            }
          : undefined,
      };

      try {
        setIsPreparingOrder(true);

        const productSnapshots = await fetchLatestProductSnapshots();

        const deriveVariantAttributes = (variant?: ProductVariant | null) => {
          if (!variant || !Array.isArray(variant.variantItems) || variant.variantItems.length === 0) {
            return undefined;
          }

          const attributes: Record<string, string> = {};

          variant.variantItems?.forEach((variantItem) => {
            const key =
              variantItem.attribute?.displayName ||
              variantItem.attribute?.name ||
              variantItem.attributeId ||
              null;
            const value =
              variantItem.attributeValue?.displayValue ||
              variantItem.attributeValue?.value ||
              null;

            if (key && value) {
              attributes[String(key)] = String(value);
            }
          });

          return Object.keys(attributes).length > 0 ? attributes : undefined;
        };

        const normalizedItems = items.map((item) => {
          const latestProduct = productSnapshots.get(item.product.id);
          const latestVariant =
            item.variant?.id && latestProduct?.variants
              ? latestProduct.variants.find((variant) => variant.id === item.variant?.id)
              : undefined;

          const resolvedVariant = (latestVariant ?? item.variant) as ProductVariant | undefined;
          const resolvedProductName = latestProduct?.name ?? item.product.name ?? 'Unknown product';
          const resolvedProductSku = latestProduct?.sku ?? item.product.sku ?? resolvedVariant?.sku ?? undefined;
          const resolvedVariantName = resolvedVariant?.name ?? item.variant?.name ?? undefined;
          const resolvedVariantSku = resolvedVariant?.sku ?? item.variant?.sku ?? undefined;
          const resolvedImage =
            resolvedVariant?.image ??
            latestProduct?.primaryImage ??
            latestProduct?.imageUrls?.[0] ??
            item.variant?.image ??
            (Array.isArray(item.product.images) ? item.product.images[0] : undefined) ??
            undefined;

          const unitPriceCandidate = resolvedVariant?.price ?? latestProduct?.price ?? item.unitPrice;
          const resolvedUnitPrice = Number.isFinite(Number(unitPriceCandidate))
            ? Number(unitPriceCandidate)
            : item.unitPrice;

          const productAttributes = deriveVariantAttributes(resolvedVariant);

          return {
            productId: item.product.id,
            productVariantId: item.variant?.id,
            quantity: item.quantity,
            unitPrice: resolvedUnitPrice,
            productName: resolvedProductName,
            productSku: resolvedProductSku,
            variantName: resolvedVariantName,
            variantSku: resolvedVariantSku,
            productImage: resolvedImage,
            productAttributes: productAttributes ?? undefined,
          };
        });

        const payload = {
          email: data.email,
          shippingAddress: formatAddress(data.shippingAddress),
          billingAddress: formatAddress(selectBillingAddress),
          shippingMethodId: data.shippingMethod || undefined,
          paymentMethod: paymentMethodPayload,
          orderNotes: data.orderNotes?.trim() || undefined,
          agreeToMarketing: data.agreeToMarketing,
          items: normalizedItems,
          totals: {
            subtotal: normalizeCurrencyValue(summary.totals.subtotal),
            taxAmount: normalizeCurrencyValue(summary.totals.tax),
            shippingCost: normalizeCurrencyValue(summary.totals.shipping),
            discountAmount: normalizeCurrencyValue(summary.totals.discount),
            totalAmount: normalizeCurrencyValue(summary.totals.total),
            currency: summary.totals.currency,
          },
        };

        const response = await placeOrder(payload);
        const responseData = (response as any)?.data ?? response;
        const orderData = responseData?.order ?? responseData;

        const orderNumber = orderData?.orderNumber ?? orderData?.order_number;
        const orderId = orderData?.id ?? orderData?.orderId ?? orderData?.order_id;
        const queryParams = new URLSearchParams();

        if (orderId) {
          queryParams.set('orderId', String(orderId));
        }
        if (orderNumber) {
          queryParams.set('orderNumber', String(orderNumber));
        }
        if (data.email) {
          queryParams.set('email', data.email.trim());
        }
        const rawTotal = orderData?.totalAmount;
        const totalAmountCandidate = Number.isFinite(Number(rawTotal)) ? Number(rawTotal) : summary.totals.total;
        const totalAmount = normalizeCurrencyValue(totalAmountCandidate);
        const currency = orderData?.currency ?? summary.totals.currency;

        if (Number.isFinite(totalAmount)) {
          queryParams.set('total', String(totalAmount));
        }
        if (currency) {
          queryParams.set('currency', currency);
        }

        const paymentInstruction = responseData?.payment;
        if (paymentInstruction?.provider === 'PAYOS' && paymentInstruction.checkoutUrl) {
          showToast({
            type: 'info',
            title: t('toast.redirect.title'),
            message: t('toast.redirect.message'),
          });
          await clearCart();
          window.location.href = paymentInstruction.checkoutUrl;
          return;
        }

        showToast({
          type: 'success',
          title: t('toast.success.title'),
          message: orderNumber
            ? `${t('toast.success.message')} (#${orderNumber})`
            : t('toast.success.message'),
        });

        await clearCart();
        const successPath = queryParams.toString()
          ? `/checkout/success?${queryParams.toString()}`
          : '/checkout/success';
        router.push(successPath);
      } catch (error) {
        console.error('Checkout submission failed', error);
        showToast({
          type: 'error',
          title: t('toast.error.title'),
          message: t('toast.error.message'),
        });
      } finally {
        setIsPreparingOrder(false);
      }
    },
    [
      fetchLatestProductSnapshots,
      clearCart,
      placeOrder,
      items,
      router,
      showToast,
      summary.isEmpty,
      summary.totals.currency,
      summary.totals.discount,
      summary.totals.shipping,
      summary.totals.subtotal,
      summary.totals.tax,
      summary.totals.total,
      t,
      validation.errors.length,
    ]
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
              loading={isSubmitting || isPreparingOrder}
              currency={summary.totals.currency}
              savedAddresses={savedAddresses}
              countries={availableCountries}
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              userEmail={user?.email}
              userName={user?.name}
              defaultCountryId={defaultCheckoutCountryId}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default CheckoutPageClient;
