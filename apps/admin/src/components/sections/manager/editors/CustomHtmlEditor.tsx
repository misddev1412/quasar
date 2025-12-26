import React, { useMemo, useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { ConfigChangeHandler } from '../types';
import { RichTextEditor } from '../../../common/RichTextEditor';

interface CustomHtmlEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const CustomHtmlEditor: React.FC<CustomHtmlEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();
    const [previewMode, setPreviewMode] = useState(false);
    const htmlContent = (value?.html as string) || '';
    const previewMarkup = useMemo(() => {
        if (!htmlContent.trim()) {
            return `<div class="text-sm text-gray-500">${t('sections.manager.config.customHtml.previewEmpty')}</div>`;
        }
        return htmlContent;
    }, [htmlContent, t]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('sections.manager.config.customHtml.content')}
                </label>
                <button
                    type="button"
                    className="text-xs font-medium text-primary-600 hover:text-white hover:bg-primary-500 border border-transparent rounded-md px-3 py-1 transition-colors"
                    onClick={() => setPreviewMode((prev) => !prev)}
                >
                    {previewMode
                        ? t('sections.manager.config.customHtml.hidePreview')
                        : t('sections.manager.config.customHtml.showPreview')}
                </button>
            </div>

            <RichTextEditor
                value={htmlContent}
                onChange={(newValue) => onChange({ ...value, html: newValue })}
                placeholder="<div>...</div>"
                minHeight="250px"
            />

            {previewMode && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
                    <div
                        className="prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: previewMarkup }}
                    />
                </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('sections.manager.config.customHtml.description')}
            </p>
        </div>
    );
};
