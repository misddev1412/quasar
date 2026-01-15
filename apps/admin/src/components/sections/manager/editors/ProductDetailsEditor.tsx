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

interface PolicyBoxConfig {
    id?: string;
    title?: string;
    description?: string;
    icon?: string;
}

interface ProductDetailsEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const ProductDetailsEditor: React.FC<ProductDetailsEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    // Toggles
    const showSidebar = value?.showSidebar !== false; // Default true
    const showDescription = value?.showDescription !== false; // Default true
    const showTableOfContents = value?.showTableOfContents !== false; // Default true
    const showReviews = value?.showReviews !== false; // Default true
    const showQuestions = value?.showQuestions !== false; // Default true

    // Policies
    const policies = Array.isArray(value?.policies) ? (value.policies as PolicyBoxConfig[]) : [];

    const updateConfig = (partial: Record<string, unknown>) => {
        onChange({
            ...(value ?? {}),
            ...partial,
        });
    };

    const handlePolicyChange = (index: number, payload: Partial<PolicyBoxConfig>) => {
        const next = [...policies];
        next[index] = {
            ...(next[index] ?? {}),
            ...payload,
        };
        updateConfig({ policies: next });
    };

    const handleAddPolicy = () => {
        const next = [
            ...policies,
            {
                id: `policy-${Date.now()}`,
                title: '',
                description: '',
                icon: 'FiCheck'
            },
        ];
        updateConfig({ policies: next });
    };

    const handleRemovePolicy = (index: number) => {
        const next = [...policies];
        next.splice(index, 1);
        updateConfig({ policies: next });
    };

    const movePolicy = (index: number, direction: number) => {
        const target = index + direction;
        if (target < 0 || target >= policies.length) {
            return;
        }
        const next = [...policies];
        const [removed] = next.splice(index, 1);
        next.splice(target, 0, removed);
        updateConfig({ policies: next });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-200">Layout & Visibility</h4>

                    <Switch
                        checked={showSidebar}
                        onChange={(checked) => updateConfig({ showSidebar: checked })}
                        label={t('sections.manager.config.product_details.showSidebar')}
                    />

                    <Switch
                        checked={showTableOfContents}
                        onChange={(checked) => updateConfig({ showTableOfContents: checked })}
                        label={t('sections.manager.config.product_details.showTableOfContents')}
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-200">Tabs Visibility</h4>
                    <Switch
                        checked={showDescription}
                        onChange={(checked) => updateConfig({ showDescription: checked })}
                        label={t('sections.manager.config.product_details.showDescription')}
                    />
                    {/* 
                     <Switch
                        checked={showReviews}
                        onChange={(checked) => updateConfig({ showReviews: checked })}
                        label={t('sections.manager.config.product_details.showReviews')}
                    />
                     <Switch
                        checked={showQuestions}
                        onChange={(checked) => updateConfig({ showQuestions: checked })}
                        label={t('sections.manager.config.product_details.showQuestions')}
                    />
                    */}
                </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 p-4 dark:border-gray-800">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                        {t('sections.manager.config.product_details.policies.title')}
                    </p>
                    <p className="text-xs text-gray-500">{t('sections.manager.config.product_details.policies.description')}</p>
                </div>
                <div className="mt-3 flex justify-end">
                    <Button type="button" variant="outline" size="sm" startIcon={<FiPlus className="h-4 w-4" />} onClick={handleAddPolicy}>
                        {t('sections.manager.config.product_details.policies.add')}
                    </Button>
                </div>

                {policies.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40">
                        No policies added yet. Click "Add Policy Box" to create one.
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {policies.map((item, index) => (
                            <div key={item.id || `policy-${index}`} className="space-y-4 rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {t('sections.manager.config.product_details.policies.label', { index: index + 1 })}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={index === 0}
                                            onClick={() => movePolicy(index, -1)}
                                            startIcon={<FiChevronUp className="h-4 w-4" />}
                                        >
                                            Up
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={index === policies.length - 1}
                                            onClick={() => movePolicy(index, 1)}
                                            startIcon={<FiChevronDown className="h-4 w-4" />}
                                        >
                                            Down
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemovePolicy(index)}
                                            startIcon={<FiTrash2 className="h-4 w-4" />}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex flex-col gap-1 text-sm text-gray-600">
                                        {t('sections.manager.config.product_details.policies.titleLabel')}
                                        <Input
                                            value={item.title || ''}
                                            onChange={(event) => handlePolicyChange(index, { title: event.target.value })}
                                            placeholder="Free Shipping"
                                            className="text-sm"
                                            inputSize="md"
                                        />
                                    </label>

                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            {t('sections.manager.config.product_details.policies.iconLabel')}
                                        </span>
                                        <IconSelector
                                            value={item.icon}
                                            onChange={(icon) => handlePolicyChange(index, { icon })}
                                            placeholder="Select Icon"
                                        />
                                    </div>
                                </div>

                                <label className="flex flex-col gap-1 text-sm text-gray-600">
                                    {t('sections.manager.config.product_details.policies.descriptionLabel')}
                                    <TextArea
                                        value={item.description || ''}
                                        onChange={(event) => handlePolicyChange(index, { description: event.target.value })}
                                        rows={2}
                                        className="text-sm"
                                        placeholder="Free shipping on orders over $50"
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
