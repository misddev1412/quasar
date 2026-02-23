import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@admin/components/common/Button';
import { trpc } from '@admin/utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { AIGenerationOptionsModal, AIGenerationOptions } from '@admin/components/common/AIGenerationOptionsModal';

interface AIGenerateButtonProps {
    onGenerate: (content: string) => void;
    entityType: 'product' | 'post';
    contentType: 'title' | 'description' | 'keywords' | 'image';
    context?: string;
    keywords?: string[];
    language?: string;
    tone?: string;
    className?: string;
    variant?: 'default' | 'icon';
    availableLanguages?: { code: string; name: string }[];
    contextLabel?: string;
    allowImages?: boolean;
    allowLengthOptions?: boolean;
    allowProductLinks?: boolean;
    allowStyleOptions?: boolean;
    plainTextOutput?: boolean;
}

// AIGenerateButton.tsx modification
export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
    onGenerate,
    entityType,
    contentType,
    context,
    keywords,
    language,
    tone,
    className,
    variant = 'default',
    availableLanguages,
    contextLabel,
    allowImages = true,
    allowLengthOptions = true,
    allowProductLinks = true,
    allowStyleOptions = true,
    plainTextOutput = false,
}) => {
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Preview state
    const [previewContent, setPreviewContent] = useState<string | undefined>(undefined);
    const [tokenUsage, setTokenUsage] = useState<{ prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined>(undefined);

    const generateContentMutation = (trpc.adminOpenAiConfig as any).generateContent.useMutation();

    const handleGenerateClick = () => {
        setShowModal(true);
        setPreviewContent(undefined);
        setTokenUsage(undefined);
    };

    const handleConfirmGenerate = async (options: AIGenerationOptions) => {
        setIsGenerating(true);
        setPreviewContent(undefined);

        try {
            const result = await generateContentMutation.mutateAsync({
                entityType,
                contentType,
                context: options.context,
                keywords,
                language: options.language,
                tone: options.tone,
                style: options.style,
                includeProductLinks: options.includeProductLinks,
                includeImages: options.includeImages,
                length: options.length,
                plainTextOutput,
            });

            if (result.data) {
                // Set preview data instead of applying immediately
                setPreviewContent(result.data.content);
                setTokenUsage(result.data.usage);
            }
        } catch (error: any) {
            console.error('AI Generation Error:', error);
            const errorMessage = error.shape?.message || error.message || t('ai.generation_failed', 'Failed to generate content');

            if (errorMessage.includes('configuration not found')) {
                addToast({
                    type: 'error',
                    title: t('ai.config_error', 'AI Not Configured'),
                    description: t('ai.config_missing_message', 'Please configure OpenAI settings in the admin panel to use this feature.'),
                });
            } else {
                addToast({
                    type: 'error',
                    title: t('common.error'),
                    description: errorMessage,
                });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = (content: string) => {
        onGenerate(content);
        addToast({
            type: 'success',
            title: t('common.success'),
            description: t('ai.generated_success', 'Content generated successfully'),
        });
        setShowModal(false);
    };

    const handleRegenerate = () => {
        setPreviewContent(undefined);
        setTokenUsage(undefined);
    };

    if (variant === 'icon') {
        return (
            <>
                <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isGenerating}
                    className={`p-1.5 rounded-md transition-colors ${isGenerating
                        ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                        : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20'
                        } ${className || ''}`}
                    title={t('ai.generate_btn', 'Generate with AI')}
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Wand2 className="w-4 h-4" />
                    )}
                </button>
                <AIGenerationOptionsModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onGenerate={handleConfirmGenerate}
                    defaultLanguage={language}
                    availableLanguages={availableLanguages}
                    isGenerating={isGenerating}
                    initialContext={context}
                    generatedContent={previewContent}
                    tokenUsage={tokenUsage}
                    onApply={handleApply}
                    onRegenerate={handleRegenerate}
                    contextLabel={contextLabel}
                    entityType={entityType}
                    contentType={contentType}
                    allowImages={allowImages}
                    allowLengthOptions={allowLengthOptions}
                    allowProductLinks={allowProductLinks}
                    allowStyleOptions={allowStyleOptions}
                />
            </>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className={`gap-2 ${className}`}
                type="button"
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
                <span className="text-purple-700 dark:text-purple-300">
                    {t('ai.generate_btn', 'Generate with AI')}
                </span>
            </Button>
            <AIGenerationOptionsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onGenerate={handleConfirmGenerate}
                defaultLanguage={language}
                availableLanguages={availableLanguages}
                isGenerating={isGenerating}
                initialContext={context}
                generatedContent={previewContent}
                tokenUsage={tokenUsage}
                onApply={handleApply}
                onRegenerate={handleRegenerate}
                contextLabel={contextLabel}
                entityType={entityType}
                contentType={contentType}
                allowImages={allowImages}
                allowLengthOptions={allowLengthOptions}
                allowProductLinks={allowProductLinks}
                allowStyleOptions={allowStyleOptions}
            />
        </>
    );
};
