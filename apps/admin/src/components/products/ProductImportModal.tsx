import React, { useCallback, useId, useMemo, useState } from 'react';
import { FiUpload, FiDownload, FiFileText, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';

type ProductStatusOption = 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'DISCONTINUED';

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

interface ProductImportModalProps {
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
  createdProductIds?: string[];
  updatedProductIds?: string[];
}

const statusOptions: Array<{ value: ProductStatusOption; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const fileInputId = useId();
  const statusSelectId = useId();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<ProductStatusOption>('DRAFT');
  const [defaultIsActive, setDefaultIsActive] = useState(true);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [readingFile, setReadingFile] = useState(false);

  const selectedFileMeta = useMemo(() => {
    if (!selectedFile) return null;

    return {
      sizeLabel: formatFileSize(selectedFile.size),
      typeLabel: selectedFile.type ? selectedFile.type.toUpperCase() : null,
    };
  }, [selectedFile]);

  const importMutation = trpc.adminProducts.importFromExcel.useMutation();

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImportSummary(null);
    setOverrideExisting(false);
    setDryRun(false);
    setDefaultStatus('DRAFT');
    setDefaultIsActive(true);
    setReadingFile(false);
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

  const handleDownloadTemplate = () => {
    const headers = [
      'Product Name',
      'Product SKU',
      'Description',
      'Status',
      'Is Active',
      'Is Featured',
      'Brand ID',
      'Category IDs',
      'Product Image URLs',
      'Variant Name',
      'Variant SKU',
      'Variant Price',
      'Variant Compare Price',
      'Variant Cost',
      'Stock Quantity',
      'Low Stock Threshold',
      'Track Inventory',
      'Allow Backorders',
      'Tags',
      'Variant Thumbnail URL',
      'Variant Sort Order',
      'Variant Attribute: Color',
      'Variant Attribute: Size'
    ];

    const sampleRow = [
      'Sample Product',
      'SKU-001',
      'Short description for the product',
      'ACTIVE',
      'TRUE',
      'FALSE',
      '',
      'category-id-1,category-id-2',
      'https://example.com/sample-product.jpg|https://example.com/sample-product-alt.jpg',
      'Default Variant',
      'SKU-001-RED-L',
      '199000',
      '',
      '',
      '50',
      '5',
      'TRUE',
      'FALSE',
      'sample,product',
      'https://example.com/sample-variant-thumb.jpg',
      '0',
      'Red',
      'L'
    ];

    const csvContent = [headers, sampleRow]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summaryCards = useMemo(() => {
    if (!importSummary) return [];

    return [
      {
        label: t('products.import.total_rows', 'Total rows'),
        value: importSummary.totalRows ?? 0,
      },
      {
        label: t('products.import.imported', 'Imported'),
        value: importSummary.imported ?? 0,
      },
      {
        label: t('products.import.updated', 'Updated'),
        value: importSummary.updated ?? 0,
      },
      {
        label: t('products.import.skipped', 'Skipped'),
        value: importSummary.skipped ?? 0,
      },
      {
        label: t('products.import.duplicates', 'Duplicates'),
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
        description: t('products.import.select_file_error', 'Please select a file to import.'),
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
        defaultStatus,
        defaultIsActive,
      });

      const summary = (response as any)?.data as ImportSummary | undefined;
      setImportSummary(summary ?? null);

      if (summary) {
        const descriptionParts = [
          t('products.import.imported_count', '{{count}} created', { count: summary.imported ?? 0 }),
        ];
        if ((summary.updated ?? 0) > 0) {
          descriptionParts.push(
            t('products.import.updated_count', '{{count}} updated', { count: summary.updated ?? 0 })
          );
        }
        if ((summary.errors?.length ?? 0) > 0) {
          descriptionParts.push(
            t('products.import.errors_count', '{{count}} errors', { count: summary.errors?.length ?? 0 })
          );
        }

        addToast({
          type: 'success',
          title: dryRun
            ? t('products.import.dry_run_complete', 'Dry-run completed')
            : t('products.import.success', 'Import completed'),
          description: descriptionParts.join(' • '),
        });
      } else {
        addToast({
          type: 'success',
          title: t('products.import.success', 'Import completed'),
        });
      }

      if (!dryRun) {
        onImportSuccess?.();
      }
    } catch (error: any) {
      const message = error?.message || t('products.import.failed', 'Failed to import products.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    }
  };

  const isBusy = importMutation.isPending || readingFile;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" modalId="product-import-modal">
      <form onSubmit={handleSubmit} className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:pr-10">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              {t('products.import.title', 'Import products from Excel')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('products.import.subtitle', 'Upload an Excel (.xlsx) or CSV file exported from Excel to create or update products in bulk.')}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            startIcon={<FiDownload />}
            onClick={handleDownloadTemplate}
            className="self-start sm:self-auto"
          >
            {t('products.import.download_template', 'Download template')}
          </Button>
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
                    {t('products.import.file_label', 'Select spreadsheet file')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('products.import.supported_formats', 'Supported formats: .xlsx, .xls, .csv')}
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
                        : t('products.import.drop_zone', 'Click to choose a file')}
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
                          {t('products.import.replace_hint', 'Click to replace file')}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('products.import.drop_zone_hint', 'Drag and drop your file here or browse from your device.')}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="group relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={statusSelectId}
                      className="text-sm font-semibold text-gray-800 dark:text-gray-100"
                    >
                      {t('products.import.default_status', 'Default product status')}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(
                        'products.import.default_status_hint',
                        'Used when the spreadsheet does not include a status column.'
                      )}
                    </p>
                  </div>
                  <Select
                    id={statusSelectId}
                    value={defaultStatus}
                    onChange={(value) => setDefaultStatus(value as ProductStatusOption)}
                    options={statusOptions.map((option) => ({
                      value: option.value,
                      label: t(`products.status.${option.value.toLowerCase()}`, option.label),
                    }))}
                    size="lg"
                    className="flex-1"
                  />
                </div>

                <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-6 py-6 transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:bg-gray-900/60">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {t('products.import.default_active', 'Activate imported products')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('products.import.default_active_hint', 'Disable if you prefer to review products before publishing.')}
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
                      {t('products.import.override_existing', 'Override existing products')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('products.import.override_hint', 'If a SKU already exists, update that product instead of skipping it.')}
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
                      {t('products.import.dry_run', 'Dry-run (no changes)')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('products.import.dry_run_hint', 'Validate the file, see the summary, but do not create or update products.')}
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
                    {t('products.import.instructions_title', 'Formatting guidelines')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('products.import.instructions_subtitle', 'Follow these tips to avoid common formatting issues before you upload.')}
                  </p>
                </div>
                <ul className="list-disc space-y-1 text-xs text-gray-500 dark:text-gray-400 pl-4">
                  <li>{t('products.import.instructions_row1', 'Each row represents a single product variant. Products are grouped by Product SKU or by Product Name when SKU is empty.')}</li>
                  <li>{t('products.import.instructions_row2', 'Category IDs should be UUIDs separated by commas (e.g. id-1,id-2).')}</li>
                  <li>{t('products.import.instructions_row3', 'Add columns like “Variant Attribute: Color” and use the attribute value or value ID for each variant.')}</li>
                  <li>{t('products.import.instructions_row4', 'Excel files saved as CSV are fully supported.')}</li>
                  <li>{t('products.import.instructions_row5', 'Leave optional columns blank if you do not need them.')}</li>
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
                      ? t('products.import.summary_dry_run', 'Dry-run summary')
                      : t('products.import.summary_title', 'Import summary')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {importSummary.errors && importSummary.errors.length > 0
                      ? t('products.import.summary_with_errors', 'Some rows could not be processed. Review the details below.')
                      : t('products.import.summary_success', 'All rows were processed successfully.')}
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
                    {t('products.import.error_details', 'First {{count}} errors', { count: Math.min(importSummary.errors.length, 5) })}
                  </p>
                  <ul className="space-y-1 rounded-lg border border-error/20 bg-error/5 p-3 text-xs text-error-600 dark:border-error/30 dark:bg-error/10">
                    {importSummary.errors.slice(0, 5).map((err, index) => (
                      <li key={`${err.row}-${index}`}>
                        {t('products.import.error_row', 'Row {{row}}: {{message}}', {
                          row: err.row,
                          message: err.message,
                        })}
                      </li>
                    ))}
                  </ul>
                  {importSummary.errors.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('products.import.more_errors', '+{{count}} additional errors not shown.', {
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
              ? t('products.import.run_validation', 'Validate file')
              : t('products.import.start_import', 'Start import')}
          </Button>
        </footer>
      </form>
    </Modal>
  );
};

export default ProductImportModal;
