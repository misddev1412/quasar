import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getEnvApiBaseUrl, normalizeApiBase } from './utils/apiBase';
import type { MaintenanceStatus } from './types/maintenance';

export {};

const MAINTENANCE_COOKIE = 'maintenance_token';
const CACHE_TTL_MS = Number(process.env.MAINTENANCE_STATUS_TTL_MS || 5000);

type StatusCacheEntry = {
  status: MaintenanceStatus | null;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __maintenanceGlobals?: {
    statusCache: Map<string, StatusCacheEntry>;
  };
}

const maintenanceStatusCache =
  globalThis.__maintenanceGlobals?.statusCache ?? new Map<string, StatusCacheEntry>();

if (!globalThis.__maintenanceGlobals) {
  globalThis.__maintenanceGlobals = {
    statusCache: maintenanceStatusCache,
  };
}

export async function middleware(request: NextRequest) {
  if (shouldBypass(request)) {
    return NextResponse.next();
  }

  const baseUrl = resolveMaintenanceApiBaseUrl(request);
  const status = await getMaintenanceStatus(baseUrl);

  if (!status) {
    return redirectToMaintenance(request);
  }

  if (!status.enabled) {
    return NextResponse.next();
  }

  const token = request.cookies.get(MAINTENANCE_COOKIE)?.value;
  const hasAccess = await verifyMaintenanceToken(baseUrl, token);

  if (hasAccess) {
    return NextResponse.next();
  }

  return redirectToMaintenance(request);
}

function shouldBypass(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/maintenance')) {
    return true;
  }

  return false;
}

async function getMaintenanceStatus(apiOrigin: string): Promise<MaintenanceStatus | null> {
  const cacheKey = apiOrigin;
  const cached = maintenanceStatusCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.status;
  }

  try {
    const response = await fetch(`${apiOrigin}/maintenance/status`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to load maintenance status. Response:', response.status, response.statusText);
      maintenanceStatusCache.set(cacheKey, {
        status: null,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return null;
    }

    const data = (await response.json()) as MaintenanceStatus;
    maintenanceStatusCache.set(cacheKey, {
      status: data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch maintenance status', error);
    maintenanceStatusCache.set(cacheKey, {
      status: null,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return null;
  }
}

async function verifyMaintenanceToken(apiOrigin: string, token?: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${apiOrigin}/maintenance/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to validate maintenance token. Response:', response.status, response.statusText);
      return false;
    }

    const data = (await response.json()) as { valid?: boolean };
    return Boolean(data?.valid);
  } catch (error) {
    console.error('Failed to validate maintenance token', error);
    return false;
  }
}

function resolveMaintenanceApiBaseUrl(request: NextRequest): string {
  const override = process.env.MAINTENANCE_API_BASE_URL;
  if (override && override.trim().length > 0) {
    return normalizeApiBase(override);
  }

  const envValue = getEnvApiBaseUrl();
  if (envValue) {
    return envValue;
  }

  return normalizeApiBase(request.nextUrl.origin);
}

function redirectToMaintenance(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/maintenance';

  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.searchParams.set('redirect', currentPath);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
