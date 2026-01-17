import React, { useEffect, useState, useRef } from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../common/Button';
import { Toggle } from '../common/Toggle';
import { FiHash, FiCheck, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const randomSample = (length: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < length; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
};

const formatWithPreview = (format: string): string => {
    const today = new Date();
    const yearFull = today.getFullYear().toString();
    const yearShort = yearFull.slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    let dateApplied = format
        .replace(/{{YYYY}}/g, yearFull)
        .replace(/{{YY}}/g, yearShort)
        .replace(/{{MM}}/g, month)
        .replace(/{{DD}}/g, day);

    dateApplied = dateApplied.replace(/{{RAND(\d*)}}/gi, (_match, len) => {
        const length = len ? parseInt(len, 10) || 4 : 4;
        return randomSample(length);
    });

    const seqMatch = /{{SEQ(\d*)}}/i.exec(dateApplied);
    const seqLength = seqMatch?.[1] ? parseInt(seqMatch[1], 10) || 4 : 4;
    const seq = '1'.padStart(seqLength, '0');

    return dateApplied.replace(/{{SEQ(\d*)}}/i, seq);
};

export const OrderNumberSettings: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const { groupedSettings, updateSetting, createSetting, isLoading } = useSettings({ group: 'orders' });
    const [format, setFormat] = useState('ORD{{YY}}{{MM}}{{DD}}{{SEQ4}}');
    const [lockSequence, setLockSequence] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

    const orderNumberSetting = groupedSettings?.orders?.find(s => s.key === 'orders.order_number_format');

    useEffect(() => {
        if (orderNumberSetting?.value) {
            setFormat(orderNumberSetting.value);
        }
    }, [orderNumberSetting]);

    const ensureSeqToken = (value: string): string => {
        if (!lockSequence) return value;
        return /{{SEQ/i.test(value) ? value : `${value}{{SEQ4}}`;
    };

    const handleSave = async () => {
        const valueToSave = ensureSeqToken(format.trim() || 'ORD{{YY}}{{MM}}{{DD}}{{SEQ4}}');
        setFormat(valueToSave);
        setIsSaving(true);

        try {
            if (orderNumberSetting) {
                await updateSetting(orderNumberSetting.id!, { value: valueToSave });
            } else {
                await createSetting({
                    key: 'orders.order_number_format',
                    value: valueToSave,
                    type: 'string',
                    group: 'orders',
                    isPublic: false,
                    description: 'Order number format using tokens like {{YYYY}}, {{YY}}, {{MM}}, {{DD}}, {{SEQ4}}',
                });
            }

            addToast({
                type: 'success',
                title: t('common.saved', 'Saved'),
                description: t('settings.order_format_saved', 'Order number format saved successfully.'),
            });
        } catch (error) {
            console.error('Failed to save order settings', error);
            addToast({
                type: 'error',
                title: t('common.error', 'Error'),
                description: t('settings.order_format_save_failed', 'Failed to save order number format.'),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const defaultFormat = 'ORD{{YY}}{{MM}}{{DD}}{{SEQ4}}';
        setFormat(defaultFormat);
    };

    const preview = formatWithPreview(ensureSeqToken(format));

    const tokenOptions = [
        { key: '{{YYYY}}', desc: t('settings.descriptions.tokens.year_full', 'Year 4-digits') },
        { key: '{{YY}}', desc: t('settings.descriptions.tokens.year_short', 'Year 2-digits') },
        { key: '{{MM}}', desc: t('settings.descriptions.tokens.month', 'Month 2-digits') },
        { key: '{{DD}}', desc: t('settings.descriptions.tokens.day', 'Day 2-digits') },
        { key: '{{SEQ4}}', desc: t('settings.descriptions.tokens.sequence', 'Sequence number') },
        { key: '{{RAND4}}', desc: t('settings.descriptions.tokens.random', 'Random string') },
    ];

    const insertTokenAtCaret = (token: string) => {
        const current = format || '';
        const { start, end } = selection;
        const safeStart = Math.max(0, Math.min(start, current.length));
        const safeEnd = Math.max(0, Math.min(end, current.length));
        const nextValue = current.slice(0, safeStart) + token + current.slice(safeEnd);
        setFormat(nextValue);

        requestAnimationFrame(() => {
            if (inputRef.current) {
                const newPos = safeStart + token.length;
                inputRef.current.setSelectionRange(newPos, newPos);
                inputRef.current.focus();
                setSelection({ start: newPos, end: newPos });
            }
        });
    };

    const handleDropToken = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        const token = e.dataTransfer.getData('text/plain');
        if (!token) return;
        const caretPos = e.currentTarget.selectionStart ?? format.length;
        setSelection({ start: caretPos, end: caretPos });
        insertTokenAtCaret(token);
    };

    const handleSelectChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        setSelection({
            start: target.selectionStart ?? 0,
            end: target.selectionEnd ?? 0,
        });
    };

    if (isLoading && !groupedSettings) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-lg shadow-md p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FiHash className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            {t('settings.keys.orders.order_number_format_label', 'Order Number Format')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('settings.keys.orders.order_number_format_hint', 'Customize how your order numbers look using tokens.')}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        {t('settings.descriptions.pattern', 'Format Pattern')}
                    </label>
                    <input
                        type="text"
                        ref={inputRef}
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        onSelect={handleSelectChange}
                        onClick={handleSelectChange}
                        onKeyUp={handleSelectChange}
                        onDrop={handleDropToken}
                        onDragOver={(e) => e.preventDefault()}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="ORD{{YY}}{{MM}}{{DD}}{{SEQ4}}"
                    />
                    <div className="flex items-center gap-3">
                        <Toggle
                            checked={lockSequence}
                            onChange={() => setLockSequence(!lockSequence)}
                            size="sm"
                        />
                        <span className="text-sm text-gray-600">
                            {t('settings.descriptions.require_sequence', 'Require {{SEQn}} to identify uniqueness')}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            {t('settings.descriptions.live_preview', 'Live Preview')}
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-mono text-lg">
                            <FiCheck className="w-5 h-5" />
                            <span>{preview}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {t('settings.descriptions.preview_note', 'Using current date for preview')}
                        </p>
                    </div>

                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            {t('settings.descriptions.available_tokens', 'Available Tokens')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {tokenOptions.map(token => (
                                <span
                                    key={token.key}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', token.key)}
                                    onClick={() => insertTokenAtCaret(token.key)}
                                    className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors"
                                    title={token.desc}
                                >
                                    <code className="font-mono text-blue-600">{token.key}</code>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={isSaving}
                        startIcon={<FiCheck />}
                    >
                        {t('common.save', 'Save')}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        startIcon={<FiRefreshCw />}
                        disabled={isSaving}
                    >
                        {t('common.reset', 'Reset')}
                    </Button>
                    {!/{{SEQ/i.test(format) && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm ml-auto">
                            <FiAlertCircle className="w-4 h-4" />
                            {t('settings.descriptions.sequence_warning', 'Sequence token recommended')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
