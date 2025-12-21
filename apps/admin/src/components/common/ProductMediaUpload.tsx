import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Video, Play, Pause, Volume2, VolumeX, Edit, Trash2, Plus, Grid, Camera, CheckCircle, FileText, Music } from 'lucide-react';
import clsx from 'clsx';
import { MediaManager } from './MediaManager';
import { MediaEditModal } from './MediaEditModal';
import { UploadService } from '../../utils/upload';
import { BASE_LABEL_CLASS } from './styles';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isPrimary?: boolean;
  file?: File;
  preview?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
  uploadProgress?: number;
}

interface ProductMediaUploadProps {
  value?: MediaItem[];
  onChange?: (media: MediaItem[]) => void;
  label?: string;
  description?: string;
  maxItems?: number;
  maxSize?: number; // in MB
  allowedTypes?: MediaType[];
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export const ProductMediaUpload: React.FC<ProductMediaUploadProps> = ({
  value = [],
  onChange,
  label,
  description,
  maxItems = 10,
  maxSize = 100,
  allowedTypes = [MediaType.IMAGE, MediaType.VIDEO],
  disabled = false,
  error,
  required = false,
  className = '',
}) => {
  const { t } = useTranslationWithBackend();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaItem[]>(Array.isArray(value) ? value : []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Update local state when value prop changes
  useEffect(() => {
    setMedia(Array.isArray(value) ? value : []);
  }, [value]);

  // Notify parent of changes
  const updateMedia = useCallback((newMedia: MediaItem[]) => {
    setMedia(newMedia);
    onChange?.(newMedia);
  }, [onChange]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith('image/')) return MediaType.IMAGE;
    if (file.type.startsWith('video/')) return MediaType.VIDEO;
    if (file.type.startsWith('audio/')) return MediaType.AUDIO;
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return MediaType.DOCUMENT;
    return MediaType.OTHER;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return t('products.media_upload.file_size_error', { maxSize });
    }

    const mediaType = getMediaType(file);
    if (!allowedTypes.includes(mediaType)) {
      return t('products.media_upload.file_type_error', { mediaType });
    }

    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      console.error(validationError);
      return null;
    }

    const mediaType = getMediaType(file);
    const preview = URL.createObjectURL(file);
    const tempId = generateId();

    const newMediaItem: MediaItem = {
      id: tempId,
      type: mediaType,
      url: preview,
      altText: file.name.replace(/\.[^/.]+$/, ''),
      caption: '',
      sortOrder: media.length,
      fileSize: file.size,
      mimeType: file.type,
      file,
      preview,
      uploadStatus: 'uploading',
      uploadProgress: 0,
    };

    // Add media with uploading status immediately
    const currentMedia = [...media, newMediaItem];
    updateMedia(currentMedia);

