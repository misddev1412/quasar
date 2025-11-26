'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trpc } from '../utils/trpc';
import { useCookieConsent } from './useCookieConsent';

const FINGERPRINT_STORAGE_KEY = 'storefront_visitor_fingerprint';
const SESSION_STORAGE_KEY = 'storefront_visitor_session_id';
const SESSION_EXPIRY_KEY = 'storefront_visitor_session_expiry';
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

const trpcAny = trpc as any;

export function useVisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedSearch = searchParams?.toString() ?? '';
  const trackVisitorMutation =
    trpcAny?.clientVisitorStats?.trackStorefrontVisitor?.useMutation?.();
  const trackStorefrontVisitor = trackVisitorMutation?.mutate;
  const { status: cookieConsentStatus } = useCookieConsent();

  useEffect(() => {
    if (
      !trackStorefrontVisitor ||
      typeof window === 'undefined' ||
      cookieConsentStatus !== 'granted'
    ) {
      return;
    }

    const fingerprint = getOrCreateFingerprint();
    if (!fingerprint) {
      return;
    }

    const session = getOrCreateSession();
    const pageUrl = `${window.location.pathname}${window.location.search}`;

    trackStorefrontVisitor(
      {
        fingerprint,
        sessionId: session.sessionId,
        pageUrl,
        pageTitle: document?.title || undefined,
        referrer: document?.referrer || undefined,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        language: navigator?.language,
        timezoneOffset: new Date().getTimezoneOffset(),
      },
      {
        onSuccess: (response: any) => {
          const result = response?.data || response;
          if (result?.sessionId) {
            persistSession(result.sessionId);
          } else {
            refreshSessionExpiry();
          }
        },
      }
    );
  }, [pathname, serializedSearch, trackStorefrontVisitor, cookieConsentStatus]);
}

function getOrCreateFingerprint(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const existing = window.localStorage.getItem(FINGERPRINT_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const fingerprint = generateFingerprint();
    window.localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
    return fingerprint;
  } catch {
    return null;
  }
}

function generateFingerprint(): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now()}`;

  if (typeof window === 'undefined') {
    return `fp_${randomPart}`;
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    window.screen?.width,
    window.screen?.height,
    window.screen?.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  ].join('|');

  const hash = simpleHash(components);
  return `fp_${hash}_${randomPart}`;
}

function simpleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function getOrCreateSession(): { sessionId: string; expiresAt: number } {
  if (typeof window === 'undefined') {
    return { sessionId: generateSessionId(), expiresAt: Date.now() + SESSION_TTL };
  }

  try {
    const storedSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const storedExpiryRaw = window.localStorage.getItem(SESSION_EXPIRY_KEY);
    const storedExpiry = storedExpiryRaw ? parseInt(storedExpiryRaw, 10) : 0;

    if (storedSessionId && storedExpiry > Date.now()) {
      return { sessionId: storedSessionId, expiresAt: storedExpiry };
    }
  } catch {
    // Ignore storage errors
  }

  return persistSession(generateSessionId());
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess_${Math.random().toString(36).slice(2)}${Date.now()}`;
}

function persistSession(sessionId: string): { sessionId: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_TTL;

  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      window.localStorage.setItem(SESSION_EXPIRY_KEY, String(expiresAt));
    }
  } catch {
    // Ignore persistence failures
  }

  return { sessionId, expiresAt };
}

function refreshSessionExpiry() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const sessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionId) {
      persistSession(sessionId);
    }
  } catch {
    // Ignore storage errors
  }
}
