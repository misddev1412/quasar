'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type CookieConsentStatus = 'granted' | 'denied' | 'pending';

const CONSENT_STORAGE_KEY = 'storefront_cookie_consent';
const CONSENT_COOKIE_NAME = 'storefront_cookie_consent';
const CONSENT_EVENT_NAME = 'storefront-cookie-consent';

const DEFAULT_STATUS: CookieConsentStatus = 'pending';

function readConsentFromStorage(): CookieConsentStatus {
  if (typeof window === 'undefined') {
    return DEFAULT_STATUS;
  }

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') {
      return stored;
    }

    const cookieMatch = document.cookie.match(
      new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`)
    );
    if (cookieMatch && (cookieMatch[1] === 'granted' || cookieMatch[1] === 'denied')) {
      return cookieMatch[1] as CookieConsentStatus;
    }
  } catch {
    // Ignore storage errors, default to pending
  }

  return DEFAULT_STATUS;
}

function persistConsent(status: CookieConsentStatus) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
    const maxAge = 365 * 24 * 60 * 60; // 1 year
    document.cookie = `${CONSENT_COOKIE_NAME}=${status}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Ignore storage write errors
  }

  window.dispatchEvent(
    new CustomEvent<CookieConsentStatus>(CONSENT_EVENT_NAME, { detail: status })
  );
}

export function useCookieConsent() {
  const [status, setStatus] = useState<CookieConsentStatus>(DEFAULT_STATUS);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentStatus>;
      if (customEvent?.detail) {
        setStatus(customEvent.detail);
      }
    };

    window.addEventListener(CONSENT_EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(CONSENT_EVENT_NAME, handler as EventListener);
  }, []);

  useEffect(() => {
    if (status === DEFAULT_STATUS) {
      const stored = readConsentFromStorage();
      if (stored !== status) {
        setStatus(stored);
      }
    }
  }, [status]);

  const accept = useCallback(() => {
    persistConsent('granted');
    setStatus('granted');
  }, []);

  const decline = useCallback(() => {
    persistConsent('denied');
    setStatus('denied');
  }, []);

  return useMemo(
    () => ({
      status,
      accept,
      decline,
    }),
    [status, accept, decline]
  );
}

export function hasCookieConsent(status?: CookieConsentStatus): boolean {
  if (status) {
    return status === 'granted';
  }
  return readConsentFromStorage() === 'granted';
}
