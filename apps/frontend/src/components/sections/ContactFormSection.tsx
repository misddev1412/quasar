'use client';

import React, { useMemo } from 'react';
import type { SectionTranslationContent } from './HeroSlider';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface ContactFormConfig {
  fields?: string[];
  submitLabel?: string;
  successMessage?: string;
  supportChannels?: {
    phone?: string;
    email?: string;
    chat?: string;
  };
  perks?: string[];
}

interface ContactFormSectionProps {
  config: ContactFormConfig;
  translation?: SectionTranslationContent | null;
}

const defaultFields = ['name', 'email', 'message'];

const fieldLabels: Record<string, string> = {
  name: 'Full name',
  email: 'Work email',
  phone: 'Phone number',
  subject: 'Subject',
  message: 'How can we help?',
  company: 'Company name',
};

const fieldTypes: Record<string, string> = {
  email: 'email',
  phone: 'tel',
};

const ContactField: React.FC<{ field: string; label: string }> = ({ field, label }) => (
  <label className="flex flex-col text-sm text-gray-700 dark:text-gray-200">
    <span className="font-medium">{label}</span>
    {field === 'message' ? (
      <textarea className="mt-2 min-h-[120px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900" />
    ) : (
      <input
        type={fieldTypes[field] || 'text'}
        className="mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
      />
    )}
  </label>
);

export const ContactFormSection: React.FC<ContactFormSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const fields = useMemo(() => {
    const uniqueFields = Array.from(new Set(config.fields || defaultFields));
    return uniqueFields.length > 0 ? uniqueFields : defaultFields;
  }, [config.fields]);

  const title = translation?.title === null ? '' : (translation?.title || t('sections.contact_form.title'));
  const subtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.contact_form.subtitle'));
  const description = translation?.description === null ? '' : (translation?.description || t('sections.contact_form.description'));

  const submitLabel = config.submitLabel || t('sections.contact_form.submit');
  const perks = Array.isArray(config.perks) ? config.perks : [];

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-950">
      <SectionContainer className="grid gap-10 lg:grid-cols-2">
        <div>
          {subtitle && <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-300">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          {description && <p className="mt-4 text-base text-gray-600 dark:text-gray-400">{description}</p>}

          {perks.length > 0 && (
            <ul className="mt-8 space-y-3">
              {perks.map((perk, idx) => (
                <li key={`perk-${idx}`} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600">•</span>
                  {perk}
                </li>
              ))}
            </ul>
          )}

          {config.supportChannels && (
            <div className="mt-8 space-y-3 rounded-2xl border border-gray-200 bg-white/80 p-6 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
              {config.supportChannels.phone && (
                <p>
                  <span className="font-semibold">Phone:</span> {config.supportChannels.phone}
                </p>
              )}
              {config.supportChannels.email && (
                <p>
                  <span className="font-semibold">Email:</span> {config.supportChannels.email}
                </p>
              )}
              {config.supportChannels.chat && (
                <p>
                  <span className="font-semibold">Chat:</span> {config.supportChannels.chat}
                </p>
              )}
            </div>
          )}
        </div>

        <form className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-6">
            {fields.map((field) => (
              <ContactField key={field} field={field} label={fieldLabels[field] || field} />
            ))}
          </div>
          <button
            type="button"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            {submitLabel}
          </button>
          {config.successMessage && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{config.successMessage}</p>
          )}
        </form>
      </SectionContainer>
    </section>
  );
};

export default ContactFormSection;
