import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { FiUpload, FiDownload, FiFileText, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { Modal } from '@admin/components/common/Modal';
import { Button } from '@admin/components/common/Button';
import { Card, CardContent } from '@admin/components/common/Card';
import { Checkbox } from '@admin/components/common/Checkbox';
import { DialogClose } from '@admin/components/common/Dialog';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';

const formatFileSize = (size: number) => {
  if (!size || Number.isNaN(size)) {
    return '0 KB';
  }

  const kilobytes = size / 1024;

  if (kilobytes < 1024) {
    return `${Math.max(1, Math.round(kilobytes))} KB`;
  }

  const megabytes = kilobytes / 1024;
  const formatted = megabytes >= 10 ? Math.round(megabytes) : Number(megabytes.toFixed(1));

  return `${formatted} MB`;
};

interface MenuImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ImportSummary {
  totalRows?: number;
  imported?: number;
  skipped?: number;
  duplicates?: number;
  updated?: number;
  errors?: Array<{ row: number; message: string }>;
  details?: Array<{
    row: number;
    label: string;
    status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'ERROR';
    message?: string;
  }>;
}

export const MenuImportModal: React.FC<MenuImportModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const fileInputId = useId();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');

  const selectedFileMeta = useMemo(() => {
    if (!selectedFile) return null;

    return {
      sizeLabel: formatFileSize(selectedFile.size),
      typeLabel: selectedFile.type ? selectedFile.type.toUpperCase() : null,
    };
  }, [selectedFile]);

  const importMutation = trpc.adminMenus.importFromExcel.useMutation();

  const jobStatusQuery = trpc.adminImport.getJobStatus.useQuery(
    { id: jobId! },
    {
      enabled: !!jobId && (status === 'PENDING' || status === 'PROCESSING'),
      refetchInterval: (data) => {
        const job = (data as any)?.data;
        if (job?.status === 'completed' || job?.status === 'failed') {
          return false;
        }
        return 1000;
      },
    }
  );

  useEffect(() => {
    const jobData = (jobStatusQuery.data as any)?.data;
    if (jobData) {
      const jobStatus = jobData.status?.toUpperCase() as any;
      setStatus(jobStatus);
      setProgress(jobData.progress);

      if (jobStatus === 'COMPLETED') {
        setImportSummary(jobData.result as ImportSummary);
        setJobId(null);

        const summary = jobData.result as ImportSummary;
        if (summary) {
          const descriptionParts = [
            t('menus.import.imported_count', '{{count}} created', { count: summary.imported ?? 0 }),
          ];
          if ((summary.updated ?? 0) > 0) {
            descriptionParts.push(
              t('menus.import.updated_count', '{{count}} updated', { count: summary.updated ?? 0 })
            );
          }
          if ((summary.errors?.length ?? 0) > 0) {
            descriptionParts.push(
              t('menus.import.errors_count', '{{count}} errors', { count: summary.errors?.length ?? 0 })
            );
          }

          addToast({
            type: 'success',
            title: dryRun
              ? t('menus.import.dry_run_complete', 'Dry-run completed')
              : t('menus.import.success', 'Import completed'),
            description: descriptionParts.join(' • '),
          });
        }

        if (!dryRun) {
          void utils.adminMenus.list.invalidate();
          void utils.adminMenus.tree.invalidate();
          void utils.adminMenus.groups.invalidate();
          void utils.adminMenus.statistics.invalidate();
          onSuccess?.();
        }
      } else if (jobStatus === 'FAILED') {
        setJobId(null);
        const result = jobData.result as any;
        addToast({
          type: 'error',
          title: t('common.error', 'Error'),
          description: result?.error || t('menus.import.failed', 'Import failed'),
        });
      }
    }
  }, [jobStatusQuery.data, dryRun, onSuccess, t, addToast]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImportSummary(null);
    setOverrideExisting(false);
    setDryRun(false);
    setReadingFile(false);
    setJobId(null);
    setProgress(0);
    setStatus('IDLE');
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [onOpenChange, resetState]);

  const readFileAsBase64 = useCallback(async (file: File): Promise<string> => {
    setReadingFile(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          if (!result) {
            reject(new Error('Unable to read file.'));
            return;
          }
          const commaIndex = result.indexOf(',');
          resolve(commaIndex !== -1 ? result.slice(commaIndex + 1) : result);
        };
        reader.onerror = () => {
          reject(new Error(reader.error?.message || 'Failed to read file.'));
        };
        reader.readAsDataURL(file);
      });
      return base64;
    } finally {
      setReadingFile(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImportSummary(null);
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDropZoneKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLabelElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (typeof document === 'undefined') {
          return;
        }
        const input = document.getElementById(fileInputId) as HTMLInputElement | null;
        input?.click();
      }
    },
    [fileInputId]
  );

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const result = await utils.adminMenus.downloadExcelTemplate.fetch({}) as {
        data: string;
        filename: string;
        mimeType: string;
      };

      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('menus.import.download_failed', 'Failed to download template'),
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!importSummary) return [];

    return [
      {
        label: t('menus.import.total_rows', 'Total rows'),
        value: importSummary.totalRows ?? 0,
      },
      {
        label: t('menus.import.imported', 'Imported'),
        value: importSummary.imported ?? 0,
      },
      {
        label: t('menus.import.updated', 'Updated'),
        value: importSummary.updated ?? 0,
      },
      {
        label: t('menus.import.skipped', 'Skipped'),
        value: importSummary.skipped ?? 0,
      },
      {
        label: t('menus.import.duplicates', 'Duplicates'),
        value: importSummary.duplicates ?? 0,
      },
    ];
  }, [importSummary, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('menus.import.select_file_error', 'Please select a file to import.'),
      });
      return;
    }

    try {
      const base64 = await readFileAsBase64(selectedFile);
      setImportSummary(null);

      const response = await importMutation.mutateAsync({
        fileName: selectedFile.name,
        fileData: base64,
        overrideExisting,
        dryRun,
      });

      setJobId((response as any).data.jobId);
      setStatus('PENDING');
      setProgress(0);
    } catch (error: any) {
      const message = error?.message || t('menus.import.failed', 'Failed to import menus.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    }
  };

  const isBusy = importMutation.isPending || readingFile || isDownloadingTemplate || status === 'PENDING' || status === 'PROCESSING';

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      size="xl"
      modalId="menu-import-modal"
      hideCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              {t('menus.import.title', 'Import menus from Excel')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('menus.import.subtitle', 'Upload an Excel (.xlsx) or CSV file exported from Excel to create or update menus in bulk.')}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              startIcon={<FiDownload />}
              onClick={handleDownloadTemplate}
              isLoading={isDownloadingTemplate}
              disabled={isDownloadingTemplate || isBusy}
            >
              {t('menus.import.download_template', 'Download template')}
            </Button>
            {!isBusy && (
              <DialogClose
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <FiX className="h-5 w-5" />
                <span className="sr-only">{t('common.close', 'Close')}</span>
              </DialogClose>
            )}
          </div>
        </header>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={fileInputId}
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {t('menus.import.file_label', 'Select spreadsheet file')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('menus.import.supported_formats', 'Supported formats: .xlsx, .xls, .csv')}
                  </p>
                </div>

                <label
                  htmlFor={fileInputId}
                  tabIndex={isBusy ? -1 : 0}
                  onKeyDown={!isBusy ? handleDropZoneKeyDown : undefined}
                  className={`group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-white px-6 py-8 text-center shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-gray-900 ${isBusy
                    ? 'border-gray-200 opacity-50 cursor-not-allowed dark:border-gray-700'
                    : 'border-gray-300 hover:border-primary/70 dark:border-gray-600'
                    }`}
                >
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isBusy}
                  />
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiUpload className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {selectedFile
                        ? selectedFile.name
                        : t('menus.import.drop_zone', 'Click to choose a file')}
                    </p>
                    {selectedFile ? (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedFileMeta?.sizeLabel}
                          {selectedFileMeta?.typeLabel && selectedFileMeta.typeLabel !== '—' ? (
                            <> • {selectedFileMeta.typeLabel}</>
                          ) : null}
                        </p>
                        {!isBusy && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {t('menus.import.replace_hint', 'Click to replace file')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('menus.import.drop_zone_hint', 'Drag and drop your file here or browse from your device.')}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {(status === 'PENDING' || status === 'PROCESSING') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>{status === 'PENDING' ? t('common.pending', 'Pending...') : t('common.processing', 'Processing...')}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 animate-pulse">
                    {t('menus.import.do_not_close', 'Please wait. This may take a while depending on file size.')}
                  </p>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('menus.import.override_existing', 'Override existing menus')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('menus.import.override_hint', 'If a menu already exists, update it instead of skipping.')}
                    </p>
                  </div>
                  <Checkbox
                    checked={overrideExisting}
                    onCheckedChange={(checked) => setOverrideExisting(Boolean(checked))}
                    aria-label="override-existing"
                    className="mt-1 shrink-0"
                    disabled={isBusy}
                  />
                </div>

                <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('menus.import.dry_run', 'Dry-run (no changes)')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('menus.import.dry_run_hint', 'Validate the file and preview changes without updating menus.')}
                    </p>
                  </div>
                  <Checkbox
                    checked={dryRun}
                    onCheckedChange={(checked) => setDryRun(Boolean(checked))}
                    aria-label="dry-run"
                    className="mt-1 shrink-0"
                    disabled={isBusy}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-dashed border-primary/25 bg-primary-50/40 dark:border-primary/35 dark:bg-primary-950/25">
            <CardContent className="grid gap-4 pt-6 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-[auto,1fr] sm:items-start sm:gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary sm:mt-1">
                <FiFileText className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {t('menus.import.instructions_title', 'Formatting guidelines')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('menus.import.instructions_subtitle', 'Follow these tips to avoid common formatting issues before you upload.')}
                  </p>
                </div>
                <ul className="list-disc space-y-1 text-xs text-gray-500 dark:text-gray-400 pl-4">
                  <li>{t('menus.import.instructions_row1', 'Each row represents a single menu item.')}</li>
                  <li>{t('menus.import.instructions_row2', 'Parent ID should be a UUID if the menu item is a sub-menu.')}</li>
                  <li>{t('menus.import.instructions_row3', 'Ensure your column headers match exactly.')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {importSummary && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start gap-3">
                {importSummary.errors && importSummary.errors.length > 0 ? (
                  <FiAlertTriangle className="mt-0.5 h-5 w-5 text-warning-500" />
                ) : (
                  <FiCheckCircle className="mt-0.5 h-5 w-5 text-success-500" />
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {dryRun
                      ? t('menus.import.summary_dry_run', 'Dry-run summary')
                      : t('menus.import.summary_title', 'Import summary')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {importSummary.errors && importSummary.errors.length > 0
                      ? t('menus.import.summary_with_errors', 'Some rows could not be processed. Review the details below.')
                      : t('menus.import.summary_success', 'All rows were processed successfully.')}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {importSummary.errors && importSummary.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {t('menus.import.error_details', 'First {{count}} errors', { count: Math.min(importSummary.errors.length, 5) })}
                  </p>
                  <ul className="space-y-1 rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-error-600 dark:border-error/30 dark:bg-error/10">
                    {importSummary.errors.slice(0, 5).map((err, index) => (
                      <li key={`${err.row}-${index}`}>
                        {t('menus.import.error_row', 'Row {{row}}: {{message}}', {
                          row: err.row,
                          message: err.message,
                        })}
                      </li>
                    ))}
                  </ul>
                  {importSummary.errors.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('menus.import.more_errors', '+{{count}} additional errors not shown.', {
                        count: importSummary.errors.length - 5,
                      })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            {importSummary.details && importSummary.details.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-6 dark:border-gray-700">
                <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t('menus.import.details_title', 'Import details')}
                </h3>
                <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          {t('menus.import.row', 'Row')}
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          {t('menus.import.menu_label', 'Menu Label')}
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          {t('menus.import.status', 'Status')}
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          {t('menus.import.message', 'Message')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {importSummary.details.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            {detail.row}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-gray-100">
                            {detail.label || <span className="text-gray-400 italic">Unknown</span>}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            {getStatusBadge(detail.status)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                            {detail.message || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        )}

        <footer className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isBusy && status !== 'PENDING' && status !== 'PROCESSING'}>
            {importSummary && !dryRun ? t('common.close', 'Close') : t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            startIcon={<FiUpload />}
            disabled={!selectedFile || isBusy}
            isLoading={isBusy && status !== 'PENDING' && status !== 'PROCESSING'}
          >
            {dryRun
              ? t('menus.import.run_validation', 'Validate file')
              : t('menus.import.start_import', 'Start import')}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

const getStatusBadge = (status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'ERROR') => {
  switch (status) {
    case 'IMPORTED':
      return (
        <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-700 ring-1 ring-inset ring-success-600/20 dark:bg-success-400/10 dark:text-success-400 dark:ring-success-400/30">
          Imported
        </span>
      );
    case 'UPDATED':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          Updated
        </span>
      );
    case 'SKIPPED':
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20">
          Skipped
        </span>
      );
    case 'ERROR':
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">
          Error
        </span>
      );
    default:
      return null;
  }
};

export default MenuImportModal;
