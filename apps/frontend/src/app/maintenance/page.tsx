import { redirect } from 'next/navigation';
import { MaintenancePageClient } from './MaintenancePageClient';
import { buildApiUrl } from '../../utils/apiBase';
import type { MaintenanceStatus } from '../../types/maintenance';

async function fetchMaintenanceStatus(): Promise<MaintenanceStatus | null> {
  try {
    const response = await fetch(buildApiUrl('/maintenance/status'), {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to load maintenance status', error);
    return null;
  }
}

interface MaintenancePageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const status = await fetchMaintenanceStatus();

  if (!status?.enabled) {
    redirect('/');
  }

  const rawRedirect = typeof searchParams?.redirect === 'string' ? searchParams.redirect : '/';
  const safeRedirect = normalizeRedirect(rawRedirect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-12">
      <MaintenancePageClient status={status} redirectTo={safeRedirect} />
    </div>
  );
}

function normalizeRedirect(target?: string): string {
  if (!target || !target.startsWith('/')) {
    return '/';
  }

  return target;
}
