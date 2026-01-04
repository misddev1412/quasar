import React from 'react';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { TextArea } from '../common';
import { Button } from '../../../common/Button';
import { Switch } from '../../../common/Switch';
import { IconSelector } from '../../../menus/IconSelector';
import { UnifiedIcon } from '../../../common/UnifiedIcon';
import { ConfigChangeHandler } from '../types';

interface WhyChooseUsItemConfig {
    id?: string;
    title?: string;
    description?: string;
    icon?: string;
    accentColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    iconColor?: string;
    backgroundLight?: string;
    backgroundDark?: string;
}

interface WhyChooseUsEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return fallback;
    }
    return Math.min(Math.max(value, min), max);
};

export const WhyChooseUsEditor: React.FC<WhyChooseUsEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const items = Array.isArray(value?.items) ? (value.items as WhyChooseUsItemConfig[]) : [];
    const columns = clampNumber(value?.columns, 5, 1, 6);
    const gap = typeof value?.gap === 'string' ? value.gap : '1.25rem';
    const cardPadding = typeof value?.cardPadding === 'string' ? value.cardPadding : '2rem 1.5rem';
    const cardBackground = typeof value?.cardBackground === 'string' ? value.cardBackground : '';
    const cardBorderColor = typeof value?.cardBorderColor === 'string' ? value.cardBorderColor : '';
    const hexagonSize = typeof value?.hexagonSize === 'string' ? value.hexagonSize : '12rem';
    const hexagonBorderWidth = clampNumber(value?.hexagonBorderWidth, 6, 1, 20);
    const descriptionClamp = clampNumber(value?.descriptionClamp, 3, 0, 3);
    const uppercaseTitles = value?.uppercaseTitles !== false;

    const updateConfig = (partial: Record<string, unknown>) => {
        onChange({
            ...(value ?? {}),
            ...partial,
        });
    };

    const updateStringField = (key: string, nextValue: string) => {
        const draft = { ...(value ?? {}) } as Record<string, unknown>;
        if (nextValue && nextValue.trim() !== '') {
            draft[key] = nextValue;
        } else {
            delete draft[key];
        }
        onChange(draft);
    };

    const handleItemChange = (index: number, payload: Partial<WhyChooseUsItemConfig>) => {
        const next = [...items];
        next[index] = {
            ...(next[index] ?? {}),
            ...payload,
        };
        updateConfig({ items: next });
    };

    const handleAddItem = () => {
        const next = [
            ...items,
            {
                id: `why-card-${Date.now()}`,
                title: '',
                description: '',
            },
        ];
        updateConfig({ items: next });
    };

    const handleRemoveItem = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        updateConfig({ items: next });
    };

    const moveItem = (index: number, direction: number) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) {
            return;
        }
        const next = [...items];
        const [removed] = next.splice(index, 1);
        next.splice(target, 0, removed);
        updateConfig({ items: next });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.numberOfColumns')}
                    <Input
                        type="number"
                        min={1}
                        max={6}
                        value={columns}
                        onChange={(event) => updateConfig({
                            columns: clampNumber(Number(event.target.value), columns, 1, 6),
                        })}
                        inputSize="md"
                        className="text-sm"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.columnsDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.gap')}
                    <Input
                        value={gap}
                        onChange={(event) => updateStringField('gap', event.target.value)}
                        placeholder="1.25rem"
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.gapDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.cardPadding')}
                    <Input
                        value={cardPadding}
                        onChange={(event) => updateStringField('cardPadding', event.target.value)}
                        placeholder="2rem 1.5rem"
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.cardPaddingDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.hexagonSize')}
                    <Input
                        value={hexagonSize}
                        onChange={(event) => updateStringField('hexagonSize', event.target.value)}
                        placeholder={t('sections.manager.config.whyChooseUs.hexagonSizePlaceholder')}
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.hexagonSizeDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.hexagonBorderWidth')}
                    <Input
                        type="number"
                        min={1}
                        max={20}
                        value={hexagonBorderWidth}
                        onChange={(event) => updateConfig({
                            hexagonBorderWidth: clampNumber(Number(event.target.value), hexagonBorderWidth, 1, 20),
                        })}
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.hexagonBorderWidthDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.descriptionClamp')}
                    <Input
                        type="number"
                        min={0}
                        max={3}
                        value={descriptionClamp}
                        onChange={(event) => updateConfig({
                            descriptionClamp: clampNumber(Number(event.target.value), descriptionClamp, 0, 3),
                        })}
                        className="text-sm"
                        inputSize="md"
                    />
                    <span className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.descriptionClampDescription')}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.cardBackground')}
                    <Input
                        value={cardBackground}
                        onChange={(event) => updateStringField('cardBackground', event.target.value)}
                        placeholder={t('sections.manager.config.whyChooseUs.cardBackgroundPlaceholder')}
                        className="text-sm"
                        inputSize="md"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.cardBorderColor')}
                    <Input
                        value={cardBorderColor}
                        onChange={(event) => updateStringField('cardBorderColor', event.target.value)}
                        placeholder="#E2E8F0"
                        className="text-sm"
                        inputSize="md"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600">
                    {t('sections.manager.config.whyChooseUs.uppercaseTitles')}
                    <Switch
                        checked={uppercaseTitles}
                        onChange={(checked) => updateConfig({ uppercaseTitles: checked })}
                        description={t('sections.manager.config.whyChooseUs.uppercaseTitlesDescription')}
                    />
                </label>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 p-4 dark:border-gray-800">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                        {t('sections.manager.config.whyChooseUs.cards.title')}
                    </p>
                    <p className="text-xs text-gray-500">{t('sections.manager.config.whyChooseUs.cards.description')}</p>
                </div>
                <div className="mt-3 flex justify-end">
                    <Button type="button" variant="outline" size="sm" startIcon={<FiPlus className="h-4 w-4" />} onClick={handleAddItem}>
                        {t('sections.manager.config.whyChooseUs.cards.add')}
                    </Button>
                </div>

                {items.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40">
                        {t('sections.manager.config.whyChooseUs.cards.empty')}
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id || `why-item-${index}`} className="space-y-4 rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {t('sections.manager.config.whyChooseUs.cards.label', { index: index + 1 })}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={index === 0}
                                            onClick={() => moveItem(index, -1)}
                                            startIcon={<FiChevronUp className="h-4 w-4" />}
                                        >
                                            {t('sections.manager.config.whyChooseUs.cards.moveUp')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={index === items.length - 1}
                                            onClick={() => moveItem(index, 1)}
                                            startIcon={<FiChevronDown className="h-4 w-4" />}
                                        >
                                            {t('sections.manager.config.whyChooseUs.cards.moveDown')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveItem(index)}
                                            startIcon={<FiTrash2 className="h-4 w-4" />}
                                        >
                                            {t('sections.manager.config.whyChooseUs.cards.remove')}
                                        </Button>
                                    </div>
                                </div>

                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.whyChooseUs.cards.titleLabel')}
                                    <Input
                                        value={item.title || ''}
                                        onChange={(event) => handleItemChange(index, { title: event.target.value })}
                                        placeholder="30+ Years Experience"
                                        className="text-sm"
                                        inputSize="md"
                                    />
                                </label>

                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.whyChooseUs.cards.descriptionLabel')}
                                    <TextArea
                                        value={item.description || ''}
                                        onChange={(event) => handleItemChange(index, { description: event.target.value })}
                                        rows={3}
                                        className="text-sm"
                                        placeholder="Explain why this differentiator matters"
                                    />
                                </label>

                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {t('sections.manager.config.whyChooseUs.cards.iconLabel')}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                                            {item.icon ? <UnifiedIcon icon={item.icon} size={20} /> : <span className="text-xs text-gray-400">--</span>}
                                        </div>
                                        <div className="flex-1">
                                            <IconSelector
                                                value={item.icon}
                                                onChange={(icon) => handleItemChange(index, { icon })}
                                                placeholder={t('sections.manager.config.whyChooseUs.cards.iconPlaceholder')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.whyChooseUs.cards.accentColor')}
                                        <Input
                                            value={item.accentColor || ''}
                                            onChange={(event) => handleItemChange(index, { accentColor: event.target.value })}
                                            placeholder="#00A0DC"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.whyChooseUs.cards.iconColor')}
                                        <Input
                                            value={item.iconColor || ''}
                                            onChange={(event) => handleItemChange(index, { iconColor: event.target.value })}
                                            placeholder="#00A0DC"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.whyChooseUs.cards.gradientFrom')}
                                        <Input
                                            value={item.gradientFrom || ''}
                                            onChange={(event) => handleItemChange(index, { gradientFrom: event.target.value })}
                                            placeholder="#017399"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.whyChooseUs.cards.gradientTo')}
                                        <Input
                                            value={item.gradientTo || ''}
                                            onChange={(event) => handleItemChange(index, { gradientTo: event.target.value })}
                                            placeholder="#00A0DC"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.whyChooseUs.cards.backgroundLight')}
                                        <Input
                                            value={item.backgroundLight || ''}
                                            onChange={(event) => handleItemChange(index, { backgroundLight: event.target.value })}
                                            placeholder="#FFFFFF"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.whyChooseUs.cards.backgroundDark')}
                                        <Input
                                            value={item.backgroundDark || ''}
                                            onChange={(event) => handleItemChange(index, { backgroundDark: event.target.value })}
                                            placeholder="#0F172A"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhyChooseUsEditor;
