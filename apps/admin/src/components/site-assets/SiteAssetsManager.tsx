import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiImage, FiInfo } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Switch } from '../common/Switch';
import { MediaManager } from '../common/MediaManager';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../hooks/useSettings';

interface AssetConfig {
  key: string;
  title: string;
  description: string;
  recommendedSize: string;
  maxSize: number; // in MB
  group: string;
  acceptedFormats: string[];
  guidelines: string[];
  supportsAltText?: boolean; // Whether this asset supports alt text configuration
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
    ],
    supportsAltText: true
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
    ],
    supportsAltText: true
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
    ],
    supportsAltText: true
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
  logoTextSettings?: {
    showText: boolean;
    textContent: string;
    onShowTextChange: (show: boolean) => void;
    onTextContentChange: (text: string) => void;
    onSaveShowText: () => Promise<void>;
    onSaveTextContent: () => Promise<void>;
    hasShowTextChanges?: boolean;
    hasTextContentChanges?: boolean;
  };
  altTextSettings?: {
    altText: string;
    onAltTextChange: (text: string) => void;
    onSave: () => Promise<void>;
    hasChanges?: boolean;
  };
}

const AssetUploadCard: React.FC<AssetUploadCardProps> = ({
  config,
  currentValue,
  onUpdate,
  isUploading,
  onUploadStart,
  onUploadEnd,
  logoTextSettings,
  altTextSettings
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  const handleMediaSelect = async (file: any) => {
    try {
      const selectedFile = Array.isArray(file) ? file[0] : file;
      if (!selectedFile || !selectedFile.url) {
        return;
      }

      // Validate file type if needed
      if (config.acceptedFormats.length > 0) {
        const fileType = selectedFile.mimeType || '';
        if (!config.acceptedFormats.includes(fileType)) {
          addToast({
            title: t('media.invalidFileType', 'Invalid file type'),
            description: `${t(config.title, config.title)} accepts: ${config.acceptedFormats.join(', ')}`,
            type: 'error'
          });
          return;
        }
      }

      onUploadStart(config.key);
      await onUpdate(config.key, selectedFile.url);
      
      addToast({
        title: t('assets.upload_success', 'Asset uploaded successfully'),
        description: `${t(config.title, config.title)} has been updated`,
        type: 'success'
      });
      
      setIsMediaManagerOpen(false);
    } catch (error) {
      console.error('Asset update error:', error);
      addToast({
        title: t('assets.upload_failed', 'Asset upload failed'),
        description: error instanceof Error ? error.message : 'An error occurred during update',
        type: 'error'
      });
    } finally {
      onUploadEnd(config.key);
    }
  };

  const handleRemove = async () => {
    try {
      await onUpdate(config.key, '');
      addToast({
        title: t('assets.removed', 'Asset removed'),
        description: `${t(config.title, config.title)} has been removed`,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: t('assets.remove_failed', 'Remove failed'),
        description: `Failed to remove ${t(config.title, config.title)}`,
        type: 'error'
      });
    }
  };

  const displayUrl = currentValue;

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
            <div className="flex flex-col items-center">
              <Button
                onClick={() => setIsMediaManagerOpen(true)}
                variant="primary"
                disabled={isUploading}
                className="mb-2"
              >
                <FiImage className="w-4 h-4 mr-2" />
                {isUploading
                  ? t('brand.uploading', 'Uploading...')
                  : t('brand.select_from_media', 'Select from Media Library')
                }
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {t('brand.max_size', 'Max {size}MB').replace('{size}', config.maxSize.toString())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Text Settings - Only for main logo */}
      {config.key === 'site.logo' && logoTextSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {t('brand.logo_text_settings', 'Logo Text Settings')}
          </h5>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  {t('brand.show_text_next_to_logo', 'Show text next to logo')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('brand.show_text_next_to_logo_desc', 'Display text alongside the logo in the header')}
                </p>
              </div>
              <div className="flex-shrink-0 pt-1 flex items-center gap-2">
                <Switch
                  checked={logoTextSettings.showText}
                  onChange={logoTextSettings.onShowTextChange}
                  className="ml-auto"
                />
                {logoTextSettings.hasShowTextChanges && (
                  <Button
                    onClick={logoTextSettings.onSaveShowText}
                    variant="primary"
                    size="sm"
                  >
                    {t('common.save', 'Save')}
                  </Button>
                )}
              </div>
            </div>
            {logoTextSettings.showText && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('brand.logo_text_content', 'Text Content')}
                  </label>
                  {logoTextSettings.hasTextContentChanges && (
                    <Button
                      onClick={logoTextSettings.onSaveTextContent}
                      variant="primary"
                      size="sm"
                    >
                      {t('common.save', 'Save')}
                    </Button>
                  )}
                </div>
                <Input
                  type="text"
                  value={logoTextSettings.textContent}
                  onChange={(e) => logoTextSettings.onTextContentChange(e.target.value)}
                  placeholder={t('brand.logo_text_placeholder', 'Enter text to display next to logo')}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('brand.logo_text_hint', 'Leave empty to use site name as default')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alt Text Settings - For assets that support it */}
      {config.supportsAltText && altTextSettings && (
        <div className="mt-4 pt-4 mb-6 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {t('brand.alt_text_settings', 'Alt Text Settings')}
          </h5>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              {t('brand.alt_text_label', 'Alt Text')}
            </label>
            <Input
              type="text"
              value={altTextSettings.altText}
              onChange={(e) => altTextSettings.onAltTextChange(e.target.value)}
              placeholder={t('brand.alt_text_placeholder', 'Enter descriptive alt text for accessibility and SEO')}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('brand.alt_text_hint', 'Alt text helps screen readers and improves SEO. Leave empty to use site name as default.')}
            </p>
            {altTextSettings.hasChanges && (
              <div className="pt-2">
                <Button
                  onClick={altTextSettings.onSave}
                  variant="primary"
                  size="sm"
                >
                  {t('common.save', 'Save')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* MediaManager Modal */}
      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        accept={config.acceptedFormats.join(',')}
        maxSize={config.maxSize}
        title={t('brand.select_asset', 'Select {asset}').replace('{asset}', t(config.title, config.title))}
      />
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
  
  // Logo text settings
  const [logoShowText, setLogoShowText] = useState<boolean>(false);
  const [logoTextContent, setLogoTextContent] = useState<string>('');
  const [logoTextSettingIds, setLogoTextSettingIds] = useState<{
    showText: string | null;
    textContent: string | null;
  }>({ showText: null, textContent: null });
  
  // Pending changes for logo text
  const [pendingLogoShowText, setPendingLogoShowText] = useState<boolean | null>(null);
  const [pendingLogoTextContent, setPendingLogoTextContent] = useState<string | null>(null);

  // Alt text settings
  const [altTextValues, setAltTextValues] = useState<Record<string, string>>({});
  const [altTextSettingIds, setAltTextSettingIds] = useState<Record<string, string | null>>({});
  
  // Pending changes for alt text
  const [pendingAltTextValues, setPendingAltTextValues] = useState<Record<string, string>>({});

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

      // Load logo text settings
      const showTextSetting = generalSettings.find(s => s.key === 'site.logo_show_text');
      const textContentSetting = generalSettings.find(s => s.key === 'site.logo_text');
      
      const initialShowText = showTextSetting?.value === 'true' || false;
      const initialTextContent = textContentSetting?.value || '';
      
      setLogoShowText(initialShowText);
      setLogoTextContent(initialTextContent);
      setPendingLogoShowText(null);
      setPendingLogoTextContent(null);
      setLogoTextSettingIds({
        showText: showTextSetting?.id || null,
        textContent: textContentSetting?.id || null
      });

      // Load alt text settings
      const altTextValues: Record<string, string> = {};
      const altTextIds: Record<string, string | null> = {};
      
      ASSET_CONFIGS.forEach(config => {
        if (config.supportsAltText) {
          const altKey = `${config.key}_alt`;
          const altSetting = generalSettings.find(s => s.key === altKey);
          altTextValues[config.key] = altSetting?.value || '';
          altTextIds[config.key] = altSetting?.id || null;
        }
      });

      setAltTextValues(altTextValues);
      setAltTextSettingIds(altTextIds);
      setPendingAltTextValues({});

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

  // Logo text handlers - only update local state
  const handleLogoShowTextChange = (show: boolean) => {
    setPendingLogoShowText(show);
  };

  const handleLogoTextContentChange = (text: string) => {
    setPendingLogoTextContent(text);
  };

  // Save show text setting only
  const handleSaveShowText = async () => {
    if (pendingLogoShowText === null) return;
    
    try {
      const settingId = logoTextSettingIds.showText;
      const value = pendingLogoShowText ? 'true' : 'false';

      if (settingId) {
        await updateSetting(settingId, { value });
      } else {
        await createSetting({
          key: 'site.logo_show_text',
          value,
          type: 'boolean',
          description: 'Show text next to logo',
          group: 'general',
          isPublic: true
        });
      }

      setLogoShowText(pendingLogoShowText);
      setPendingLogoShowText(null);

      addToast({
        title: t('assets.setting_updated', 'Setting updated'),
        description: t('brand.logo_text_setting_updated', 'Logo text setting has been updated'),
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save show text setting:', error);
      addToast({
        title: t('assets.setting_update_failed', 'Update failed'),
        description: t('brand.logo_text_setting_update_failed', 'Failed to update logo text setting'),
        type: 'error'
      });
    }
  };

  // Save text content setting only
  const handleSaveTextContent = async () => {
    if (pendingLogoTextContent === null) return;
    
    try {
      const settingId = logoTextSettingIds.textContent;

      if (settingId) {
        await updateSetting(settingId, { value: pendingLogoTextContent });
      } else {
        await createSetting({
          key: 'site.logo_text',
          value: pendingLogoTextContent,
          type: 'string',
          description: 'Custom text to display next to logo',
          group: 'general',
          isPublic: true
        });
      }

      setLogoTextContent(pendingLogoTextContent);
      setPendingLogoTextContent(null);

      addToast({
        title: t('assets.setting_updated', 'Setting updated'),
        description: t('brand.logo_text_setting_updated', 'Logo text setting has been updated'),
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save text content setting:', error);
      addToast({
        title: t('assets.setting_update_failed', 'Update failed'),
        description: t('brand.logo_text_setting_update_failed', 'Failed to update logo text setting'),
        type: 'error'
      });
    }
  };

  // Alt text handlers - only update local state
  const handleAltTextChange = (assetKey: string, altText: string) => {
    setPendingAltTextValues(prev => ({ ...prev, [assetKey]: altText }));
  };

  // Save alt text setting
  const handleSaveAltText = async (assetKey: string) => {
    try {
      const altText = pendingAltTextValues[assetKey];
      if (altText === undefined) return;

      const altKey = `${assetKey}_alt`;
      const settingId = altTextSettingIds[assetKey];

      if (settingId) {
        await updateSetting(settingId, { value: altText });
      } else {
        const config = ASSET_CONFIGS.find(c => c.key === assetKey);
        await createSetting({
          key: altKey,
          value: altText,
          type: 'string',
          description: `Alt text for ${config?.title || assetKey}`,
          group: 'general',
          isPublic: true
        });
      }

      setAltTextValues(prev => ({ ...prev, [assetKey]: altText }));
      setPendingAltTextValues(prev => {
        const newPending = { ...prev };
        delete newPending[assetKey];
        return newPending;
      });

      addToast({
        title: t('assets.setting_updated', 'Setting updated'),
        description: t('brand.alt_text_saved', 'Alt text has been saved'),
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save alt text setting:', error);
      addToast({
        title: t('assets.setting_update_failed', 'Update failed'),
        description: t('brand.alt_text_update_failed', 'Failed to update alt text'),
        type: 'error'
      });
    }
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
          logoTextSettings={
            config.key === 'site.logo'
              ? {
                  showText: pendingLogoShowText !== null ? pendingLogoShowText : logoShowText,
                  textContent: pendingLogoTextContent !== null ? pendingLogoTextContent : logoTextContent,
                  onShowTextChange: handleLogoShowTextChange,
                  onTextContentChange: handleLogoTextContentChange,
                  onSaveShowText: handleSaveShowText,
                  onSaveTextContent: handleSaveTextContent,
                  hasShowTextChanges: pendingLogoShowText !== null,
                  hasTextContentChanges: pendingLogoTextContent !== null
                }
              : undefined
          }
          altTextSettings={
            config.supportsAltText
              ? {
                  altText: pendingAltTextValues[config.key] !== undefined 
                    ? pendingAltTextValues[config.key] 
                    : (altTextValues[config.key] || ''),
                  onAltTextChange: (text: string) => handleAltTextChange(config.key, text),
                  onSave: () => handleSaveAltText(config.key),
                  hasChanges: pendingAltTextValues[config.key] !== undefined
                }
              : undefined
          }
        />
      ))}
    </div>
  );
};