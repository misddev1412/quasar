import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { ConfigChangeHandler } from '../types';

interface ContactFormEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

export const ContactFormEditor: React.FC<ContactFormEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const handleFieldsChange = (fields: string[]) => {
        onChange({
            ...(value ?? {}),
            fields,
        });
    };

    const currentFields = (value?.fields as string[]) || ['name', 'email', 'message'];

    const availableFields = useMemo(() => [
        { value: 'name', label: t('sections.manager.config.contactForm.name') },
        { value: 'email', label: t('sections.manager.config.contactForm.email') },
        { value: 'phone', label: t('sections.manager.config.contactForm.phone') },
        { value: 'subject', label: t('sections.manager.config.contactForm.subject') },
        { value: 'message', label: t('sections.manager.config.contactForm.message') },
        { value: 'company', label: t('sections.manager.config.contactForm.company') },
    ], [t]);

    return (
        <div className="space-y-4">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
                {t('sections.manager.config.contactForm.formFields')}
                <div className="space-y-2">
                    {availableFields.map((field) => (
                        <label key={field.value} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={currentFields.includes(field.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        handleFieldsChange([...currentFields, field.value]);
                                    } else {
                                        handleFieldsChange(currentFields.filter(f => f !== field.value));
                                    }
                                }}
                            />
                            {field.label}
                        </label>
                    ))}
                </div>
                <span className="text-xs text-gray-500">{t('sections.manager.config.contactForm.fieldsDescription')}</span>
            </label>

            <p className="text-xs text-gray-500">
                {t('sections.manager.config.contactForm.contentDescription')}
            </p>
        </div>
    );
};
