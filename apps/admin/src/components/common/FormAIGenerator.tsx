import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AIGenerateButton } from '@admin/components/common/AIGenerateButton';
import { useActiveLanguages } from '@admin/hooks/useLanguages';

export interface FormAIGeneratorProps {
    /** The field name to update (and use as primary context) */
    targetFieldName: string;
    /** The field name to use as source context if target is empty */
    sourceFieldName?: string;
    /** Human readable label for the target field (used in prompt label) */
    targetLabel: string;
    /** Human readable label for the source field (used in prompt label) */
    sourceLabel?: string;

    entityType: 'post' | 'product';
    contentType: 'title' | 'description' | 'keywords' | 'image';

    /** Optional override for tone */
    tone?: string;
    /** Optional keywords/tags */
    keywords?: string[];
    /** Optional flag to enable image generation option */
    allowImages?: boolean;
    /** Optional flag to show length options for long-form content */
    allowLengthOptions?: boolean;
    /** Optional flag to show product links option */
    allowProductLinks?: boolean;
    /** Optional flag to show style options */
    allowStyleOptions?: boolean;
    /** Optional flag to strip HTML tags from generated content */
    stripHtmlOutput?: boolean;
    /** Optional flag to sanitize generated content as strict plain text */
    plainTextOutput?: boolean;

    variant?: 'default' | 'icon';
}

export const FormAIGenerator: React.FC<FormAIGeneratorProps> = ({
    targetFieldName,
    sourceFieldName,
    targetLabel,
    sourceLabel,
    entityType,
    contentType,
    tone,
    keywords,
    allowImages,
    allowLengthOptions,
    allowProductLinks,
    allowStyleOptions,
    stripHtmlOutput,
    plainTextOutput,
    variant = 'icon',
}) => {
    const { setValue, watch } = useFormContext();
    const { activeLanguages } = useActiveLanguages();

    const targetValue = watch(targetFieldName);
    const sourceValue = sourceFieldName ? watch(sourceFieldName) : '';

    // Helper to clean HTML
    const cleanText = (text: any): string => {
        if (typeof text !== 'string') return '';
        return text.replace(/<[^>]*>?/gm, '').trim();
    };

    const sanitizePlainText = (text: string): string => {
        return cleanText(text)
            .replace(/https?:\/\/\S+/gi, '')
            .replace(/www\.\S+/gi, '')
            .replace(/\[[^\]]+\]\([^\)]+\)/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const targetText = cleanText(targetValue);
    const sourceText = cleanText(sourceValue);

    // Logic: Use existing target for rewrite/improve, otherwise use source to summarize/expand
    const hasTargetContent = targetText.length > 0;

    const context = hasTargetContent ? targetText : sourceText;

    const contextLabel = hasTargetContent
        ? `Current ${targetLabel} (to improve/rewrite)`
        : (sourceLabel ? `${sourceLabel} (to ${contentType === 'title' ? 'summarize' : 'expand'})` : `Context for ${targetLabel}`);

    const applyOutput = (text: string) => {
        const nextValue = plainTextOutput
            ? sanitizePlainText(text)
            : (stripHtmlOutput ? cleanText(text) : text);
        setValue(targetFieldName, nextValue, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <AIGenerateButton
            entityType={entityType}
            contentType={contentType}
            context={context}
            tone={tone}
            keywords={keywords}
            allowImages={allowImages}
            allowLengthOptions={allowLengthOptions}
            allowProductLinks={allowProductLinks}
            allowStyleOptions={allowStyleOptions}
            plainTextOutput={plainTextOutput}
            onGenerate={applyOutput}
            variant={variant}
            availableLanguages={activeLanguages.map(l => ({ code: l.code, name: l.name }))}
            contextLabel={contextLabel}
        />
    );
};
