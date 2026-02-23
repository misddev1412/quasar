import React, { useMemo, useState } from 'react';
import { StandardListPage, Button, Input, Loading, Alert, AlertDescription, AlertTitle } from '@admin/components/common';
import { trpc, trpcClient } from '@admin/utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { getApiOrigin } from '@admin/utils/apiConfig';

type Strategy = 'mobile' | 'desktop';

type PageSpeedCategoryKey = 'performance' | 'accessibility' | 'best-practices' | 'seo';

type PageSpeedRunResult = {
  path: string;
  fullUrl: string;
  success: boolean;
  scores?: Record<PageSpeedCategoryKey, number | null>;
  raw?: unknown;
  error?: string;
};

const DEFAULT_PATHS = ['/', '/news', '/blog', '/products', '/services'];

const normalizeOrigin = (value: string): string => value.trim().replace(/\/+$/, '');

const guessSiteOrigin = (): string => {
  const fromEnv = process.env.REACT_APP_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    return normalizeOrigin(fromEnv);
  }

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes(':4000')) {
      return currentOrigin.replace(':4000', ':3001');
    }
    return normalizeOrigin(currentOrigin);
  }

  const apiOrigin = getApiOrigin();
  if (apiOrigin.includes(':3000')) {
    return apiOrigin.replace(':3000', ':3001');
  }

  return apiOrigin;
};

const extractScores = (payload: any): Record<PageSpeedCategoryKey, number | null> => {
  const categories = payload?.lighthouseResult?.categories || {};

  const mapScore = (key: PageSpeedCategoryKey): number | null => {
    const raw = categories?.[key]?.score;
    if (typeof raw !== 'number') {
      return null;
    }
    return Math.round(raw * 100);
  };

  return {
    performance: mapScore('performance'),
    accessibility: mapScore('accessibility'),
    'best-practices': mapScore('best-practices'),
    seo: mapScore('seo'),
  };
};

const PageSpeedPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [apiKey, setApiKey] = useState('');
  const [siteOrigin, setSiteOrigin] = useState(() => guessSiteOrigin());
  const [detailPath, setDetailPath] = useState('/blog/sample-post');
  const [strategy, setStrategy] = useState<Strategy>('mobile');
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<PageSpeedRunResult[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>(DEFAULT_PATHS);

  const pageSpeedApi = (trpc as any).adminPageSpeed;

  const configQuery = pageSpeedApi.getConfig.useQuery(undefined);

  const updateConfigMutation = pageSpeedApi.updateConfig.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('common.success', 'Success'),
        description: t('pagespeed.config_saved', 'PageSpeed API key saved successfully'),
      });
      configQuery.refetch();
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error?.message || t('pagespeed.save_failed', 'Failed to save PageSpeed API key'),
      });
    },
  });

  const allPaths = useMemo(() => {
    const merged = [...selectedPaths];
    const trimmedDetail = detailPath.trim();
    if (trimmedDetail) {
      merged.push(trimmedDetail.startsWith('/') ? trimmedDetail : `/${trimmedDetail}`);
    }

    return Array.from(new Set(merged));
  }, [selectedPaths, detailPath]);

  const togglePath = (path: string) => {
    setSelectedPaths((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]));
  };

  const runBatch = async () => {
    const origin = normalizeOrigin(siteOrigin);
    if (!origin) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: 'Site origin is required',
      });
      return;
    }

    setIsRunningBatch(true);
    setBatchResults([]);

    const nextResults: PageSpeedRunResult[] = [];

    for (const path of allPaths) {
      const fixedPath = path.startsWith('/') ? path : `/${path}`;
      const fullUrl = `${origin}${fixedPath}`;

      try {
        const response = await (trpcClient as any).adminPageSpeed.runInsights.query({
          url: fullUrl,
          strategy,
          categories: ['performance', 'accessibility', 'best-practices', 'seo'],
        });

        const payload = response?.data || null;

        nextResults.push({
          path: fixedPath,
          fullUrl,
          success: true,
          scores: extractScores(payload),
          raw: payload,
        });
      } catch (error: any) {
        nextResults.push({
          path: fixedPath,
          fullUrl,
          success: false,
          error: error?.message || 'Run failed',
        });
      }
    }

    setBatchResults(nextResults);
    setIsRunningBatch(false);

    const failedCount = nextResults.filter((r) => !r.success).length;
    if (failedCount > 0) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: `${failedCount}/${nextResults.length} paths failed`,
      });
    } else {
      addToast({
        type: 'success',
        title: t('common.success', 'Success'),
        description: `Checked ${nextResults.length} paths successfully`,
      });
    }
  };

  const isLoading = configQuery.isLoading;
  const isSaving = updateConfigMutation.isPending;

  if (isLoading) {
    return (
      <StandardListPage
        title={t('pagespeed.title', 'Google PageSpeed')}
        description={t('pagespeed.description', 'Run PageSpeed for current website pages')}
      >
        <Loading />
      </StandardListPage>
    );
  }

  if (configQuery.error) {
    return (
      <StandardListPage
        title={t('pagespeed.title', 'Google PageSpeed')}
        description={t('pagespeed.description', 'Run PageSpeed for current website pages')}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(configQuery.error as any)?.message || 'Failed to load PageSpeed configuration'}</AlertDescription>
        </Alert>
      </StandardListPage>
    );
  }

  const hasApiKey = !!(configQuery.data as any)?.data?.hasApiKey;

  return (
    <StandardListPage
      title={t('pagespeed.title', 'Google PageSpeed')}
      description={t('pagespeed.description', 'Run PageSpeed for current website pages')}
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <h3 className="text-sm font-semibold">{t('pagespeed.api_key', 'API Key')}</h3>
          <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza..." />
          <p className="text-xs text-gray-500">{hasApiKey ? 'API key is configured in system settings.' : 'API key is not configured yet.'}</p>
          <div className="flex justify-end">
            <Button onClick={() => updateConfigMutation.mutate({ apiKey })} disabled={isSaving}>
              {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
          <h3 className="text-sm font-semibold">Run Test For Current Website</h3>
          <Input value={siteOrigin} onChange={(e) => setSiteOrigin(e.target.value)} placeholder="http://localhost:3001" />

          <div className="flex flex-wrap gap-2">
            {DEFAULT_PATHS.map((path) => (
              <Button
                key={path}
                variant={selectedPaths.includes(path) ? 'primary' : 'outline'}
                onClick={() => togglePath(path)}
              >
                {path}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-500">Detail path (news/blog/product):</label>
            <Input value={detailPath} onChange={(e) => setDetailPath(e.target.value)} placeholder="/blog/my-post-slug" />
          </div>

          <div className="flex items-center gap-3">
            <Button variant={strategy === 'mobile' ? 'primary' : 'outline'} onClick={() => setStrategy('mobile')}>
              Mobile
            </Button>
            <Button variant={strategy === 'desktop' ? 'primary' : 'outline'} onClick={() => setStrategy('desktop')}>
              Desktop
            </Button>
            <Button onClick={runBatch} disabled={isRunningBatch}>
              {isRunningBatch ? 'Running...' : 'Run Current Site'}
            </Button>
          </div>
        </div>

        {batchResults.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Results</h3>
            <div className="space-y-3">
              {batchResults.map((item) => (
                <div key={item.fullUrl} className="border rounded-lg p-3 border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium">{item.path}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.fullUrl}</div>
                  {!item.success && <div className="text-sm text-red-600">{item.error}</div>}
                  {item.success && item.scores && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>Performance: <strong>{item.scores.performance ?? '-'}</strong></div>
                      <div>Accessibility: <strong>{item.scores.accessibility ?? '-'}</strong></div>
                      <div>Best Practices: <strong>{item.scores['best-practices'] ?? '-'}</strong></div>
                      <div>SEO: <strong>{item.scores.seo ?? '-'}</strong></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StandardListPage>
  );
};

export default PageSpeedPage;
