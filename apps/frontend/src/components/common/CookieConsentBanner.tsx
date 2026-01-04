'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../../hooks/useCookieConsent';

export function CookieConsentBanner() {
  const { status, accept, decline } = useCookieConsent();
  const { t } = useTranslation();

  if (status !== 'pending') {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center sm:bottom-10">
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white/95 px-6 py-4 text-sm shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-700 dark:text-gray-300 mb-0">
            {t('common.cookie_consent.text')}{' '}
            <Link href="/cookies" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              {t('common.cookie_consent.learn_more')}
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={decline}
              className="whitespace-nowrap rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {t('common.cookie_consent.decline')}
            </button>
            <button
              type="button"
              onClick={accept}
              className="whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              {t('common.cookie_consent.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
