import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Select, SelectOption } from '../common/Select';
import { DateInput } from '../common/DateInput';
import { Button } from '../common/Button';
import { MailLogStatus } from '../../types/mail-log';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export interface MailLogFilterFormState {
  status?: MailLogStatus | '';
  providerId?: string;
  channel?: 'email' | 'sms' | 'push' | '';
  type?: 'live' | 'tests' | '';
  dateFrom?: string;
  dateTo?: string;
}

interface MailLogFiltersProps {
  filters: MailLogFilterFormState;
  onFiltersChange: (values: Partial<MailLogFilterFormState>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  providerOptions: SelectOption[];
}

const MAIL_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All emails' },
  { value: 'live', label: 'Production emails' },
  { value: 'tests', label: 'Test emails' },
];

const MAIL_CHANNEL_OPTIONS: SelectOption[] = [
  { value: '', label: 'All channels' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
  { value: 'queued', label: 'Queued' },
];

export const MailLogFilters: React.FC<MailLogFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  providerOptions,
}) => {
  const { t } = useTranslationWithBackend();

  const providerSelectOptions: SelectOption[] = [
    { value: '', label: t('mail_logs.filters.all_providers', 'All providers') },
    ...providerOptions,
  ];

  const handleChange = (field: keyof MailLogFilterFormState, value: string) => {
    onFiltersChange({ [field]: value });
  };

  return (
    <Card className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <FiFilter className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {t('mail_logs.filters.title', 'Filter timeline')}
            </h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {activeFilterCount} {t('mail_logs.filters.applied', 'filters applied')}
              </p>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            startIcon={<FiX />}
            onClick={onClearFilters}
            className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {t('filters.clear_all', 'Clear filters')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          label={t('mail_logs.filters.status', 'Status')}
          value={filters.status || ''}
          onChange={(value) => handleChange('status', value)}
          options={STATUS_OPTIONS}
        />

        <Select
          label={t('mail_logs.filters.provider', 'Provider')}
          value={filters.providerId || ''}
          onChange={(value) => handleChange('providerId', value)}
          options={providerSelectOptions}
        />

        <Select
          label={t('mail_logs.filters.channel', 'Channel')}
          value={filters.channel || ''}
          onChange={(value) => handleChange('channel', value)}
          options={MAIL_CHANNEL_OPTIONS}
        />

        <Select
          label={t('mail_logs.filters.type_filter', 'Email type')}
          value={filters.type || ''}
          onChange={(value) => handleChange('type', value)}
          options={MAIL_TYPE_OPTIONS}
        />

        <DateInput
          label={t('mail_logs.filters.date_from', 'Date from')}
          value={filters.dateFrom || ''}
          onChange={(value) => handleChange('dateFrom', value)}
        />

        <DateInput
          label={t('mail_logs.filters.date_to', 'Date to')}
          value={filters.dateTo || ''}
          onChange={(value) => handleChange('dateTo', value)}
        />
      </div>
    </Card>
  );
};

export default MailLogFilters;
