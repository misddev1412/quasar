import React, { useEffect, useMemo, useRef, useState } from 'react';
import { withAdminSeo } from '../../components/SEO/withAdminSeo';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FiSettings, FiHome, FiHash, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Toggle } from '../../components/common/Toggle';

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

const OrderSettingsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const { groupedSettings, updateSetting, createSetting, isLoading } = useSettings({ group: 'orders' });
  const [format, setFormat] = useState('ORD{{YY}}{{MM}}{{DD}}{{SEQ4}}');
  const [lockSequence, setLockSequence] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('navigation.settings', 'Settings'),
      href: '/settings',
      icon: <FiSettings className="w-4 h-4" />,
    },
    {
      label: t('navigation.order_settings', 'Order Settings'),
      icon: <FiHash className="w-4 h-4" />,
    },
  ]), [t]);

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
        title: t('common.saved', 'Đã lưu'),
        description: t('settings.order_format_saved', 'Định dạng mã đơn hàng đã được cập nhật.'),
      });
    } catch (error) {
      console.error('Failed to save order settings', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Lỗi'),
        description: t('settings.order_format_save_failed', 'Không thể lưu định dạng mã đơn hàng.'),
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
    { key: '{{YYYY}}', desc: t('settings.tokens.year_full', 'Năm 4 chữ số') },
    { key: '{{YY}}', desc: t('settings.tokens.year_short', 'Năm 2 chữ số') },
    { key: '{{MM}}', desc: t('settings.tokens.month', 'Tháng 2 chữ số') },
    { key: '{{DD}}', desc: t('settings.tokens.day', 'Ngày 2 chữ số') },
    { key: '{{SEQ4}}', desc: t('settings.tokens.sequence', 'Số thứ tự, pad 4') },
    { key: '{{RAND4}}', desc: t('settings.tokens.random', 'Chuỗi ngẫu nhiên, mặc định 4 ký tự') },
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BaseLayout
      title={t('navigation.order_settings', 'Cài đặt đơn hàng')}
      description={t('settings.order_settings_description', 'Quản lý định dạng và thông số liên quan đến đơn hàng')}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FiHash className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('settings.order_number_format_label', 'Định dạng mã đơn hàng')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.order_number_format_hint', 'Dùng các token {{YYYY}}, {{YY}}, {{MM}}, {{DD}}, {{SEQn}} để tạo mã tự động.')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {t('settings.pattern', 'Mẫu định dạng')}
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
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              placeholder="ORD{{YY}}{{MM}}{{DD}}{{SEQ4}}"
            />
            <div className="flex items-center gap-3">
              <Toggle
                checked={lockSequence}
                onChange={() => setLockSequence(!lockSequence)}
                size="sm"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('settings.require_sequence', 'Bắt buộc kèm {{SEQn}} để tránh trùng lặp')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {t('settings.live_preview', 'Xem trước')}
              </p>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 font-mono text-lg">
                <FiCheck className="w-5 h-5" />
                <span>{preview}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('settings.preview_note', 'Dùng ngày hôm nay và số thứ tự 1 để minh họa.')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {t('settings.available_tokens', 'Token khả dụng')}
              </p>
              <div className="flex flex-wrap gap-2">
                {tokenOptions.map(token => (
                  <span
                    key={token.key}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', token.key)}
                    onClick={() => insertTokenAtCaret(token.key)}
                    className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm text-gray-800 dark:text-gray-200 cursor-pointer hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-300"
                  >
                    <code className="font-mono text-blue-600 dark:text-blue-300">{token.key}</code>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{token.desc}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              startIcon={<FiCheck />}
            >
              {t('common.save', 'Lưu')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              startIcon={<FiRefreshCw />}
              disabled={isSaving}
            >
              {t('common.reset', 'Đặt lại')}
            </Button>
            {!/{{SEQ/i.test(format) && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <FiAlertCircle className="w-4 h-4" />
                {t('settings.sequence_warning', 'Khuyến nghị thêm {{SEQn}} để đảm bảo mã không trùng.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(OrderSettingsPage, {
  title: 'Order Settings | Quasar Admin',
  description: 'Manage order-related configuration',
  path: '/settings/orders',
});