    try {
      // Upload to server
      const uploadResult = await UploadService.uploadSingle(file, {
        folder: 'products',
        alt: newMediaItem.altText,
        onProgress: (progress) => {
          // Update progress
          const updatedMedia = currentMedia.map(item =>
            item.id === tempId ? { ...item, uploadProgress: progress } : item
          );
          updateMedia(updatedMedia);
        },
      });

      if (uploadResult.success && uploadResult.data?.[0]) {
        const uploadedFile = uploadResult.data[0];

        // Update media with server data
        const finalMediaItem: MediaItem = {
          id: uploadedFile.id,
          type: mediaType,
          url: uploadedFile.url,
          altText: newMediaItem.altText,
          caption: newMediaItem.caption,
          sortOrder: newMediaItem.sortOrder,
          fileSize: newMediaItem.fileSize,
          mimeType: newMediaItem.mimeType,
          uploadStatus: 'success',
        };

        // Clean up preview URL
        URL.revokeObjectURL(preview);

        // Update the media in the list
        const finalMedia = currentMedia.map(item =>
          item.id === tempId ? finalMediaItem : item
        );
        updateMedia(finalMedia);

        return finalMediaItem;
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);

      // Update media with error status
      const errorMedia = currentMedia.map(item =>
        item.id === tempId ? { ...item, uploadStatus: 'error' as const } : item
      );
      updateMedia(errorMedia);

      return null;
    }
  }, [media, updateMedia, maxSize, allowedTypes]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setIsUploading(true);

    try {
      const remainingSlots = maxItems - media.length;
      const filesToProcess = files.slice(0, remainingSlots);

      for (const file of filesToProcess) {
        await processFile(file);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFile, media.length, maxItems]);

  const handleRemoveMedia = useCallback((index: number) => {
    const mediaToRemove = media[index];
    if (mediaToRemove.preview) {
      URL.revokeObjectURL(mediaToRemove.preview);
    }

    const updatedMedia = media
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, sortOrder: i }));

    updateMedia(updatedMedia);
  }, [media, updateMedia]);

  const handleMediaManagerSelect = useCallback((selectedMedia: any) => {
    const mediaArray = Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia];
    const remainingSlots = maxItems - media.length;
    const mediaToAdd = mediaArray.slice(0, remainingSlots);

    const newMediaItems: MediaItem[] = mediaToAdd.map((mediaFile: any, index: number) => ({
      id: mediaFile.id || generateId(),
      type: getMediaType({ type: mediaFile.mimeType } as File),
      url: mediaFile.url,
      altText: mediaFile.alt || mediaFile.originalName || '',
      caption: mediaFile.caption || mediaFile.description || '',
      sortOrder: media.length + index,
      fileSize: typeof mediaFile.size === 'string' ? parseInt(mediaFile.size) : mediaFile.size,
      mimeType: mediaFile.mimeType,
      isPrimary: media.length === 0 && index === 0, // Make first item primary if no media exists
    }));

    const updatedMedia = [...media, ...newMediaItems];
    updateMedia(updatedMedia);
    setShowMediaManager(false);
  }, [media, maxItems, updateMedia]);

  const handleMediaEdit = useCallback((mediaItem: MediaItem, updates: Partial<MediaItem>) => {
    const updatedMedia = media.map(item =>
      item.id === mediaItem.id ? { ...item, ...updates } : item
    );
    updateMedia(updatedMedia);
    setEditingMedia(null);
  }, [media, updateMedia]);

  const setPrimary = useCallback((index: number) => {
    const updatedMedia = media.map((item, i) => ({
      ...item,
      isPrimary: i === index,
    }));
    updateMedia(updatedMedia);
  }, [media, updateMedia]);

  // Drag and drop functionality
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (dragCounter === 0) {
      setIsDragOver(true);
    }
  }, [dragCounter]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    setIsUploading(true);

    try {
      const remainingSlots = maxItems - media.length;
      const filesToProcess = files.slice(0, remainingSlots);

      for (const file of filesToProcess) {
        await processFile(file);
      }
    } finally {
      setIsUploading(false);
    }
  }, [processFile, media.length, maxItems]);

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return <ImageIcon className="w-4 h-4" />;
      case MediaType.VIDEO:
        return <Video className="w-4 h-4" />;
      case MediaType.AUDIO:
        return <Music className="w-4 h-4" />;
      case MediaType.DOCUMENT:
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const canAddMore = media.length < maxItems && !disabled;

  return (
    <div className={clsx('space-y-4', className)}>
      {label && (
        <label className={BASE_LABEL_CLASS}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {media.map((mediaItem, index) => (
            <div
              key={mediaItem.id}
              className={clsx(
                'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200',
                mediaItem.isPrimary
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              )}
            >
              {/* Media Content */}
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {mediaItem.type === MediaType.IMAGE ? (
                  <img
                    src={mediaItem.url}
                    alt={mediaItem.altText || `Media ${index + 1}`}
                    className={clsx(
                      "w-full h-full object-cover transition-opacity",
                      mediaItem.uploadStatus === 'uploading' && "opacity-50"
                    )}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    {getMediaIcon(mediaItem.type)}
                    <span className="text-xs mt-1 text-center px-1">
                      {mediaItem.altText || 'Media file'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Status Overlay */}
              {mediaItem.uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <div className="text-xs">
                      {mediaItem.uploadProgress ? `${mediaItem.uploadProgress}%` : t('products.media_upload.uploading')}
                    </div>
                  </div>
                </div>
              )}

              {mediaItem.uploadStatus === 'error' && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                  <div className="text-center text-white">
                    <X className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs">{t('products.media_upload.upload_failed')}</div>
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                {mediaItem.uploadStatus !== 'uploading' && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMedia(mediaItem)}
                      className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-all"
                      title={t('products.media_upload.edit_media')}
                      disabled={mediaItem.uploadStatus === 'error'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="p-2 bg-white bg-opacity-80 rounded-full text-red-600 hover:bg-opacity-100 transition-all"
                      title={t('products.media_upload.remove_media')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Media Type Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                {getMediaIcon(mediaItem.type)}
                {mediaItem.type}
              </div>

              {/* Primary Badge */}
              {mediaItem.isPrimary && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                  {t('products.media_upload.primary')}
                </div>
              )}

              {/* Order indicator */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Success Indicator */}
              {mediaItem.uploadStatus === 'success' && (
                <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Set Primary Button */}
              {!mediaItem.isPrimary && mediaItem.uploadStatus === 'success' && (
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-80 rounded text-xs px-2 py-1 hover:bg-opacity-100"
                >
                  {t('products.media_upload.set_primary')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={clsx(
            'border-2 border-dashed rounded-lg transition-all duration-200 relative',
            error
              ? 'border-red-300 dark:border-red-600'
              : isDragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="p-6 text-center">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200',
                isDragOver
                  ? 'bg-primary-100 dark:bg-primary-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <Camera className={clsx(
                  'w-6 h-6 transition-colors duration-200',
                  isDragOver ? 'text-primary-500' : 'text-gray-400'
                )} />
              </div>

              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('products.media_upload.uploading')}</span>
                </div>
              ) : (
                <>
                  <p className={clsx(
                    'text-sm mb-4 transition-colors duration-200',
                    isDragOver
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {isDragOver
                      ? t('products.media_upload.drop_files_here')
                      : t('products.media_upload.add_more_files', {
                          count: maxItems - media.length,
                          label: maxItems - media.length === 1 ? t('products.media_upload.file') : t('products.media_upload.files')
                        })
                    }
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {t('products.media_upload.upload_files')}
                    </button>

                    <span className="text-gray-400">or</span>

                    <button
                      type="button"
                      onClick={() => setShowMediaManager(true)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Grid className="w-4 h-4" />
                      {t('products.media_upload.browse_gallery')}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {t('products.media_upload.max_size_per_file', { maxSize, types: allowedTypes.join(', ') })}
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.includes(MediaType.IMAGE) ? 'image/*,' : ''}
                multiple
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Status */}
      {media.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {t('products.media_upload.files_added', { count: media.length, max: maxItems })}
          </span>
          {media.length === maxItems && (
            <span className="text-amber-600 dark:text-amber-400">
              {t('products.media_upload.maximum_files_reached')}
            </span>
          )}
        </div>
      )}

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelect={handleMediaManagerSelect}
        multiple={true}
        accept={allowedTypes.includes(MediaType.IMAGE) ? 'image/*' : '*/*'}
        maxSize={maxSize}
        title={t('products.media_upload.select_media_for_product')}
      />

      {/* Edit Media Modal */}
      <MediaEditModal
        media={editingMedia}
        isOpen={!!editingMedia}
        onClose={() => setEditingMedia(null)}
        onSave={handleMediaEdit}
        title={t('products.media_upload.edit_media_details')}
      />
    </div>
  );
};

export default ProductMediaUpload;
