import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Toggle } from '../../../common/Toggle';
import { SearchSelect } from '../../../common/SearchSelect';
import { trpc } from '../../../../utils/trpc';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';
import { SectionHeadingConfig, SectionHeadingConfigData } from '../common/SectionHeadingConfig';

interface NewsByCategoryConfigEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type HeadingStyle = 'default' | 'banner';

interface NewsByCategoryConfig {
    categoryId?: string;
    title: string;
    limit: number;
    showTitle: boolean;
    showImage: boolean;
    showDate: boolean;
    showExcerpt: boolean;
    headingStyle?: HeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
}

interface CategoryOption {
    value: string;
    label: string;
}

export const NewsByCategoryEditor: React.FC<NewsByCategoryConfigEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    // Fetch news categories
    const { data: categoriesData, isLoading: categoriesLoading } = trpc.adminPostCategories.getCategories.useQuery();

    const categoryOptions = useMemo<CategoryOption[]>(() => {
        const categories = (categoriesData as any)?.data || [];
        return categories.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
        }));
    }, [categoriesData]);

    const config = useMemo<NewsByCategoryConfig>(() => ({
        categoryId: typeof value?.categoryId === 'string' ? value.categoryId : undefined,
        title: typeof value?.title === 'string' ? value.title : '',
        limit: ensureNumber(value?.limit, 4),
        showTitle: value?.showTitle !== false,
        showImage: value?.showImage !== false,
        showDate: value?.showDate !== false,
        showExcerpt: value?.showExcerpt !== false,
        headingStyle: (value?.headingStyle as HeadingStyle) || 'default',
        headingBackgroundColor: typeof value?.headingBackgroundColor === 'string' ? value.headingBackgroundColor : undefined,
        headingTextColor: typeof value?.headingTextColor === 'string' ? value.headingTextColor : undefined,
    }), [value]);

    const handleChange = (updates: Partial<NewsByCategoryConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    const handleHeadingConfigChange = (data: SectionHeadingConfigData) => {
        onChange({
            ...value,
            ...data,
        });
    };

    const selectedCategoryOption = categoryOptions.find(opt => opt.value === config.categoryId) || null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t('sections.manager.newsByCategory.title', 'Title')}</span>
                    <Input
                        value={config.title}
                        onChange={(e) => handleChange({ title: e.target.value })}
                        placeholder={t('sections.manager.newsByCategory.titlePlaceholder', 'e.g. Latest News')}
                    />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t('sections.manager.newsByCategory.category', 'Category')}</span>
                    <SearchSelect<CategoryOption>
                        isClearable
                        isSearchable
                        isDisabled={categoriesLoading}
                        isLoading={categoriesLoading}
                        options={categoryOptions}
                        value={selectedCategoryOption}
                        onChange={(option) => handleChange({ categoryId: (option as CategoryOption)?.value })}
                        placeholder={t('sections.manager.newsByCategory.selectCategory', 'Select a category')}
                        size="md"
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t('sections.manager.newsByCategory.limit', 'Number of posts')}</span>
                    <Input
                        type="number"
                        min={1}
                        max={12}
                        value={config.limit}
                        onChange={(e) => handleChange({ limit: Number(e.target.value) || 4 })}
                    />
                </label>
            </div>

            <SectionHeadingConfig
                data={{
                    headingStyle: config.headingStyle,
                    headingBackgroundColor: config.headingBackgroundColor,
                    headingTextColor: config.headingTextColor,
                }}
                onChange={handleHeadingConfigChange}
            />

            <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-900">{t('sections.manager.newsByCategory.displayOptions', 'Display Options')}</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Toggle
                        label={t('sections.manager.newsByCategory.showTitle', 'Show Section Title')}
                        checked={config.showTitle}
                        onChange={(checked) => handleChange({ showTitle: checked })}
                    />
                    <Toggle
                        label={t('sections.manager.newsByCategory.showImage', 'Show Thumbnail')}
                        checked={config.showImage}
                        onChange={(checked) => handleChange({ showImage: checked })}
                    />
                    <Toggle
                        label={t('sections.manager.newsByCategory.showDate', 'Show Date')}
                        checked={config.showDate}
                        onChange={(checked) => handleChange({ showDate: checked })}
                    />
                    <Toggle
                        label={t('sections.manager.newsByCategory.showExcerpt', 'Show Excerpt')}
                        checked={config.showExcerpt}
                        onChange={(checked) => handleChange({ showExcerpt: checked })}
                    />
                </div>
            </div>
        </div>
    );
};
