import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AIGenerateButton } from './AIGenerateButton';
import { useActiveLanguages } from '../../hooks/useLanguages';

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
    contentType: 'title' | 'description';

    /** Optional override for tone */
    tone?: string;
    /** Optional keywords/tags */
    keywords?: string[];

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

    const targetText = cleanText(targetValue);
    const sourceText = cleanText(sourceValue);

    // Logic: Use existing target for rewrite/improve, otherwise use source to summarize/expand
    const hasTargetContent = targetText.length > 0;

    const context = hasTargetContent ? targetText : sourceText;

    const contextLabel = hasTargetContent
        ? `Current ${targetLabel} (to improve/rewrite)`
        : (sourceLabel ? `${sourceLabel} (to ${contentType === 'title' ? 'summarize' : 'expand'})` : `Context for ${targetLabel}`);

    return (
        <AIGenerateButton
            entityType={entityType}
            contentType={contentType}
            context={context}
            tone={tone}
            keywords={keywords}
            onGenerate={(text) => setValue(targetFieldName, text, { shouldDirty: true, shouldValidate: true })}
            variant={variant}
            availableLanguages={activeLanguages.map(l => ({ code: l.code, name: l.name }))}
            contextLabel={contextLabel}
        />
    );
};
