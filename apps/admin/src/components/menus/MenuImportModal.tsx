import React, { useState, useEffect } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { trpc } from '@admin/utils/trpc';
import { Modal } from '@admin/components/common/Modal';
import { Button } from '@admin/components/common/Button';
import { Checkbox } from '@admin/components/common/Checkbox';
import { Label } from '@admin/components/common/Label';
import { useToast } from '@admin/contexts/ToastContext';
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiLoader,
    FiXCircle,
    FiFileText
} from 'react-icons/fi';
import { cn } from '@admin/lib/utils';

interface MenuImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const MenuImportModal: React.FC<MenuImportModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
}) => {
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [overrideExisting, setOverrideExisting] = useState(false);
    const [dryRun, setDryRun] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');
    const [summary, setSummary] = useState<any>(null);

    const importMutation = trpc.adminMenus.importFromExcel.useMutation();
    const downloadTemplateQuery = trpc.adminMenus.downloadExcelTemplate.useQuery(
        {},
        { enabled: false }
    );

    const { data: jobResp } = trpc.adminImport.getJobStatus.useQuery(
        { id: jobId as string },
        {
            enabled: !!jobId && (status === 'PROCESSING'),
            refetchInterval: (data: any) => {
                const job = data?.data;
                if (job?.status === 'COMPLETED' || job?.status === 'FAILED') {
                    return false;
                }
                return 2000;
            },
        }
    );

    useEffect(() => {
        const data = jobResp as any;
        if (data?.data) {
            const job = data.data;
            setProgress(job.progress);
            if (job.status === 'COMPLETED') {
                setStatus('COMPLETED');
                setSummary(job.result);
                if (!dryRun) {
                    onSuccess?.();
                }
            } else if (job.status === 'FAILED') {
                setStatus('FAILED');
                setSummary(job.result);
            }
        }
    }, [jobResp, dryRun, onSuccess]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const result = await downloadTemplateQuery.refetch();
            const resultData = result.data as any;
            if (resultData) {
                const { data, filename, mimeType } = resultData;
                const blob = new Blob([Uint8Array.from(atob(data), c => c.charCodeAt(0))], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            addToast({
                title: t('menus.import.failed', 'Import failed'),
                description: t('common.errors.somethingWentWrong', 'Something went wrong'),
                type: 'error',
            });
        }
    };

    const handleImport = async () => {
        if (!file) return;

        try {
            setIsImporting(true);
            setStatus('PROCESSING');
            setProgress(0);
            setSummary(null);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target?.result as string;
                const response = await importMutation.mutateAsync({
                    fileName: file.name,
                    fileData: base64Data,
                    overrideExisting,
                    dryRun,
                }) as any;

                if (response.success && response.data?.jobId) {
                    setJobId(response.data.jobId);
                } else {
                    setStatus('FAILED');
                    setIsImporting(false);
                    addToast({
                        title: t('menus.import.failed', 'Import failed'),
                        type: 'error',
                    });
                }
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            setStatus('FAILED');
            setIsImporting(false);
            addToast({
                title: t('menus.import.failed', 'Import failed'),
                description: error.message,
                type: 'error',
            });
        }
    };

    const reset = () => {
        setFile(null);
        setJobId(null);
        setProgress(0);
        setStatus('IDLE');
        setSummary(null);
        setIsImporting(false);
    };

    const handleClose = () => {
        if (status !== 'PROCESSING') {
            onOpenChange(false);
            setTimeout(reset, 300);
        }
    };

    return (
        <Modal isOpen={open} onClose={handleClose} size="lg">
            <div className="flex flex-col h-full max-h-[85vh]">
                <div className="p-6 pb-2">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FiUpload className="w-6 h-6 text-blue-600" />
                        {t('menus.import.title', 'Import menus from Excel')}
                    </h2>
                    <p className="text-base text-gray-500 mt-1">
                        {t('menus.import.subtitle', 'Upload an Excel file (.xlsx) to create or update menu items in bulk.')}
                    </p>
                </div>

                <div className="flex-1 px-6 py-4 overflow-y-auto">
                    <div className="space-y-6">
                        {status === 'IDLE' && (
                            <>
                                {/* File Upload Zone */}
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-50",
                                        file ? "border-blue-600 bg-blue-50/50" : "border-gray-200"
                                    )}
                                    onClick={() => document.getElementById('import-file-input')?.click()}
                                >
                                    <input
                                        id="import-file-input"
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <FiFileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {file ? file.name : t('menus.import.drop_zone', 'Drop your Excel file here or click to upload')}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {file ? t('menus.import.replace_hint', 'Click to replace file') : t('menus.import.drop_zone_hint', 'Standard Excel (.xlsx) files are supported')}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {t('menus.import.supported_formats', 'Make sure the columns match our template')}
                                        </p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="overrideExisting"
                                                checked={overrideExisting}
                                                onCheckedChange={(checked) => setOverrideExisting(checked)}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1 leading-none">
                                                <Label htmlFor="overrideExisting" className="text-sm font-semibold m-0">
                                                    {t('menus.import.override_existing', 'Override existing items')}
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    {t('menus.import.override_hint', 'Update existing menus if the same ID is found')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="dryRun"
                                                checked={dryRun}
                                                onCheckedChange={(checked) => setDryRun(checked)}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1 leading-none">
                                                <Label htmlFor="dryRun" className="text-sm font-semibold m-0">
                                                    {t('menus.import.dry_run', 'Dry run')}
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    {t('menus.import.dry_run_hint', 'Check for errors without making any changes')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 space-y-3">
                                    <h4 className="text-sm font-bold flex items-center gap-2 text-blue-700">
                                        <FiAlertCircle className="w-4 h-4" />
                                        {t('menus.import.instructions_title', 'Formatting guidelines')}
                                    </h4>
                                    <ul className="text-sm space-y-2 text-gray-600 list-disc pl-4">
                                        <li>{t('menus.import.instructions_row1', 'Each row represents a single menu item.')}</li>
                                        <li>{t('menus.import.instructions_row2', 'Parent ID should be a UUID if the menu item is a sub-menu.')}</li>
                                        <li>{t('menus.import.instructions_row3', 'Ensure your column headers match exactly.')}</li>
                                    </ul>
                                </div>

                                <div className="flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        onClick={handleDownloadTemplate}
                                        disabled={downloadTemplateQuery.isFetching}
                                    >
                                        {downloadTemplateQuery.isFetching ? (
                                            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <FiDownload className="mr-2 h-4 w-4" />
                                        )}
                                        {t('menus.import.download_template', 'Download Template')}
                                    </Button>
                                </div>
                            </>
                        )}

                        {status === 'PROCESSING' && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                                        {progress}%
                                    </div>
                                </div>
                                <div className="text-center space-y-4 w-full max-w-sm">
                                    <h3 className="text-xl font-bold text-gray-900">{t('common.status.processing', 'Processing')}</h3>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {t('common.status.pleaseWaitImport', 'Please wait while we process your file')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {(status === 'COMPLETED' || status === 'FAILED') && summary && (
                            <div className="space-y-6">
                                <div className={cn(
                                    "p-6 rounded-2xl flex items-center gap-4 border",
                                    status === 'COMPLETED' ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                                )}>
                                    {status === 'COMPLETED' ? (
                                        <FiCheckCircle className="w-10 h-10 text-green-600 shrink-0" />
                                    ) : (
                                        <FiXCircle className="w-10 h-10 text-red-600 shrink-0" />
                                    )}
                                    <div>
                                        <h3 className={cn(
                                            "text-xl font-bold",
                                            status === 'COMPLETED' ? "text-green-900" : "text-red-900"
                                        )}>
                                            {dryRun ? t('menus.import.dry_run_complete', 'Dry Run Complete') : (status === 'COMPLETED' ? t('menus.import.success', 'Import Successful') : t('menus.import.failed', 'Import Failed'))}
                                        </h3>
                                        <p className={cn(
                                            "text-sm",
                                            status === 'COMPLETED' ? "text-green-700" : "text-red-700"
                                        )}>
                                            {summary.errors?.length > 0 ? t('menus.import.summary_with_errors', 'Completed with errors') : t('menus.import.summary_success', 'Import completed successfully')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t('menus.import.total_rows', 'Total Rows')}</p>
                                        <p className="text-2xl font-black text-gray-900 mt-1">{summary.totalRows || 0}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                        <p className="text-xs text-green-600 font-medium uppercase tracking-wider">{t('menus.import.imported', 'Imported')}</p>
                                        <p className="text-2xl font-black text-green-600 mt-1">{summary.imported || 0}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">{t('menus.import.updated', 'Updated')}</p>
                                        <p className="text-2xl font-black text-blue-600 mt-1">{summary.updated || 0}</p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                        <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">{t('menus.import.skipped', 'Skipped')}</p>
                                        <p className="text-2xl font-black text-amber-600 mt-1">{summary.skipped || 0}</p>
                                    </div>
                                </div>

                                {summary.errors?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-bold flex items-center gap-2 text-red-600">
                                            <FiAlertCircle className="w-4 h-4" />
                                            {t('menus.import.error_details', 'Error Details')}
                                        </h4>
                                        <div className="space-y-2">
                                            {summary.errors.slice(0, 5).map((err: any, idx: number) => (
                                                <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm font-medium text-red-700">
                                                    {t('menus.import.error_row', 'Row {{row}}: {{message}}', { row: err.row, message: err.message })}
                                                </div>
                                            ))}
                                            {summary.errors.length > 5 && (
                                                <p className="text-xs text-gray-500 pl-1 italic">
                                                    ...{summary.errors.length - 5} more errors
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-2 border-t mt-auto flex justify-end gap-3">
                    <Button variant="ghost" onClick={handleClose} disabled={status === 'PROCESSING'}>
                        {t('common.actions.cancel', 'Cancel')}
                    </Button>

                    {status === 'IDLE' && (
                        <Button
                            className="px-8"
                            onClick={handleImport}
                            disabled={!file || importMutation.isPending}
                        >
                            {importMutation.isPending ? (
                                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FiCheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {dryRun ? t('menus.import.run_validation', 'Run Validation') : t('menus.import.start_import', 'Start Import')}
                        </Button>
                    )}

                    {(status === 'COMPLETED' || status === 'FAILED') && (
                        <Button
                            className="px-8"
                            onClick={status === 'COMPLETED' ? handleClose : reset}
                        >
                            {status === 'COMPLETED' ? t('common.actions.close', 'Close') : t('common.actions.retry', 'Retry')}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
