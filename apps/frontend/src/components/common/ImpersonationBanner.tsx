'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { trpc, removeAuthToken, removeRefreshToken } from '../../utils/trpc';
import type { TrpcApiResponse } from '@shared/types/api-response.types';
import { useToast } from '../../contexts/ToastContext';

type ImpersonationUser = {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
};

type ImpersonationLog = {
  id?: string;
  startedAt?: string | Date;
  adminUser?: ImpersonationUser;
  impersonatedUser?: ImpersonationUser;
};

type ImpersonationStatusResponse = TrpcApiResponse<{
  isImpersonating: boolean;
  impersonationLog: ImpersonationLog | null;
}>;

const getDisplayName = (
  user?: ImpersonationUser,
  fallback: string = '—'
): string => {
  if (!user) return fallback;
  const profileName = [
    user?.profile?.firstName || user?.firstName,
    user?.profile?.lastName || user?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (profileName) return profileName;
  if (user.username) return user.username;
  if (user.email) return user.email;
  return fallback;
};

const ImpersonationBanner: React.FC = () => {
  const t = useTranslations('impersonation');
  const { showToast } = useToast();

  const statusQuery = trpc.adminImpersonation.getCurrentImpersonationStatus.useQuery(undefined, {
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const endMutation = trpc.adminImpersonation.endImpersonation.useMutation();

  const statusData = statusQuery.data as ImpersonationStatusResponse | undefined;
  const impersonationLog = statusData?.data?.impersonationLog;
  const isImpersonating = Boolean(statusData?.data?.isImpersonating && impersonationLog);

  const startedLabel = useMemo(() => {
    if (!impersonationLog?.startedAt) return '';
    try {
      const startedDate = new Date(impersonationLog.startedAt);
      return formatDistanceToNow(startedDate, { addSuffix: true });
    } catch (error) {
      return '';
    }
  }, [impersonationLog?.startedAt]);

  const handleExit = async () => {
    try {
      await endMutation.mutateAsync({
        originalAdminAccessToken: '',
        originalAdminRefreshToken: '',
      });

      removeAuthToken();
      removeRefreshToken();

      showToast({
        type: 'success',
        title: t('exit_success_title'),
        description: t('exit_success_message'),
      });

      statusQuery.refetch();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('exit_error_title'),
        description: error?.message || t('exit_error_message'),
      });
    }
  };

  if (!isImpersonating) {
    return null;
  }

  const impersonatedName = getDisplayName(impersonationLog?.impersonatedUser, t('unknown_user'));
  const adminName = getDisplayName(impersonationLog?.adminUser, t('unknown_admin'));

  return (
    <div className="w-full bg-amber-500 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold">
            {t('active_banner_title', { user: impersonatedName })}
          </p>
          <p className="opacity-90">
            {t('active_banner_description', { admin: adminName })}
          </p>
          {startedLabel && (
            <p className="text-xs opacity-80">
              {t('active_since', { duration: startedLabel })}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={handleExit}
            disabled={endMutation.isLoading}
            className="flex items-center justify-center rounded-md bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {endMutation.isLoading ? t('exiting') : t('exit_button')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.close();
              }
            }}
            className="flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t('close_window')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
