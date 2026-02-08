import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@admin/components/common/Dialog';
import { Button } from '@admin/components/common/Button';
import { FormInput } from '@admin/components/common/FormInput';
import { TextareaInput } from '@admin/components/common/TextareaInput';
import { Select } from '@admin/components/common/Select';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Wand2, Loader2 } from 'lucide-react';

interface AIGenerationOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: AIGenerationOptions) => void;
    defaultLanguage?: string;
    availableLanguages?: { code: string; name: string }[];
    isGenerating?: boolean;
    initialContext?: string;
    generatedContent?: string;
    tokenUsage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    onApply?: (content: string) => void;
    onRegenerate?: () => void;
    contextLabel?: string;
    entityType?: 'product' | 'post';
    contentType?: 'title' | 'description' | 'keywords' | 'image';
    allowImages?: boolean;
    allowLengthOptions?: boolean;
    allowProductLinks?: boolean;
    allowStyleOptions?: boolean;
}

export interface AIGenerationOptions {
    language: string;
    tone: string;
    style: string;
    context: string;
    includeProductLinks?: boolean;
    includeImages?: boolean;
    length?: 'short' | 'medium' | 'long' | 'very_long';
}

const getToneOptions = (t: (key: string, defaultVal: string) => string) => [
    { value: 'professional', label: t('ai.tone_professional', 'Professional') },
    { value: 'casual', label: t('ai.tone_casual', 'Casual') },
    { value: 'friendly', label: t('ai.tone_friendly', 'Friendly') },
    { value: 'exciting', label: t('ai.tone_exciting', 'Exciting') },
    { value: 'witty', label: t('ai.tone_witty', 'Witty') },
    { value: 'persuasive', label: t('ai.tone_persuasive', 'Persuasive') },
];

const getStyleOptions = (t: (key: string, defaultVal: string) => string) => [
    { value: 'seo-standard', label: t('ai.style_seo_standard', 'SEO Standard') },
    { value: 'blog-post', label: t('ai.style_blog_post', 'Blog Post Section') },
    { value: 'social-media', label: t('ai.style_social_media', 'Social Media Teaser') },
    { value: 'technical', label: t('ai.style_technical', 'Technical Description') },
];

const getLengthOptions = (t: (key: string, defaultVal: string) => string) => [
    { value: 'short', label: t('ai.length_short', 'Short (~100-200 words)') },
    { value: 'medium', label: t('ai.length_medium', 'Medium (~300-500 words)') },
    { value: 'long', label: t('ai.length_long', 'Long (~600-800 words)') },
    { value: 'very_long', label: t('ai.length_very_long', 'Very Long (>1000 words)') },
];


