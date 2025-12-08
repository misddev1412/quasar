import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BaseLayout from '../../components/layout/BaseLayout';
import { Card } from '../../components/common/Card';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { MailLogListItem, MailLogStatus } from '../../types/mail-log';
import { Button } from '../../components/common/Button';
import { FiArrowLeft, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { cn } from '@admin/lib/utils';
import { getMailLogSenderInfo } from '../../utils/mail-log';

const MailLogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();

  const logQuery = trpc.adminMailLog.getLogById.useQuery(
    { id: id! },
    { enabled: !!id },
  );

  const log = useMemo(() => {
    return (logQuery.data as ApiResponse<MailLogListItem> | undefined)?.data;
  }, [logQuery.data]);

  const actions = [
    {
      label: t('common.back', 'Back'),
      onClick: () => navigate('/mail-logs'),
      icon: <FiArrowLeft />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: () => logQuery.refetch(),
      icon: <FiRefreshCw />,
      primary: true,
      disabled: logQuery.isFetching,
    },
  ];

  const STATUS_STYLES: Record<MailLogStatus, string> = {
    sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
    delivered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
    queued: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200',
  };

  const getSenderLabel = (currentLog: MailLogListItem) => {
    const sender = getMailLogSenderInfo(currentLog);
    if (sender.isSystem) {
      return t('mail_logs.sent_by.system', 'System automation');
    }
    if (sender.primary) {
      if (sender.secondary) {
        return `${sender.primary} (${sender.secondary})`;
      }
      return sender.primary;
    }
    if (sender.fallbackId) {
      return t('mail_logs.sent_by.user_id', 'User ID: {{id}}', { id: sender.fallbackId });
    }
    return t('mail_logs.sent_by.unknown', 'Unknown sender');
  };

  return (
    <BaseLayout
      title={t('mail_logs.detail.title', 'Mail log detail')}
      description={t('mail_logs.detail.description', 'Inspect the full payload and provider response for this email.')}
      actions={actions}
      breadcrumbs={[
        { label: t('navigation.mail_management', 'Email Management'), href: '/mail-templates' },
        { label: t('mail_logs.title', 'Mail delivery logs'), href: '/mail-logs' },
        { label: t('mail_logs.detail.breadcrumb', 'Log detail'), current: true },
      ]}
    >
      {logQuery.isLoading && (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      )}

      {!logQuery.isLoading && logQuery.error && (
        <Alert variant="destructive">
          <AlertTitle>{t('mail_logs.detail.error_title', 'Unable to load mail log')}</AlertTitle>
          <AlertDescription>
            {logQuery.error.message || t('mail_logs.detail.error_message', 'An unexpected error occurred.')}
          </AlertDescription>
        </Alert>
      )}

      {!logQuery.isLoading && !logQuery.error && !log && (
        <Alert variant="warning">
          <AlertTitle>{t('mail_logs.detail.not_found_title', 'Log not found')}</AlertTitle>
          <AlertDescription>
            {t('mail_logs.detail.not_found_message', 'This log entry may have been deleted.')}
          </AlertDescription>
        </Alert>
      )}

      {log && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t('mail_logs.detail.subject', 'Subject')}
                </p>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white break-words">
                  {log.subject || t('mail_logs.empty_subject', 'Untitled email')}
                </h2>
              </div>
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize',
                  STATUS_STYLES[log.status] ?? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
                )}
              >
                {log.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label={t('mail_logs.columns.recipient', 'Recipient')} value={log.recipient} />
              <DetailRow label={t('mail_logs.details.from', 'From')} value={log.fromEmail || '—'} />
              <DetailRow label={t('mail_logs.columns.provider', 'Provider')} value={log.mailProvider?.name || '—'} />
              <DetailRow label={t('mail_logs.details.template', 'Template')} value={log.mailTemplate?.name || '—'} />
              <DetailRow label={t('mail_logs.details.flow', 'Email flow')} value={log.emailFlow?.name || '—'} />
              <DetailRow label={t('mail_logs.details.sent_by', 'Sent by')} value={getSenderLabel(log)} />
              <DetailRow label={t('mail_logs.columns.sent_at', 'Sent at')} value={log.sentAt || log.createdAt} type="datetime" />
              <DetailRow label={t('mail_logs.details.message_id', 'Provider message ID')} value={log.providerMessageId || '—'} />
              <DetailRow label={t('mail_logs.details.error', 'Error message')} value={log.errorMessage || '—'} />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {t('mail_logs.details.payload', 'Request payload')}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('mail_logs.details.payload_description', 'Raw body that was sent to the provider.')}
                  </p>
                </div>
                {log.requestPayload?.html && (
                  <Button
                    variant="ghost"
                    size="sm"
                    startIcon={<FiExternalLink />}
                    onClick={() => {
                      const newWindow = window.open();
                      if (newWindow) {
                        newWindow.document.write(log.requestPayload.html);
                        newWindow.document.close();
                      }
                    }}
                  >
                    {t('mail_logs.details.view_html', 'View HTML')}
                  </Button>
                )}
              </div>
              <pre className="bg-neutral-900/5 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg p-4 text-xs overflow-auto">
                {JSON.stringify(log.requestPayload || {}, null, 2)}
              </pre>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t('mail_logs.details.response', 'Provider response')}
              </h3>
              <pre className="bg-neutral-900/5 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg p-4 text-xs overflow-auto">
                {JSON.stringify(log.providerResponse || {}, null, 2)}
              </pre>
            </Card>
          </div>

          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('mail_logs.details.metadata', 'Metadata')}
            </h3>
            <pre className="bg-neutral-900/5 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg p-4 text-xs overflow-auto">
              {JSON.stringify(log.metadata || {}, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </BaseLayout>
  );
};

const DetailRow: React.FC<{ label: string; value?: string; type?: 'text' | 'datetime' }> = ({ label, value, type = 'text' }) => {
  let formatted = value || '—';
  if (type === 'datetime' && value) {
    formatted = new Date(value).toLocaleString();
  }
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 break-words">{formatted}</p>
    </div>
  );
};

export default MailLogDetailPage;
