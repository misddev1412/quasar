import React, { useMemo, useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Toggle } from '../../../common/Toggle';
import { MediaManager } from '../../../common/MediaManager';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import Tabs from '../../../common/Tabs';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Image as ImageIcon } from 'lucide-react';
import { SectionHeadingConfig, SectionHeadingConfigData, SectionHeadingTextTransform, SectionHeadingTitleSize } from '../common/SectionHeadingConfig';

interface BrandShowcaseEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type HeadingStyle = 'default' | 'banner';

interface BrandItem {
    id: string;
    name: string;
    logo?: string;
    url?: string;
}

interface BrandShowcaseConfig {
    title: string;
    description: string;
    showTitle: boolean;
    columns: number;
    brands: BrandItem[];
    headingStyle?: HeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
    headingTextTransform?: SectionHeadingTextTransform;
    headingTitleSize?: SectionHeadingTitleSize;
    headingBarHeight?: number;
}

const DEFAULT_COLUMNS = 6;

const createDefaultBrand = (): BrandItem => ({
    id: crypto.randomUUID(),
    name: '',
});

export const BrandShowcaseEditor: React.FC<BrandShowcaseEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const config = useMemo<BrandShowcaseConfig>(() => ({
        title: typeof value?.title === 'string' ? value.title : '',
        description: typeof value?.description === 'string' ? value.description : '',
        showTitle: value?.showTitle !== false,
        columns: ensureNumber(value?.columns, DEFAULT_COLUMNS),
        brands: Array.isArray(value?.brands) ? (value.brands as BrandItem[]) : [],
        headingStyle: (value?.headingStyle as HeadingStyle) || 'default',
        headingBackgroundColor: typeof value?.headingBackgroundColor === 'string' ? value.headingBackgroundColor : undefined,
        headingTextColor: typeof value?.headingTextColor === 'string' ? value.headingTextColor : undefined,
        headingTextTransform: typeof value?.headingTextTransform === 'string' ? (value.headingTextTransform as SectionHeadingTextTransform) : undefined,
        headingTitleSize: typeof value?.headingTitleSize === 'string' ? (value.headingTitleSize as SectionHeadingTitleSize) : undefined,
        headingBarHeight: typeof value?.headingBarHeight === 'number' ? value.headingBarHeight : undefined,
    }), [value]);

    const handleChange = (updates: Partial<BrandShowcaseConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    const handleBrandsChange = (newBrands: BrandItem[]) => {
        handleChange({ brands: newBrands });
    };

    const handleAddBrand = () => {
        handleBrandsChange([...config.brands, createDefaultBrand()]);
    };

    const handleRemoveBrand = (id: string) => {
        handleBrandsChange(config.brands.filter((b) => b.id !== id));
    };

    const handleBrandUpdate = (id: string, updates: Partial<BrandItem>) => {
        handleBrandsChange(
            config.brands.map((b) => (b.id === id ? { ...b, ...updates } : b))
        );
    };

    const handleMediaSelect = (selection: any) => {
        if (!editingBrandId) return;
        const selected = Array.isArray(selection) ? selection[0] : selection;
        if (selected && typeof selected.url === 'string') {
            handleBrandUpdate(editingBrandId, { logo: selected.url });
        }
        setMediaModalOpen(false);
        setEditingBrandId(null);
    };

    const handleHeadingConfigChange = (data: SectionHeadingConfigData) => {
        onChange({
            ...value,
            ...data,
        });
    };

    return (
        <div className="space-y-6">
            <Tabs
                tabs={[
                    {
                        label: t('sections.manager.tabs.content', 'Content'),
                        content: (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.title', 'Section Title')}</span>
                                        <Input
                                            value={config.title}
                                            onChange={(e) => handleChange({ title: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.description', 'Description')}</span>
                                        <Input
                                            value={config.description}
                                            onChange={(e) => handleChange({ description: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <Toggle
                                        label={t('sections.manager.brands.showTitle', 'Show Title')}
                                        checked={config.showTitle}
                                        onChange={(checked) => handleChange({ showTitle: checked })}
                                    />
                                    <label className="flex flex-col gap-2 text-sm text-gray-700">
                                        <span className="font-medium">{t('sections.manager.brands.columns', 'Columns')}</span>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={config.columns}
                                            onChange={(e) => handleChange({ columns: Number(e.target.value) || DEFAULT_COLUMNS })}
                                        />
                                    </label>
                                </div>
                            </div>
                        ),
                    },
                    {
                        label: t('sections.manager.tabs.heading', 'Heading'),
                        content: (
                            <SectionHeadingConfig
                                data={{
                                    headingStyle: config.headingStyle,
                                    headingBackgroundColor: config.headingBackgroundColor,
                                    headingTextColor: config.headingTextColor,
                                    headingTextTransform: config.headingTextTransform,
                                    headingTitleSize: config.headingTitleSize,
                                    headingBarHeight: config.headingBarHeight,
                                }}
                                onChange={handleHeadingConfigChange}
                            />
                        ),
                    },
                    {
                        label: t('sections.manager.tabs.brands', 'Brands'),
                        content: (
                            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900">{t('sections.manager.brands.brandsList', 'Brands')}</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddBrand}
                                        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-700"
                                    >
                                        <FiPlus className="h-4 w-4" />
                                        {t('sections.manager.brands.addBrand', 'Add Brand')}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {config.brands.map((brand) => (
                                        <div key={brand.id} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                                                {brand.logo ? (
                                                    <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full rounded object-contain p-1" />
                                                ) : (
                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-3">
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <Input
                                                        placeholder={t('sections.manager.brands.namePlaceholder', 'Brand Name')}
                                                        value={brand.name}
                                                        onChange={(e) => handleBrandUpdate(brand.id, { name: e.target.value })}
                                                        className="text-sm"
                                                        inputSize="sm"
                                                    />
                                                    <Input
                                                        placeholder={t('sections.manager.brands.urlPlaceholder', 'Link URL (optional)')}
                                                        value={brand.url || ''}
                                                        onChange={(e) => handleBrandUpdate(brand.id, { url: e.target.value })}
                                                        className="text-sm"
                                                        inputSize="sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ImageActionButtons
                                                        hasImage={Boolean(brand.logo)}
                                                        onSelect={() => {
                                                            setEditingBrandId(brand.id);
                                                            setMediaModalOpen(true);
                                                        }}
                                                        onRemove={() => handleBrandUpdate(brand.id, { logo: '' })}
                                                        selectLabel={t('common.selectImage', 'Select Image')}
                                                        changeLabel={t('common.change', 'Change')}
                                                        removeLabel={t('common.remove', 'Remove')}
                                                    />
                                                    {config.brands.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBrand(brand.id)}
                                                            className="ml-auto text-gray-400 hover:text-red-500"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <MediaManager
                isOpen={mediaModalOpen}
                onClose={() => {
                    setMediaModalOpen(false);
                    setEditingBrandId(null);
                }}
                onSelect={handleMediaSelect}
                multiple={false}
                accept="image/*"
            />
        </div>
    );
};
