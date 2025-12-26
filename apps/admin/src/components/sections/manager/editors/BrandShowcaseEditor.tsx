import React, { useState, useEffect } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Select } from '../../../common/Select';
import { BrandSelector } from '../../../menus/BrandSelector';
import { ConfigChangeHandler, CustomBrandSummary } from '../types';
import { ensureNumber } from '../utils';
import { FiChevronUp, FiChevronDown, FiTrash2 } from 'react-icons/fi';

interface BrandShowcaseEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const BrandShowcaseEditor: React.FC<BrandShowcaseEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [brandSelectorValue, setBrandSelectorValue] = useState<string | undefined>(undefined);
    const [customBrandDetails, setCustomBrandDetails] = useState<Record<string, CustomBrandSummary>>({});
    const [isLoadingBrandDetails, setIsLoadingBrandDetails] = useState(false);
    const [brandLoadError, setBrandLoadError] = useState<string | null>(null);

    const brandIds = Array.isArray(value?.brandIds) ? (value.brandIds as string[]) : [];

    const layout = value?.layout === 'slider' ? 'slider' : 'grid';
    const strategy = typeof value?.strategy === 'string' ? (value.strategy as string) : 'newest';
    const limit = Math.min(Math.max(ensureNumber(value?.limit, strategy === 'custom' ? Math.max(brandIds.length, 1) : 8), 1), 30);
    const columns = Math.min(Math.max(ensureNumber(value?.columns, 4), 1), 6);
    const showDescription = value?.showDescription === true;
    const showProductCount = value?.showProductCount !== false;
    const showWebsiteLink = value?.showWebsiteLink === true;
    const logoShape = typeof value?.logoShape === 'string' ? (value.logoShape as string) : 'rounded';
    const backgroundStyle = typeof value?.backgroundStyle === 'string' ? (value.backgroundStyle as string) : 'surface';
    const sliderAutoplay = value?.sliderAutoplay !== false;
    const sliderInterval = Math.max(ensureNumber(value?.sliderInterval, 6000), 1000);

    useEffect(() => {
        if (brandIds.length === 0) return;

        const missingIds = brandIds.filter((id) => !customBrandDetails[id]);

        if (missingIds.length === 0) return;

        let isMounted = true;

        const fetchBrands = async () => {
            setIsLoadingBrandDetails(true);
            setBrandLoadError(null);
            try {
                const { trpcClient } = await import('../../../../utils/trpc');
                const results = await Promise.all(
                    missingIds.map(async (id) => {
                        try {
                            const result = await trpcClient.adminProductBrands.getById.query({ id });
                            return result && (result as any).data ? (result as any).data : null;
                        } catch (err) {
                            console.error(`Failed to load brand ${id}`, err);
                            return null;
                        }
                    })
                );

                if (isMounted) {
                    const newDetails: Record<string, CustomBrandSummary> = {};
                    results.forEach((brand) => {
                        if (brand) {
                            newDetails[brand.id] = {
                                id: brand.id,
                                name: brand.name,
                                description: brand.description,
                                logo: brand.logo,
                            };
                        }
                    });
                    setCustomBrandDetails((prev) => ({ ...prev, ...newDetails }));
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching brand details:', err);
                    setBrandLoadError(t('sections.manager.config.brandShowcase.errorLoadingBrands'));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingBrandDetails(false);
                }
            }
        };

        fetchBrands();

        return () => {
            isMounted = false;
        };
    }, [brandIds, customBrandDetails, t]);

    const applyConfig = (partial: Record<string, unknown>) => {
        onChange({
            ...(value ?? {}),
            ...partial,
        });
    };

    const setBrandIds = (ids: string[]) => {
        const next = { ...(value ?? {}) } as Record<string, unknown>;
        if (ids.length > 0) {
            next.brandIds = ids;
        } else {
            delete next.brandIds;
        }
        onChange(next);
    };

    const handleBrandSelection = (brandId?: string) => {
        setBrandSelectorValue(brandId);
        if (!brandId || brandIds.includes(brandId)) {
            return;
        }
        setBrandIds([...brandIds, brandId]);
        setBrandSelectorValue(undefined);
    };

    const handleBrandRemoval = (brandId: string) => {
        setBrandIds(brandIds.filter((id) => id !== brandId));
    };

    const handleMoveBrand = (index: number, direction: number) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= brandIds.length) {
            return;
        }
        const next = [...brandIds];
        const [removed] = next.splice(index, 1);
        next.splice(targetIndex, 0, removed);
        setBrandIds(next);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.brandShowcase.layout')}
                    <Select
                        value={layout}
                        onChange={(next) => applyConfig({ layout: (next as 'grid' | 'slider') || 'grid' })}
                        options={[
                            { value: 'grid', label: t('sections.manager.config.brandShowcase.layoutGrid') },
                            { value: 'slider', label: t('sections.manager.config.brandShowcase.layoutSlider') },
                        ]}
                        className="text-sm"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.brandShowcase.layoutDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.brandShowcase.source')}
                    <Select
                        value={strategy}
                        onChange={(next) => applyConfig({ strategy: (next as string) || 'newest' })}
                        options={[
                            { value: 'newest', label: t('sections.manager.config.brandShowcase.sourceNewest') },
                            { value: 'alphabetical', label: t('sections.manager.config.brandShowcase.sourceAlphabetical') },
                            { value: 'custom', label: t('sections.manager.config.brandShowcase.sourceCustom') },
                        ]}
                        className="text-sm"
                    />
                    <span className="text-xs text-gray-500">
                        {t('sections.manager.config.brandShowcase.sourceDescription')}
                    </span>
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.brandShowcase.limit')}
                    <Input
                        type="number"
                        min={1}
                        max={30}
                        disabled={strategy === 'custom'}
                        value={limit}
                        onChange={(e) => applyConfig({ limit: Math.min(Math.max(Number(e.target.value) || 1, 1), 30) })}
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">
                        {strategy === 'custom'
                            ? t('sections.manager.config.brandShowcase.limitCustomDescription')
                            : t('sections.manager.config.brandShowcase.limitDescription')}
                    </span>
                </label>

                {layout === 'grid' && (
                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        {t('sections.manager.config.brandShowcase.columns')}
                        <Input
                            type="number"
                            min={1}
                            max={6}
                            value={columns}
                            onChange={(e) => applyConfig({ columns: Math.min(Math.max(Number(e.target.value) || 1, 1), 6) })}
                            className="text-sm"
                            inputSize="md"
                        />
                        <span className="text-xs text-gray-500">{t('sections.manager.config.brandShowcase.columnsDescription')}</span>
                    </label>
                )}
            </div>

            {layout === 'slider' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={sliderAutoplay}
                            onChange={(e) => applyConfig({ sliderAutoplay: e.target.checked })}
                        />
                        {t('sections.manager.config.brandShowcase.autoplay')}
                        <span className="text-xs text-gray-500">
                            {t('sections.manager.config.brandShowcase.autoplayDescription')}
                        </span>
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                        {t('sections.manager.config.brandShowcase.autoplayInterval')}
                        <Input
                            type="number"
                            min={1000}
                            step={250}
                            value={sliderInterval}
                            onChange={(e) => applyConfig({ sliderInterval: Math.max(Number(e.target.value) || 1000, 1000) })}
                            className="text-sm"
                            inputSize="md"
                        />
                        <span className="text-xs text-gray-500">
                            {t('sections.manager.config.brandShowcase.autoplayIntervalDescription')}
                        </span>
                    </label>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.brandShowcase.logoShape')}
                    <Select
                        value={logoShape}
                        onChange={(next) => applyConfig({ logoShape: next })}
                        options={[
                            { value: 'rounded', label: t('sections.manager.config.brandShowcase.logoRounded') },
                            { value: 'circle', label: t('sections.manager.config.brandShowcase.logoCircle') },
                            { value: 'square', label: t('sections.manager.config.brandShowcase.logoSquare') },
                        ]}
                        className="text-sm"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.brandShowcase.background')}
                    <Select
                        value={backgroundStyle}
                        onChange={(next) => applyConfig({ backgroundStyle: next })}
                        options={[
                            { value: 'surface', label: t('sections.manager.config.brandShowcase.backgroundSurface') },
                            { value: 'muted', label: t('sections.manager.config.brandShowcase.backgroundMuted') },
                            { value: 'contrast', label: t('sections.manager.config.brandShowcase.backgroundContrast') },
                        ]}
                        className="text-sm"
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={showDescription}
                        onChange={(e) => applyConfig({ showDescription: e.target.checked })}
                    />
                    {t('sections.manager.config.brandShowcase.showDescription')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={showProductCount}
                        onChange={(e) => applyConfig({ showProductCount: e.target.checked })}
                    />
                    {t('sections.manager.config.brandShowcase.showProductCount')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={showWebsiteLink}
                        onChange={(e) => applyConfig({ showWebsiteLink: e.target.checked })}
                    />
                    {t('sections.manager.config.brandShowcase.showWebsite')}
                </label>
            </div>

            {strategy === 'custom' && (
                <div className="space-y-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4">
                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                        <span>{t('sections.manager.config.brandShowcase.customBrands')}</span>
                        <BrandSelector value={brandSelectorValue} onChange={handleBrandSelection} />
                        <span className="text-xs text-gray-500">
                            {t('sections.manager.config.brandShowcase.customBrandsDescription')}
                        </span>
                    </div>

                    {brandLoadError && (
                        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                            {brandLoadError}
                        </p>
                    )}

                    {isLoadingBrandDetails && (
                        <p className="text-xs text-gray-500">
                            {t('sections.manager.config.brandShowcase.loadingBrands')}
                        </p>
                    )}

                    {brandIds.length === 0 ? (
                        <p className="text-xs text-gray-500">
                            {t('sections.manager.config.brandShowcase.noBrands')}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {brandIds.map((id, index) => {
                                const detail = customBrandDetails[id];
                                return (
                                    <div
                                        key={id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            {detail?.logo ? (
                                                <img
                                                    src={detail.logo}
                                                    alt={detail.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                                                    {(detail?.name || id).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{detail?.name || t('sections.manager.config.brandShowcase.unknownBrand')}</p>
                                                {detail?.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2">{detail.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                                onClick={() => handleMoveBrand(index, -1)}
                                                disabled={index === 0}
                                                aria-label={t('sections.manager.config.brandShowcase.moveUp')}
                                            >
                                                <FiChevronUp />
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                                onClick={() => handleMoveBrand(index, 1)}
                                                disabled={index === brandIds.length - 1}
                                                aria-label={t('sections.manager.config.brandShowcase.moveDown')}
                                            >
                                                <FiChevronDown />
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-red-500 hover:bg-red-50"
                                                onClick={() => handleBrandRemoval(id)}
                                                aria-label={t('sections.manager.config.brandShowcase.removeBrand')}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
