import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiImage, FiInfo } from 'react-icons/fi';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../hooks/useSettings';
import { UploadService } from '../../utils/upload';

interface AssetConfig {
  key: string;
  title: string;
  description: string;
  recommendedSize: string;
  maxSize: number; // in MB
  group: string;
  acceptedFormats: string[];
  guidelines: string[];
}

const ASSET_CONFIGS: AssetConfig[] = [
  {
    key: 'site.logo',
    title: 'brand.assets.main_logo.title',
    description: 'brand.assets.main_logo.description',
    recommendedSize: '200x60px',
    maxSize: 5,
    group: 'general',
    acceptedFormats: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
    guidelines: [
      'brand.assets.main_logo.guidelines.0',
      'brand.assets.main_logo.guidelines.1',
      'brand.assets.main_logo.guidelines.2'
    ]
  },
  {
    key: 'site.favicon',
    title: 'brand.assets.favicon.title',
    description: 'brand.assets.favicon.description',
    recommendedSize: '32x32px or 16x16px',
    maxSize: 1,
    group: 'general',
    acceptedFormats: ['image/x-icon', 'image/png', 'image/jpeg'],
    guidelines: [
      'brand.assets.favicon.guidelines.0',
      'brand.assets.favicon.guidelines.1',
      'brand.assets.favicon.guidelines.2'
    ]
  },
  {
    key: 'site.footer_logo',
    title: 'brand.assets.footer_logo.title',
    description: 'brand.assets.footer_logo.description',
    recommendedSize: '150x45px',
    maxSize: 3,
    group: 'general',
    acceptedFormats: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
    guidelines: [
      'brand.assets.footer_logo.guidelines.0',
      'brand.assets.footer_logo.guidelines.1',
      'brand.assets.footer_logo.guidelines.2'
    ]
  },
  {
    key: 'site.og_image',
    title: 'brand.assets.social_share_image.title',
    description: 'brand.assets.social_share_image.description',
    recommendedSize: '1200x630px',
    maxSize: 8,
    group: 'general',
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    guidelines: [
      'brand.assets.social_share_image.guidelines.0',
      'brand.assets.social_share_image.guidelines.1',
      'brand.assets.social_share_image.guidelines.2'
    ]
  },
  {
    key: 'site.login_background',
    title: 'brand.assets.login_background.title',
    description: 'brand.assets.login_background.description',
    recommendedSize: '1920x1080px',
    maxSize: 10,
    group: 'general',
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    guidelines: [
      'brand.assets.login_background.guidelines.0',
      'brand.assets.login_background.guidelines.1',
      'brand.assets.login_background.guidelines.2'
    ]
  }
];

interface AssetUploadCardProps {
  config: AssetConfig;
  currentValue: string;
  onUpdate: (key: string, value: string) => Promise<void>;
  isUploading: boolean;
  onUploadStart: (key: string) => void;
  onUploadEnd: (key: string) => void;
}

