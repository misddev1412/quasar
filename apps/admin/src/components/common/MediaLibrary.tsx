import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Image,
  Video,
  FileText,
  Music,
  File,
  Trash2,
  Check,
  MoreHorizontal,
  Edit,
  Download,
} from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  folder: string;
  provider: string;
  alt?: string;
  caption?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sizeFormatted: string;
  isImage: boolean;
  isVideo: boolean;
}

interface MediaResponse {
  media: MediaFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TrpcResponse<T = any> {
  code: number;
  status: string;
  data?: T;
  errors?: any[];
  timestamp: string;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: MediaFile | MediaFile[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  selectedFiles?: MediaFile[];
  title?: string;
}

type ViewMode = 'grid' | 'list';
type MediaType = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = 'image/*,video/*',
  maxSize = 10,
  selectedFiles = [],
  title = 'Media Library',
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MediaType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(
    selectedFiles.map(f => f.id)
  );
  const [isUploading, setIsUploading] = useState(false);

  // tRPC queries
  const {
    data: mediaData,
    isLoading,
    refetch,
  } = trpc.adminMedia.getUserMedia.useQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const deleteMediaMutation = trpc.adminMedia.deleteMedia.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('messages.media_deleted_successfully'),
        description: t('messages.media_deleted_successfully_description'),
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('messages.failed_to_delete_media'),
        description: error.message,
      });
    },
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedType]);

  // Handle file selection
  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      const isSelected = selectedMediaIds.includes(file.id);
      if (isSelected) {
        setSelectedMediaIds(prev => prev.filter(id => id !== file.id));
      } else {
        setSelectedMediaIds(prev => [...prev, file.id]);
      }
    } else {
      setSelectedMediaIds([file.id]);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (!(mediaData as any)?.data?.data) return;

    const mediaResponse = (mediaData as any)?.data?.data as MediaResponse;
    const selectedMedia = (mediaResponse?.media || []).filter((media: MediaFile) =>
      selectedMediaIds.includes(media.id)
    );

    if (selectedMedia.length === 0) {
      addToast({
        type: 'warning',
        title: t('messages.no_files_selected'),
        description: t('messages.please_select_files'),
      });
      return;
    }

    onSelect(multiple ? selectedMedia : selectedMedia[0]);
    onClose();
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    // This would integrate with the existing MediaUpload component
    // For now, we'll show a placeholder
    addToast({
      type: 'info',
      title: t('messages.upload_not_implemented'),
      description: 'File upload integration coming soon',
    });
  };

  // Handle delete file
  const handleDeleteFile = (fileId: string) => {
    if (confirm(t('messages.confirm_delete_media'))) {
      deleteMediaMutation.mutate({ id: fileId });
    }
  };

  // Get media type icon
  const getMediaTypeIcon = (type: string, mimeType: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let sizeIndex = 0;
    
    while (size >= 1024 && sizeIndex < sizes.length - 1) {
      size /= 1024;
      sizeIndex++;
    }
    
    return `${size.toFixed(sizeIndex === 0 ? 0 : 1)} ${sizes[sizeIndex]}`;
  };

  if (!isOpen) return null;

  const mediaResponse = (mediaData as any)?.data?.data as MediaResponse | undefined;
  const media = mediaResponse?.media || [];
  const hasMore = mediaResponse && page < mediaResponse.totalPages;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 99999, isolation: 'isolate', contain: 'layout' }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MediaType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{t('media.all_types')}</option>
              <option value="image">{t('media.images')}</option>
              <option value="video">{t('media.videos')}</option>
              <option value="audio">{t('media.audio')}</option>
              <option value="document">{t('media.documents')}</option>
              <option value="other">{t('media.other')}</option>
            </select>

            {/* Upload button */}
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {t('common.upload')}
            </button>
            <input
              id="file-upload"
              type="file"
              multiple={multiple}
              accept={accept}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
              <Image className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('media.no_files_found')}</p>
              <p className="text-sm">{t('media.upload_files_to_get_started')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {media.map((file) => (
                <div
                  key={file.id}
                  className={`relative group border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMediaIds.includes(file.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  {/* Selection indicator */}
                  {selectedMediaIds.includes(file.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center z-10">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* File preview */}
                  <div className="aspect-square flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        {getMediaTypeIcon(file.type, file.mimeType)}
                        <span className="text-xs mt-1 uppercase">{file.type}</span>
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                      }}
                      className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {media.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                    selectedMediaIds.includes(file.id)
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  {/* Selection checkbox */}
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      selectedMediaIds.includes(file.id)
                        ? 'border-primary-500 bg-primary-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selectedMediaIds.includes(file.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* File preview */}
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getMediaTypeIcon(file.type, file.mimeType)}
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • {file.type} • {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('common.load_more')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedMediaIds.length > 0 && (
              <span>
                {selectedMediaIds.length} {t('media.files_selected')}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedMediaIds.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.select')} ({selectedMediaIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};