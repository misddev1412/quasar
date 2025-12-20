import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiBaseUrl } from './src/utils/apiBase';
import type { MaintenanceStatus } from './src/types/maintenance';

const MAINTENANCE_COOKIE = 'maintenance_token';
const CACHE_TTL_MS = 30_000;

declare global {
  // eslint-disable-next-line no-var
  var __maintenanceStatusCache?: {
    status: MaintenanceStatus | null;
    expiresAt: number;
  };
}

export async function middleware(request: NextRequest) {
  if (shouldBypass(request)) {
    return NextResponse.next();
  }

  const status = await getMaintenanceStatus();

  if (!status?.enabled) {
    return NextResponse.next();
  }

  const token = request.cookies.get(MAINTENANCE_COOKIE)?.value;
  const hasAccess = await verifyMaintenanceToken(token);

  if (hasAccess) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/maintenance';

  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.searchParams.set('redirect', currentPath);

  return NextResponse.redirect(redirectUrl);
}

function shouldBypass(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/maintenance')) {
    return true;
  }

  return false;
}

async function getMaintenanceStatus(): Promise<MaintenanceStatus | null> {
  const cached = globalThis.__maintenanceStatusCache;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.status;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/maintenance/status`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MaintenanceStatus;
    globalThis.__maintenanceStatusCache = {
      status: data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    return data;
  } catch (error) {
    console.error('Failed to fetch maintenance status', error);
    return null;
  }
}

async function verifyMaintenanceToken(token?: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [nonce, expiresAt, signature] = token.split('.');
  if (!nonce || !expiresAt || !signature) {
    return false;
  }

  const expiresAtMs = Number(expiresAt);
  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    return false;
  }

  const payload = `${nonce}.${expiresAt}`;
  const computedSignature = await createHmac(payload, getTokenSecret());

  return timingSafeEqual(signature, computedSignature);
}

function getTokenSecret(): string {
  return process.env.MAINTENANCE_TOKEN_SECRET || process.env.NEXT_PUBLIC_MAINTENANCE_TOKEN_SECRET || 'quasar-maintenance-secret';
}

async function createHmac(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return bufferToHex(signature);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
