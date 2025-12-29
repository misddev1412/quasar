import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Select } from '../../../common/Select';
import { Button } from '../../../common/Button';
import { TextArea } from '../common';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';
import { trpc } from '../../../../utils/trpc';
import {
    SECTION_STATS_METRICS,
    getSectionMetricDefinition,
    SectionMetricDefinition,
} from '@shared/constants/section-stats.metrics';

type StatSourceType = 'manual' | 'metric';

interface StatConfigEntry {
    id?: string;
    label?: string;
    value?: number;
    prefix?: string;
    suffix?: string;
    description?: string;
    sourceType?: StatSourceType;
    metricId?: string;
}

interface StatsEditorProps {
    value: Record<string, any>;
    onChange: ConfigChangeHandler;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `stat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const formatMetricPreview = (definition: SectionMetricDefinition | undefined, value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '—';
    }

    if (definition?.format === 'percentage') {
        return `${value.toFixed(2)}%`;
    }

    if (definition?.format === 'currency') {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

export const StatsEditor: React.FC<StatsEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const { data: orderStatsResponse } = trpc.adminOrders.stats.useQuery(undefined, {
        staleTime: 30_000,
    });
    const { data: customerStatsResponse } = trpc.adminCustomers.stats.useQuery(undefined, {
        staleTime: 30_000,
    });

    const handleLayoutChange = (layout: 'grid' | 'counter') => {
        onChange({
            ...(value ?? {}),
            layout,
        });
    };

    const handleColumnsChange = (columns: number) => {
        onChange({
            ...(value ?? {}),
            columns,
        });
    };

    const stats = Array.isArray(value?.stats) ? (value?.stats as StatConfigEntry[]) : [];

    const updateStats = (nextStats: StatConfigEntry[]) => {
        onChange({
            ...(value ?? {}),
            stats: nextStats,
        });
    };

    const handleStatUpdate = (index: number, partial: Partial<StatConfigEntry>) => {
        const nextStats = stats.map((stat, idx) => (idx === index ? { ...stat, ...partial } : stat));
        updateStats(nextStats);
    };

    const handleSourceTypeChange = (index: number, sourceType: StatSourceType) => {
        const nextStat: Partial<StatConfigEntry> = { sourceType };
        if (sourceType === 'metric') {
            nextStat.metricId = '';
            nextStat.value = undefined;
        }
        updateStats(
            stats.map((stat, idx) =>
                idx === index
                    ? {
                        ...stat,
                        ...nextStat,
                    }
                    : stat,
            ),
        );
    };

    const handleMetricChange = (index: number, metricId: string) => {
        const definition = getSectionMetricDefinition(metricId);
        const nextLabel = stats[index]?.label;
        handleStatUpdate(index, {
            metricId,
            label: nextLabel && nextLabel.trim().length > 0
                ? nextLabel
                : definition
                    ? t(`sections.manager.config.stats.metrics.${definition.i18nKey}.label`, definition.i18nKey)
                    : nextLabel,
        });
    };

    const handleAddStat = () => {
        updateStats([
            ...stats,
            {
                id: generateId(),
                sourceType: 'manual',
                value: 0,
            },
        ]);
    };

    const handleRemoveStat = (index: number) => {
        updateStats(stats.filter((_, idx) => idx !== index));
    };

    const currentLayout = (value?.layout as string) || 'grid';
    const currentColumns = ensureNumber(value?.columns, 4);

    const orderStats = (orderStatsResponse as any)?.data ?? null;
    const customerStats = (customerStatsResponse as any)?.data ?? null;

    const metricPreview = useMemo(() => {
        const context = { orders: orderStats, customers: customerStats };
        return SECTION_STATS_METRICS.reduce<Record<string, number>>((acc, definition) => {
            const resolved = definition.resolver(context);
            if (typeof resolved === 'number' && !Number.isNaN(resolved)) {
                acc[definition.id] = resolved;
            }
            return acc;
        }, {});
    }, [orderStats, customerStats]);

    const metricOptions = SECTION_STATS_METRICS.map((definition) => ({
        value: definition.id,
        label: t(`sections.manager.config.stats.metrics.${definition.i18nKey}.label`, definition.i18nKey),
        description: t(`sections.manager.config.stats.metrics.${definition.i18nKey}.description`, ''),
    }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.stats.layoutStyle')}
                    <Select
                        value={currentLayout}
                        onChange={(layout) => handleLayoutChange(layout as 'grid' | 'counter')}
                        options={[
                            { value: 'grid', label: t('sections.manager.config.stats.gridLayout') },
                            { value: 'counter', label: t('sections.manager.config.stats.animatedCounter') },
                        ]}
                        className="text-sm"
                    />
                </label>

                {currentLayout === 'grid' && (
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        {t('sections.manager.config.stats.numberOfColumns')}
                        <Input
                            type="number"
                            min={1}
                            max={6}
                            value={currentColumns}
                            onChange={(e) => handleColumnsChange(Number(e.target.value))}
                            className="text-sm"
                            inputSize="md"
                        />
                        <span className="text-xs text-gray-500">{t('sections.manager.config.stats.columnsDescription')}</span>
                    </label>
                )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
                <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('sections.manager.config.stats.contentHeading')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {t('sections.manager.config.stats.contentDescription')}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddStat}>
                        {t('sections.manager.config.stats.addStat')}
                    </Button>
                </div>

                <div className="space-y-4 p-4">
                    {stats.length === 0 && (
                        <p className="text-sm text-gray-500">{t('sections.manager.config.stats.noStats')}</p>
                    )}

                    {stats.map((stat, index) => {
                        const sourceType: StatSourceType = (stat.sourceType as StatSourceType) || 'manual';
                        const definition = stat.metricId ? getSectionMetricDefinition(stat.metricId) : undefined;
                        const previewValue = stat.metricId ? metricPreview[stat.metricId] : undefined;

                        return (
                            <div key={stat.id || `${index}-${stat.label || 'stat'}`} className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                        {t('sections.manager.config.stats.statLabel', { index: index + 1 })}
                                    </p>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveStat(index)}>
                                        {t('sections.manager.config.stats.removeStat')}
                                    </Button>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.stats.sourceType')}
                                        <Select
                                            value={sourceType}
                                            onChange={(nextSource) => handleSourceTypeChange(index, nextSource as StatSourceType)}
                                            options={[
                                                { value: 'manual', label: t('sections.manager.config.stats.sourceManual') },
                                                { value: 'metric', label: t('sections.manager.config.stats.sourceMetric') },
                                            ]}
                                        />
                                    </label>

                                    {sourceType === 'metric' ? (
                                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                                            {t('sections.manager.config.stats.selectMetric')}
                                            <Select
                                                value={stat.metricId || ''}
                                                onChange={(metricId) => handleMetricChange(index, metricId)}
                                                options={metricOptions}
                                                placeholder={t('sections.manager.config.stats.metricPlaceholder')}
                                            />
                                            {definition && (
                                                <span className="text-xs text-gray-500">
                                                    {definition
                                                        ? t('sections.manager.config.stats.metricDescription', {
                                                            description: t(
                                                                `sections.manager.config.stats.metrics.${definition.i18nKey}.description`,
                                                                '',
                                                            ),
                                                        })
                                                        : null}
                                                </span>
                                            )}
                                            {definition && (
                                                <span className="text-xs text-gray-500">
                                                    {t('sections.manager.config.stats.metricPreviewLabel', {
                                                        value: formatMetricPreview(definition, previewValue),
                                                    })}
                                                </span>
                                            )}
                                        </label>
                                    ) : (
                                        <label className="flex flex-col gap-1 text-sm text-gray-600">
                                            {t('sections.manager.config.stats.manualValue')}
                                            <Input
                                                type="number"
                                                value={typeof stat.value === 'number' ? stat.value : ''}
                                                onChange={(e) => handleStatUpdate(index, { value: e.target.value === '' ? undefined : Number(e.target.value) })}
                                                placeholder={t('sections.manager.config.stats.manualValuePlaceholder')}
                                            />
                                        </label>
                                    )}

                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.stats.label')}
                                        <Input
                                            value={stat.label || ''}
                                            onChange={(e) => handleStatUpdate(index, { label: e.target.value })}
                                            placeholder={t('sections.manager.config.stats.labelPlaceholder')}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.stats.descriptionLabel')}
                                        <TextArea
                                            value={stat.description || ''}
                                            onChange={(e) => handleStatUpdate(index, { description: e.target.value })}
                                            placeholder={t('sections.manager.config.stats.descriptionPlaceholder')}
                                            className="text-sm"
                                            rows={3}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.stats.prefix')}
                                        <Input
                                            value={stat.prefix || ''}
                                            onChange={(e) => handleStatUpdate(index, { prefix: e.target.value })}
                                            placeholder="e.g. ₫"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {t('sections.manager.config.stats.prefixDescription')}
                                        </span>
                                    </label>

                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.stats.suffix')}
                                        <Input
                                            value={stat.suffix || ''}
                                            onChange={(e) => handleStatUpdate(index, { suffix: e.target.value })}
                                            placeholder="e.g. +"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {t('sections.manager.config.stats.suffixDescription')}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
