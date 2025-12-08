'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { Progress, Tooltip } from '@heroui/react';
import { Crown, Medal, Star, ChevronRight } from 'lucide-react';
import Container from '../common/Container';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from 'next-intl';

interface LoyaltyBalance {
  currentPoints: number;
  lifetimePoints: number;
  tier: string;
  nextTier?: string | null;
  pointsToNextTier?: number | null;
}

type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum';

const tierBoundaries: Record<TierKey, { start: number; end?: number }> = {
  bronze: { start: 0, end: 200 },
  silver: { start: 200, end: 500 },
  gold: { start: 500, end: 1000 },
  platinum: { start: 1000 },
};

const tierVisuals: Record<
  TierKey,
  {
    icon: ComponentType<{ className?: string }>;
    accent: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  bronze: {
    icon: Medal,
    accent: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100/80 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-200',
  },
  silver: {
    icon: Star,
    accent: 'text-gray-600 dark:text-gray-200',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500 dark:text-gray-200',
  },
  gold: {
    icon: Star,
    accent: 'text-yellow-600 dark:text-yellow-300',
    iconBg: 'bg-yellow-100 dark:bg-yellow-500/10',
    iconColor: 'text-yellow-600 dark:text-yellow-300',
  },
  platinum: {
    icon: Crown,
    accent: 'text-purple-600 dark:text-purple-300',
    iconBg: 'bg-purple-100 dark:bg-purple-500/10',
    iconColor: 'text-purple-600 dark:text-purple-300',
  },
};

const normalizeTier = (tier?: string): TierKey => {
  switch ((tier || '').toLowerCase()) {
    case 'silver':
      return 'silver';
    case 'gold':
      return 'gold';
    case 'platinum':
      return 'platinum';
    default:
      return 'bronze';
  }
};

const formatPoints = (value?: number | null) => {
  if (typeof value !== 'number') {
    return '0';
  }
  return value.toLocaleString();
};

export const LoyaltyTierBanner = () => {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('loyalty');
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setBalance(null);
      setHasError(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchLoyaltyBalance = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch('/api/trpc/clientUser.getLoyaltyBalance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch loyalty balance');
        }

        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        setBalance(payload?.result?.data ?? null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Unable to load loyalty balance', error);
        if (isMounted) {
          setHasError(true);
          setBalance(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLoyaltyBalance();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAuthenticated]);

  const progress = useMemo(() => {
    if (!balance) {
      return 0;
    }

    const tierKey = normalizeTier(balance.tier);
    const boundary = tierBoundaries[tierKey];

    if (!boundary.end) {
      return 100;
    }

    const tierRange = boundary.end - boundary.start;
    if (tierRange <= 0) {
      return 0;
    }

    const relativeProgress = ((balance.currentPoints - boundary.start) / tierRange) * 100;
    return Math.min(100, Math.max(0, relativeProgress));
  }, [balance]);

  if (!isAuthenticated || hasError) {
    return null;
  }

  const tierKey = normalizeTier(balance?.tier);
  const visuals = tierVisuals[tierKey];
  const TierIcon = visuals.icon;
  const showNextTier = Boolean(balance?.nextTier && balance?.pointsToNextTier != null);

  if (isLoading && !balance) {
    return (
      <div className="bg-white/70 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800">
        <Container className="py-4">
          <div className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </Container>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="bg-white/70 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800">
      <Container className="py-4">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 shadow-md dark:shadow-none md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl p-3 ${visuals.iconBg}`}>
              <TierIcon className={`h-6 w-6 ${visuals.iconColor}`} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500">
                Loyalty tier
              </p>
              <p className={`text-xl font-semibold ${visuals.accent}`}>
                {balance.tier}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatPoints(balance.currentPoints)} pts · Lifetime {formatPoints(balance.lifetimePoints)} pts
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {showNextTier
                  ? t('banner.progress_to_tier', { tier: balance.nextTier })
                  : t('banner.progress_top_tier')}
              </span>
              <span>
                {showNextTier
                  ? t('banner.points_to_go', { points: formatPoints(balance.pointsToNextTier) })
                  : t('banner.current_points', { points: formatPoints(balance.currentPoints) })}
              </span>
            </div>
            <Tooltip
              content={
                showNextTier
                  ? t('banner.tooltip_next_tier', {
                      tier: balance.nextTier,
                      points: formatPoints(balance.pointsToNextTier),
                    })
                  : t('banner.tooltip_top_tier')}
              }
              placement="top"
              delay={250}
            >
              <Progress
                value={showNextTier ? progress : 100}
                className="h-2"
                classNames={{
                  indicator: 'bg-gradient-to-r from-amber-500 to-orange-500',
                }}
                aria-label={t('banner.progress_aria')}
                color="warning"
              />
            </Tooltip>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {showNextTier ? (
                t('banner.keep_shopping', { tier: balance.nextTier })
              ) : (
                t('banner.top_tier')
              )}
            </div>
            <Link
              href="/profile/loyalty"
              className="inline-flex items-center rounded-full border border-amber-400/60 bg-white/80 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-white dark:bg-gray-900 dark:text-amber-300"
            >
              {t('banner.view_rewards')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LoyaltyTierBanner;
