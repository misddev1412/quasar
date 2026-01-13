import React, { useMemo, useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Toggle } from '../../../common/Toggle';
import { MediaManager } from '../../../common/MediaManager';
import { ImageActionButtons } from '../../../common/ImageActionButtons';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';
import { FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { Image as ImageIcon } from 'lucide-react';
import { SectionHeadingConfig, SectionHeadingConfigData } from '../common/SectionHeadingConfig';

interface TestimonialsEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

type HeadingStyle = 'default' | 'banner';

interface TestimonialItem {
    id: string;
    author: string;
    role?: string;
    content: string;
    avatar?: string;
    rating?: number;
}

interface TestimonialsConfig {
    title: string;
    description: string;
    showTitle: boolean;
    columns: number;
    items: TestimonialItem[];
    headingStyle?: HeadingStyle;
    headingBackgroundColor?: string;
    headingTextColor?: string;
}

const DEFAULT_COLUMNS = 3;

const createDefaultTestimonial = (): TestimonialItem => ({
    id: crypto.randomUUID(),
    author: '',
    content: '',
    rating: 5,
});

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    const config = useMemo<TestimonialsConfig>(() => ({
        title: typeof value?.title === 'string' ? value.title : '',
        description: typeof value?.description === 'string' ? value.description : '',
        showTitle: value?.showTitle !== false,
        columns: ensureNumber(value?.columns, DEFAULT_COLUMNS),
        items: Array.isArray(value?.items) ? (value.items as TestimonialItem[]) : [],
        headingStyle: (value?.headingStyle as HeadingStyle) || 'default',
        headingBackgroundColor: typeof value?.headingBackgroundColor === 'string' ? value.headingBackgroundColor : undefined,
        headingTextColor: typeof value?.headingTextColor === 'string' ? value.headingTextColor : undefined,
    }), [value]);

    const handleChange = (updates: Partial<TestimonialsConfig>) => {
        onChange({
            ...value,
            ...updates,
        });
    };

    const handleItemsChange = (newItems: TestimonialItem[]) => {
        handleChange({ items: newItems });
    };

    const handleAddItem = () => {
        handleItemsChange([...config.items, createDefaultTestimonial()]);
    };

    const handleRemoveItem = (id: string) => {
        handleItemsChange(config.items.filter((item) => item.id !== id));
    };

    const handleItemUpdate = (id: string, updates: Partial<TestimonialItem>) => {
        handleItemsChange(
            config.items.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
    };

    const handleMediaSelect = (selection: any) => {
        if (!editingItemId) return;
        const selected = Array.isArray(selection) ? selection[0] : selection;
        if (selected && typeof selected.url === 'string') {
            handleItemUpdate(editingItemId, { avatar: selected.url });
        }
        setMediaModalOpen(false);
        setEditingItemId(null);
    };

    const handleHeadingConfigChange = (data: SectionHeadingConfigData) => {
        onChange({
            ...value,
            ...data,
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t('sections.manager.testimonials.title', 'Section Title')}</span>
                    <Input
                        value={config.title}
                        onChange={(e) => handleChange({ title: e.target.value })}
                    />
                </label>
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t('sections.manager.testimonials.description', 'Description')}</span>
                    <Input
                        value={config.description}
                        onChange={(e) => handleChange({ description: e.target.value })}
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Toggle
                    label={t('sections.manager.testimonials.showTitle', 'Show Title')}
                    checked={config.showTitle}
                    onChange={(checked) => handleChange({ showTitle: checked })}
                />
                <label className="flex flex-col gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t('sections.manager.testimonials.columns', 'Columns')}</span>
                    <Input
                        type="number"
                        min={1}
                        max={4}
                        value={config.columns}
                        onChange={(e) => handleChange({ columns: Number(e.target.value) || DEFAULT_COLUMNS })}
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

            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{t('sections.manager.testimonials.itemsList', 'Testimonials')}</h4>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-700"
                    >
                        <FiPlus className="h-4 w-4" />
                        {t('sections.manager.testimonials.addItem', 'Add Testimonial')}
                    </button>
                </div>

                <div className="space-y-3">
                    {config.items.map((item, index) => (
                        <div key={item.id} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 overflow-hidden">
                                {item.avatar ? (
                                    <img src={item.avatar} alt={item.author} className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Input
                                        placeholder={t('sections.manager.testimonials.authorPlaceholder', 'Author Name')}
                                        value={item.author}
                                        onChange={(e) => handleItemUpdate(item.id, { author: e.target.value })}
                                        className="text-sm"
                                        inputSize="sm"
                                    />
                                    <Input
                                        placeholder={t('sections.manager.testimonials.rolePlaceholder', 'Role / Company (optional)')}
                                        value={item.role || ''}
                                        onChange={(e) => handleItemUpdate(item.id, { role: e.target.value })}
                                        className="text-sm"
                                        inputSize="sm"
                                    />
                                </div>
                                <textarea
                                    placeholder={t('sections.manager.testimonials.contentPlaceholder', 'Testimonial Content')}
                                    value={item.content}
                                    onChange={(e) => handleItemUpdate(item.id, { content: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:outline-none focus:border-indigo-500 focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 placeholder:text-gray-400"
                                    rows={2}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{t('sections.manager.testimonials.rating', 'Rating')}:</span>
                                        <select
                                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
                                            value={item.rating || 5}
                                            onChange={(e) => handleItemUpdate(item.id, { rating: Number(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5].map((r) => (
                                                <option key={r} value={r}>{r} Stars</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ImageActionButtons
                                            hasImage={Boolean(item.avatar)}
                                            onSelect={() => {
                                                setEditingItemId(item.id);
                                                setMediaModalOpen(true);
                                            }}
                                            onRemove={() => handleItemUpdate(item.id, { avatar: '' })}
                                            selectLabel={t('common.selectImage', 'Photo')}
                                            changeLabel={t('common.change', 'Change')}
                                            removeLabel={t('common.remove', 'Remove')}
                                        />
                                        {config.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <MediaManager
                isOpen={mediaModalOpen}
                onClose={() => {
                    setMediaModalOpen(false);
                    setEditingItemId(null);
                }}
                onSelect={handleMediaSelect}
                multiple={false}
                accept="image/*"
            />
        </div>
    );
};
