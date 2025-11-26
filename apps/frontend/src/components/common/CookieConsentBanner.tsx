'use client';

import Link from 'next/link';
import { useCookieConsent } from '../../hooks/useCookieConsent';

export function CookieConsentBanner() {
  const { status, accept, decline } = useCookieConsent();

  if (status !== 'pending') {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center sm:bottom-10">
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white/95 px-6 py-4 text-sm shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-700 dark:text-gray-300">
            Cookie giúp Quasar nâng cao trải nghiệm.{' '}
            <Link href="/cookies" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Tìm hiểu thêm
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={decline}
              className="whitespace-nowrap rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Từ chối
            </button>
            <button
              type="button"
              onClick={accept}
              className="whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
