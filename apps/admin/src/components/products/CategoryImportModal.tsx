import React, { useCallback, useId, useMemo, useState } from 'react';
import { FiUpload, FiDownload, FiFileText, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { Checkbox } from '../common/Checkbox';
import { DialogClose } from '../common/Dialog';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';

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

interface CategoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ImportSummary {
  totalRows?: number;
  imported?: number;
  skipped?: number;
  duplicates?: number;
  updated?: number;
  errors?: Array<{ row: number; message: string }>;
  createdCategoryIds?: string[];
  updatedCategoryIds?: string[];
}

export const CategoryImportModal: React.FC<CategoryImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const fileInputId = useId();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [defaultIsActive, setDefaultIsActive] = useState(true);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const selectedFileMeta = useMemo(() => {
    if (!selectedFile) return null;

    return {
      sizeLabel: formatFileSize(selectedFile.size),
      typeLabel: selectedFile.type ? selectedFile.type.toUpperCase() : null,
    };
  }, [selectedFile]);

  const importMutation = trpc.adminProductCategories.importFromExcel.useMutation();

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImportSummary(null);
    setOverrideExisting(false);
    setDryRun(false);
    setDefaultIsActive(true);
    setReadingFile(false);
    setDownloading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

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
    setDownloading(true);
    try {
      const { trpcClient } = await import('../../utils/trpc');
      const response = await trpcClient.adminProductCategories.downloadExcelTemplate.query({});
      const payload = (response as any)?.data?.filename ? (response as any).data : response;
      if (!payload?.data || !payload?.filename) {
        throw new Error('Template data is missing.');
      }

      const byteCharacters = atob(payload.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: payload.mimeType || 'application/octet-stream' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = payload.filename || 'category-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error?.message || t('categories.import.template_error', 'Failed to download template.'),
      });
    } finally {
      setDownloading(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!importSummary) return [];

    return [
      {
        label: t('categories.import.total_rows', 'Total rows'),
        value: importSummary.totalRows ?? 0,
      },
      {
        label: t('categories.import.imported', 'Imported'),
        value: importSummary.imported ?? 0,
      },
      {
        label: t('categories.import.updated', 'Updated'),
        value: importSummary.updated ?? 0,
      },
      {
        label: t('categories.import.skipped', 'Skipped'),
        value: importSummary.skipped ?? 0,
      },
      {
        label: t('categories.import.duplicates', 'Duplicates'),
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
        description: t('categories.import.select_file_error', 'Please select a file to import.'),
      });
      return;
    }

    try {
      const base64 = await readFileAsBase64(selectedFile);
      const response = await importMutation.mutateAsync({
        fileName: selectedFile.name,
        fileData: base64,
        overrideExisting,
        dryRun,
        defaultIsActive,
      });

      const summary = (response as any)?.data as ImportSummary | undefined;
      setImportSummary(summary ?? null);

      if (summary) {
        const descriptionParts = [
          t('categories.import.imported_count', '{{count}} created', { count: summary.imported ?? 0 }),
        ];
        if ((summary.updated ?? 0) > 0) {
          descriptionParts.push(
            t('categories.import.updated_count', '{{count}} updated', { count: summary.updated ?? 0 })
          );
        }
        if ((summary.errors?.length ?? 0) > 0) {
          descriptionParts.push(
            t('categories.import.errors_count', '{{count}} errors', { count: summary.errors?.length ?? 0 })
          );
        }

        addToast({
          type: 'success',
          title: dryRun
            ? t('categories.import.dry_run_complete', 'Dry-run completed')
            : t('categories.import.success', 'Import completed'),
          description: descriptionParts.join(' • '),
        });
      } else {
        addToast({
          type: 'success',
          title: t('categories.import.success', 'Import completed'),
        });
      }

      if (!dryRun) {
        onImportSuccess?.();
      }
    } catch (error: any) {
      const message = error?.message || t('categories.import.failed', 'Failed to import categories.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    }
  };

  const isBusy = importMutation.isPending || readingFile;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      modalId="category-import-modal"
      hideCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              {t('categories.import.title', 'Import categories from Excel')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('categories.import.subtitle', 'Upload an Excel (.xlsx) or CSV file exported from Excel to create or update categories in bulk.')}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              startIcon={<FiDownload />}
              onClick={handleDownloadTemplate}
              isLoading={downloading}
            >
              {t('categories.import.download_template', 'Download template')}
            </Button>
            <DialogClose
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <FiX className="h-5 w-5" />
              <span className="sr-only">{t('common.close', 'Close')}</span>
            </DialogClose>
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
                    {t('categories.import.file_label', 'Select spreadsheet file')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('categories.import.supported_formats', 'Supported formats: .xlsx, .xls, .csv')}
                  </p>
                </div>

                <label
                  htmlFor={fileInputId}
                  tabIndex={0}
                  onKeyDown={handleDropZoneKeyDown}
                  className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-8 text-center shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-primary/70 dark:border-gray-600 dark:bg-gray-900"
                >
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiUpload className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {selectedFile
                        ? selectedFile.name
                        : t('categories.import.drop_zone', 'Click to choose a file')}
                    </p>
                    {selectedFile ? (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedFileMeta?.sizeLabel}
                          {selectedFileMeta?.typeLabel && selectedFileMeta.typeLabel !== '—' ? (
                            <>
                              {' '}
                              • {selectedFileMeta.typeLabel}
                            </>
                          ) : null}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t('categories.import.replace_hint', 'Click to replace file')}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('categories.import.drop_zone_hint', 'Drag and drop your file here or browse from your device.')}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900/60">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('categories.import.default_active', 'Activate imported categories')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('categories.import.default_active_hint', 'Disable if you prefer to review categories before publishing.')}
                    </p>
                  </div>
                  <Checkbox
                    checked={defaultIsActive}
                    onCheckedChange={(checked) => setDefaultIsActive(Boolean(checked))}
                    aria-label="default-active"
                    className="mt-1 shrink-0"
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('categories.import.override_existing', 'Override existing categories')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('categories.import.override_hint', 'If a category already exists, update it instead of skipping it.')}
                    </p>
                  </div>
                  <Checkbox
                    checked={overrideExisting}
                    onCheckedChange={(checked) => setOverrideExisting(Boolean(checked))}
                    aria-label="override-existing"
                    className="mt-1 shrink-0"
                  />
                </div>

                <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('categories.import.dry_run', 'Dry-run (no changes)')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('categories.import.dry_run_hint', 'Validate the file, see the summary, but do not create or update categories.')}
                    </p>
                  </div>
                  <Checkbox
                    checked={dryRun}
                    onCheckedChange={(checked) => setDryRun(Boolean(checked))}
                    aria-label="dry-run"
                    className="mt-1 shrink-0"
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
                    {t('categories.import.instructions_title', 'Formatting guidelines')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('categories.import.instructions_subtitle', 'Follow these tips to avoid common formatting issues before you upload.')}
                  </p>
                </div>
                <ul className="list-disc space-y-1 text-xs text-gray-500 dark:text-gray-400 pl-4">
                  <li>{t('categories.import.instructions_row1', 'Each row represents a category.')}</li>
                  <li>{t('categories.import.instructions_row2', 'Use valid UUIDs for Category ID and Parent ID columns when provided.')}</li>
                  <li>{t('categories.import.instructions_row3', 'Excel files saved as CSV are fully supported.')}</li>
                  <li>{t('categories.import.instructions_row4', 'Leave optional columns blank if you do not need them.')}</li>
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
                      ? t('categories.import.summary_dry_run', 'Dry-run summary')
                      : t('categories.import.summary_title', 'Import summary')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {importSummary.errors && importSummary.errors.length > 0
                      ? t('categories.import.summary_with_errors', 'Some rows could not be processed. Review the details below.')
                      : t('categories.import.summary_success', 'All rows were processed successfully.')}
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
                    {t('categories.import.error_details', 'First {{count}} errors', { count: Math.min(importSummary.errors.length, 5) })}
                  </p>
                  <ul className="space-y-1 rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-error-600 dark:border-error/30 dark:bg-error/10">
                    {importSummary.errors.slice(0, 5).map((err, index) => (
                      <li key={`${err.row}-${index}`}>
                        {t('categories.import.error_row', 'Row {{row}}: {{message}}', {
                          row: err.row,
                          message: err.message,
                        })}
                      </li>
                    ))}
                  </ul>
                  {importSummary.errors.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('categories.import.more_errors', '+{{count}} additional errors not shown.', {
                        count: importSummary.errors.length - 5,
                      })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <footer className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isBusy}>
            {importSummary && !dryRun ? t('common.close', 'Close') : t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            startIcon={<FiUpload />}
            disabled={!selectedFile || isBusy}
            isLoading={isBusy}
          >
            {dryRun
              ? t('categories.import.run_validation', 'Validate file')
              : t('categories.import.start_import', 'Start import')}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default CategoryImportModal;