const AssetUploadCard: React.FC<AssetUploadCardProps> = ({
  config,
  currentValue,
  onUpdate,
  isUploading,
  onUploadStart,
  onUploadEnd
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!config.acceptedFormats.includes(file.type)) {
      addToast({
        title: t('media.invalidFileType', 'Invalid file type'),
        description: `${config.title} accepts: ${config.acceptedFormats.join(', ')}`,
        type: 'error'
      });
      return;
    }

    // Validate file size
    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      addToast({
        title: t('media.fileTooLarge', 'File too large'),
        description: `${config.title} must be smaller than ${config.maxSize}MB`,
        type: 'error'
      });
      return;
    }

    onUploadStart(config.key);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await UploadService.uploadSingle(file, {
        folder: 'site-assets',
        alt: t(config.title, config.title),
        caption: t(config.description, config.description)
      });

      if (result.success && result.data?.[0]) {
        const assetUrl = result.data[0].url;
        await onUpdate(config.key, assetUrl);
        addToast({
          title: t('assets.upload_success', 'Asset uploaded successfully'),
          description: `${config.title} has been updated`,
          type: 'success'
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Asset upload error:', error);
      addToast({
        title: t('assets.upload_failed', 'Asset upload failed'),
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        type: 'error'
      });
      setPreviewUrl(null);
    } finally {
      onUploadEnd(config.key);
      event.target.value = '';
    }
  };

  const handleRemove = async () => {
    try {
      await onUpdate(config.key, '');
      setPreviewUrl(null);
      addToast({
        title: t('assets.removed', 'Asset removed'),
        description: `${config.title} has been removed`,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: t('assets.remove_failed', 'Remove failed'),
        description: `Failed to remove ${config.title}`,
        type: 'error'
      });
    }
  };

  const displayUrl = previewUrl || currentValue;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t(config.title, config.title)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t(config.description, config.description)}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-400">
            <FiInfo className="w-3 h-3 mr-1" />
            <span>{t('brand.recommended_size', 'Recommended')}: {config.recommendedSize}</span>
          </div>
        </div>
      </div>

      {/* Current Asset Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-3 flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('brand.current_asset', 'Current Asset')}
          </h4>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 h-[180px] flex items-center justify-center">
            {displayUrl ? (
              <div className="flex flex-col items-center space-y-3">
                <img
                  src={displayUrl}
                  alt={t(config.title, config.title)}
                  className="max-h-20 max-w-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700"
                  disabled={isUploading}
                >
                  <FiX className="w-4 h-4 mr-1" />
                  {t('brand.remove', 'Remove')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FiImage className="w-12 h-12 mb-2" />
                <p className="text-sm">{t('brand.no_asset_uploaded', 'No {asset} uploaded').replace('{asset}', config.title.toLowerCase())}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-3 flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('brand.upload_new_asset', 'Upload New Asset')}
          </h4>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors h-[180px] flex items-center justify-center">
            <input
              type="file"
              accept={config.acceptedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              id={`${config.key}-upload-input`}
              disabled={isUploading}
            />
            <label
              htmlFor={`${config.key}-upload-input`}
              className={`cursor-pointer block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiUpload className={`w-8 h-8 mx-auto mb-3 text-gray-400 ${isUploading ? 'animate-spin' : ''}`} />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isUploading
                  ? t('brand.uploading', 'Uploading...')
                  : t('brand.click_to_upload', 'Click to upload')
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t('brand.max_size', 'Max {size}MB').replace('{size}', config.maxSize.toString())}
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      {config.guidelines.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('brand.guidelines', 'Guidelines')}
          </h5>
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            {config.guidelines.map((guideline, index) => (
              <div key={index} className="flex items-center text-xs">
                <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                <span>{t(guideline, guideline)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SiteAssetsManager: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const { groupedSettings, updateSetting, createSetting } = useSettings();
  const [assetValues, setAssetValues] = useState<Record<string, string>>({});
  const [assetSettingIds, setAssetSettingIds] = useState<Record<string, string>>({});
  const [uploadingAssets, setUploadingAssets] = useState<Set<string>>(new Set());

  // Load existing asset values
  useEffect(() => {
    if (groupedSettings) {
      const generalSettings = groupedSettings.general || [];
      const values: Record<string, string> = {};
      const settingIds: Record<string, string> = {};

      ASSET_CONFIGS.forEach(config => {
        const setting = generalSettings.find(s => s.key === config.key);
        if (setting) {
          values[config.key] = setting.value || '';
          settingIds[config.key] = setting.id!;
        } else {
          values[config.key] = '';
        }
      });

      setAssetValues(values);
      setAssetSettingIds(settingIds);
    }
  }, [groupedSettings]);

  const handleAssetUpdate = async (key: string, value: string) => {
    try {
      const settingId = assetSettingIds[key];

      if (settingId) {
        // Update existing setting
        await updateSetting(settingId, { value });
      } else {
        // Create new setting
        const config = ASSET_CONFIGS.find(c => c.key === key)!;
        await createSetting({
          key,
          value,
          type: 'string',
          description: config.description,
          group: config.group,
          isPublic: true
        });
      }

      setAssetValues(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update asset setting:', error);
      throw error;
    }
  };

  const handleUploadStart = (key: string) => {
    setUploadingAssets(prev => new Set([...prev, key]));
  };

  const handleUploadEnd = (key: string) => {
    setUploadingAssets(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('brand.page_title', 'Brand & Site Assets')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('brand.page_description', 'Manage your website\'s visual identity including logos, favicons, and other brand assets. All uploads are optimized and stored securely.')}
        </p>
      </div>

      {/* Asset Upload Cards */}
      {ASSET_CONFIGS.map(config => (
        <AssetUploadCard
          key={config.key}
          config={config}
          currentValue={assetValues[config.key] || ''}
          onUpdate={handleAssetUpdate}
          isUploading={uploadingAssets.has(config.key)}
          onUploadStart={handleUploadStart}
          onUploadEnd={handleUploadEnd}
        />
      ))}
    </div>
  );
};