export const AIGenerationOptionsModal: React.FC<AIGenerationOptionsModalProps> = ({
    isOpen,
    onClose,
    onGenerate,
    defaultLanguage = 'vi',
    availableLanguages = [],
    isGenerating = false,
    initialContext = '',
    generatedContent,
    tokenUsage,
    onApply,
    onRegenerate,
    contextLabel,
    entityType,
    contentType,
    allowImages = true,
    allowLengthOptions = true,
    allowProductLinks = true,
    allowStyleOptions = true,
}) => {
    const { t } = useTranslationWithBackend();


    const toneOptions = useMemo(() => getToneOptions(t), [t]);
    const styleOptions = useMemo(() => getStyleOptions(t), [t]);
    const lengthOptions = useMemo(() => getLengthOptions(t), [t]);

    const [options, setOptions] = useState<AIGenerationOptions>({
        language: defaultLanguage,
        tone: 'professional',
        style: 'seo-standard',
        context: initialContext,
        includeProductLinks: true,
        includeImages: false,
        length: 'medium',
    });

    // Local state to track if we are in preview mode
    const showPreview = !!generatedContent;

    useEffect(() => {
        if (isOpen && !showPreview) {
            setOptions(prev => ({
                ...prev,
                language: defaultLanguage,
                context: initialContext
            }));
        }
    }, [isOpen, defaultLanguage, initialContext, showPreview]);

    const handleApply = () => {
        if (onApply && generatedContent) {
            onApply(generatedContent);
        }
    };

    const handleRegenerate = () => {
        if (onRegenerate) {
            onRegenerate(); // Should clear content in parent
        }
    };

    const handleGenerate = () => {
        onGenerate(options);
    };

    const languageOptions = availableLanguages.length > 0
        ? availableLanguages.map(l => ({ value: l.code, label: l.name }))
        : [{ value: defaultLanguage, label: defaultLanguage.toUpperCase() }];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                        {t('ai.generation_options', 'AI Generation Options')}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <TextareaInput
                                id="ai-context"
                                label={contextLabel || t('ai.context', 'Context / Topic')}
                                value={options.context}
                                onChange={(e) => setOptions({ ...options, context: e.target.value })}
                                placeholder={t('ai.context_placeholder', 'Enter topic or product name...')}
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Select
                                id="ai-language"
                                label={t('ai.language', 'Language')}
                                value={options.language}
                                onChange={(value) => setOptions({ ...options, language: value })}
                                options={languageOptions}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Select
                                id="ai-tone"
                                label={t('ai.tone', 'Tone')}
                                value={options.tone}
                                onChange={(value) => setOptions({ ...options, tone: value })}
                                options={toneOptions}
                            />
                        </div>

                        {allowStyleOptions && (
                            <div className="grid gap-2">
                                <Select
                                    id="ai-style"
                                    label={t('ai.style', 'Content Style')}
                                    value={options.style}
                                    onChange={(value) => setOptions({ ...options, style: value })}
                                    options={styleOptions}
                                />
                            </div>
                        )}

                        {contentType === 'description' && allowLengthOptions && (
                            <div className="grid gap-2">
                                <Select
                                    id="ai-length"
                                    label={t('ai.length', 'Content Length')}
                                    value={options.length}
                                    onChange={(value: any) => setOptions({ ...options, length: value })}
                                    options={lengthOptions}
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 px-1">
                            {entityType === 'post' && contentType === 'description' && allowProductLinks && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="ai-include-products"
                                        checked={options.includeProductLinks}
                                        onChange={(e) => setOptions({ ...options, includeProductLinks: e.target.checked })}
                                        className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label
                                        htmlFor="ai-include-products"
                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                    >
                                        {t('ai.include_product_links', 'Include Product Links')}
                                    </label>
                                </div>
                            )}

                            {contentType === 'description' && allowImages && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="ai-include-images"
                                        checked={options.includeImages}
                                        onChange={(e) => setOptions({ ...options, includeImages: e.target.checked })}
                                        className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label
                                        htmlFor="ai-include-images"
                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                    >
                                        {t('ai.include_images', 'Include AI Images')}
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {showPreview && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <h4 className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                {t('ai.preview_result', 'Preview Result')}
                            </h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none mb-3 max-h-60 overflow-y-auto bg-white dark:bg-neutral-900 p-3 rounded border border-neutral-200 dark:border-neutral-700">
                                {contentType === 'image' && generatedContent ? (
                                    <img
                                        src={generatedContent}
                                        alt={t('ai.preview_image_alt', 'Generated image preview')}
                                        className="rounded-md max-h-56 w-auto mx-auto"
                                    />
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: generatedContent || '' }} />
                                )}
                            </div>

                            {tokenUsage && (
                                <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-2">
                                    <span>{t('ai.usage_prompt', 'Prompt')}: <span className="font-medium text-neutral-700 dark:text-neutral-300">{tokenUsage.prompt_tokens}</span></span>
                                    <span>{t('ai.usage_completion', 'Completion')}: <span className="font-medium text-neutral-700 dark:text-neutral-300">{tokenUsage.completion_tokens}</span></span>
                                    <span><span className="font-medium text-purple-600 dark:text-purple-400">{t('ai.usage_total', 'Total: {{count}} Tokens', { count: tokenUsage.total_tokens })}</span></span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => !isGenerating && onClose()}
                        disabled={isGenerating}
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>

                    {showPreview ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRegenerate}
                                disabled={isGenerating}
                            >
                                {t('ai.regenerate', 'Regenerate')}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleApply}
                                disabled={isGenerating}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {t('common.apply', 'Apply')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                        >
                            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isGenerating ? t('ai.generating', 'Generating...') : t('ai.generate', 'Generate')}
                            {!isGenerating && <Wand2 className="w-4 h-4" />}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};
