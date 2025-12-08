import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from '../../context/ModalContext';
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
  FolderOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { InputWithIcon } from './InputWithIcon';
import clsx from 'clsx';
import { buildApiUrl } from '@admin/utils/apiConfig';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number | string; // Can be string from API response
  folder: string;
  provider: string;
  alt?: string;
  caption?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sizeFormatted?: string; // Optional since it might not come from API
  isImage?: boolean; // Optional since it might not come from API
  isVideo?: boolean; // Optional since it might not come from API
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

interface UploadedFile {
  file: File;
  url: string;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: MediaFile | MediaFile[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  selectedFiles?: MediaFile[];
  title?: string;
}

interface StorageConfig {
  provider?: 'local' | 's3';
  localBaseUrl?: string;
  s3Bucket?: string;
}

type ViewMode = 'grid' | 'list';
type MediaType = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';
type TabMode = 'library' | 'upload';

export const MediaManager: React.FC<MediaManagerProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = 'image/*,video/*',
  maxSize = 10,
  selectedFiles = [],
  title = 'Media Manager',
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { pushModal, popModal, modalStack } = useModalContext();
  const modalId = 'media-manager';

  // Manage modal in stack
  useEffect(() => {
    if (isOpen) {
      pushModal(modalId);
      return () => {
        popModal(modalId);
      };
    }
  }, [isOpen, modalId, pushModal, popModal]);

  // Library state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MediaType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(
    selectedFiles.map(f => f.id)
  );

  // Upload state
  const [activeTab, setActiveTab] = useState<TabMode>('library');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // tRPC queries
  const {
    data: mediaData,
    isLoading,
    refetch,
    error,
    isError,
  } = trpc.adminMedia.getUserMedia.useQuery();
  const { data: storageConfigData } = trpc.adminStorage.getStorageConfig.useQuery(undefined);


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

  // File upload utilities
  const getFileType = (file: File): UploadedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxSize}MB.`;
    }

    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        return `File "${file.name}" has an unsupported format. Accepted: ${accept.replace(/,/g, ', ')}`;
      }
    }

    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        description: validationError,
      });
      return;
    }

    const fileType = getFileType(file);
    let preview: string | undefined;

    if (fileType === 'image' || fileType === 'video') {
      preview = URL.createObjectURL(file);
    }

    const url = URL.createObjectURL(file);

    const uploadedFile: UploadedFile = {
      file,
      url,
      preview,
      type: fileType,
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);
  }, [addToast, maxSize, accept]);

  // Handle file selection from library
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
    if (!mediaResponse || !media.length) return;

    const selectedMedia = media.filter((mediaFile: MediaFile) =>
      selectedMediaIds.includes(mediaFile.id)
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

  // File upload handlers
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(processFile);
  }, [processFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    const files = Array.from(event.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile]);

  const handleRemoveUploadedFile = useCallback((index: number) => {
    const fileToRemove = uploadedFiles[index];
    URL.revokeObjectURL(fileToRemove.url);
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, [uploadedFiles]);

  // Upload files to server
  const handleUploadFiles = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();

      // Add all files to FormData
      uploadedFiles.forEach(uploadedFile => {
        formData.append('files', uploadedFile.file);
      });

      // Add folder parameter
      formData.append('folder', 'gallery');

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;

      if (!token) {
        throw new Error('Authentication required');
      }

      // Upload to server using fetch (since tRPC doesn't handle file uploads well)
      const response = await fetch(buildApiUrl('/api/upload/multiple'), {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      addToast({
        type: 'success',
        title: 'Upload complete',
        description: `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully`,
      });

      // Clean up preview URLs
      uploadedFiles.forEach(uploadedFile => {
        URL.revokeObjectURL(uploadedFile.url);
        if (uploadedFile.preview) {
          URL.revokeObjectURL(uploadedFile.preview);
        }
      });

      // Clear uploaded files and refetch media list
      setUploadedFiles([]);
      await refetch();
      setActiveTab('library');

    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        type: 'error',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred while uploading files',
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, addToast, refetch]);

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

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6 text-gray-400" />;
      case 'video': return <Video className="w-6 h-6 text-gray-400" />;
      case 'audio': return <Music className="w-6 h-6 text-gray-400" />;
      case 'document': return <FileText className="w-6 h-6 text-gray-400" />;
      default: return <File className="w-6 h-6 text-gray-400" />;
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

  // Extract media response from the nested tRPC response structure
  // The tRPC response is: { result: { data: { data: { media: [...] } } } }
  let mediaResponse: MediaResponse | undefined;
  let media: MediaFile[] = [];
  let hasMore = false;

  if (mediaData) {
    // Try different possible response structures
    const possiblePaths = [
      (mediaData as any)?.result?.data?.data,        // { result: { data: { data: {...} } } }
      (mediaData as any)?.data?.data,                // { data: { data: {...} } }
      (mediaData as any)?.result?.data,              // { result: { data: {...} } }
      (mediaData as any)?.data,                      // { data: {...} }
      mediaData                                      // Direct response
    ];

    for (const path of possiblePaths) {
      if (path && path.media && Array.isArray(path.media)) {
        mediaResponse = path as MediaResponse;
        media = path.media || [];
        hasMore = mediaResponse && page < mediaResponse.totalPages;
        break;
      }
    }
  }

  const storageConfig = (storageConfigData as { data?: StorageConfig })?.data;
  const storageProvider = storageConfig?.provider;
  const storageProviderLabel =
    storageProvider === 's3'
      ? 'S3 / Cloud Storage'
      : storageProvider === 'local'
      ? 'Local Storage'
      : undefined;
  const storageProviderMeta =
    storageProvider === 's3'
      ? storageConfig?.s3Bucket
        ? `Bucket ${storageConfig.s3Bucket}`
        : 'S3-compatible provider'
      : storageProvider === 'local'
      ? storageConfig?.localBaseUrl || 'Server filesystem'
      : undefined;

  // Calculate z-index based on position in modal stack
  const modalIndex = modalStack.indexOf(modalId);
  const zIndex = 10000 + (modalIndex >= 0 ? modalIndex * 10 : 0);

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      style={{
        pointerEvents: 'auto',
        zIndex: zIndex
      }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Image className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-0">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 mr-6">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'library'
                    ? 'bg-primary-600 dark:bg-primary-600 text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-700'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Library</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'upload'
                    ? 'bg-primary-600 dark:bg-primary-600 text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-700'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>

            {/* View mode toggle - only show for library tab */}
            {activeTab === 'library' && (
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 dark:bg-primary-600 text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-700'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary-600 dark:bg-primary-600 text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-700'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Library Tab Content */}
        {activeTab === 'library' && (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <InputWithIcon
                    type="text"
                    placeholder={`${t('common.search')} files...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    iconSpacing="standard"
                    className="h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                {/* Type filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as MediaType)}
                    className="pl-10 pr-8 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none cursor-pointer min-w-[140px] flex items-center"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documents</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Search/Filter Results Info */}
              {(searchQuery || selectedType !== 'all') && mediaResponse && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery && (
                    <span>Searching for "{searchQuery}"</span>
                  )}
                  {searchQuery && selectedType !== 'all' && <span> in </span>}
                  {selectedType !== 'all' && (
                    <span>{selectedType} files</span>
                  )}
                  <span> • {mediaResponse.total} result{mediaResponse.total !== 1 ? 's' : ''} found</span>
                  {(searchQuery || selectedType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedType('all');
                      }}
                      className="ml-3 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:shadow-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Library Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading your media files...</p>
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    {searchQuery || selectedType !== 'all' ? (
                      <Search className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery || selectedType !== 'all' ? 'No files match your search' : 'No files yet'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                    {searchQuery || selectedType !== 'all' 
                      ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                      : 'Upload your first files to get started with your media library.'
                    }
                  </p>
                  {!searchQuery && selectedType === 'all' && (
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Upload Files
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-4">
                  {media.map((file) => (
                    <div
                      key={file.id}
                      className={`relative group border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedMediaIds.includes(file.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFileSelect(file);
                      }}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-all duration-200 ${
                        selectedMediaIds.includes(file.id)
                          ? 'bg-primary-600 scale-100'
                          : 'bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 scale-0 group-hover:scale-100'
                      }`}>
                        {selectedMediaIds.includes(file.id) ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <div className="w-2 h-2 border border-gray-400 dark:border-gray-500 rounded-full" />
                        )}
                      </div>

                      {/* File preview */}
                      <div className="relative aspect-square flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                        {file.provider && (
                          <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-primary-600 text-white rounded-md shadow">
                            {file.provider}
                          </span>
                        )}
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
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(typeof file.size === 'string' ? parseInt(file.size) : file.size)}
                          </p>
                          <div className="flex items-center gap-1">
                            {getMediaTypeIcon(file.type, file.mimeType)}
                            <span className="text-xs text-gray-400 uppercase">{file.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-center p-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md text-white hover:bg-white/30 transition-colors"
                            title="Preview"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit
                            }}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md text-white hover:bg-white/30 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md text-white hover:bg-white/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFileSelect(file);
                      }}
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
                      <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                        {file.provider && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-primary-600 text-white rounded shadow">
                            {file.provider}
                          </span>
                        )}
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
                          {formatFileSize(typeof file.size === 'string' ? parseInt(file.size) : file.size)} • {file.type} • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {mediaResponse && mediaResponse.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, mediaResponse.total)} of {mediaResponse.total} files
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* Previous button */}
                    <button
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page <= 1}
                      className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {/* Page numbers */}
                    {(() => {
                      const totalPages = mediaResponse.totalPages;
                      const currentPage = page;
                      const pages = [];

                      // Show first page
                      if (currentPage > 3) {
                        pages.push(1);
                        if (currentPage > 4) {
                          pages.push('...');
                        }
                      }

                      // Show pages around current page (fewer on mobile)
                      const isMobile = window.innerWidth < 640;
                      const range = isMobile ? 1 : 2;
                      for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
                        pages.push(i);
                      }

                      // Show last page
                      if (currentPage < totalPages - 2) {
                        if (currentPage < totalPages - 3) {
                          pages.push('...');
                        }
                        pages.push(totalPages);
                      }

                      return pages.map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={index} className="px-2 text-gray-400">...</span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum as number)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              pageNum === currentPage
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ));
                    })()}

                    {/* Next button */}
                    <button
                      onClick={() => setPage(prev => Math.min(mediaResponse.totalPages, prev + 1))}
                      disabled={page >= mediaResponse.totalPages}
                      className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Upload Tab Content */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upload Area */}
            <div
              className={clsx(
                'border-2 border-dashed rounded-xl transition-all duration-300 mb-6 relative overflow-hidden',
                dragActive
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600',
                'hover:bg-gray-50/50 dark:hover:bg-gray-700/30 cursor-pointer group'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {storageProviderLabel && (
                <div className="absolute top-3 left-3 z-10 flex flex-col rounded-lg bg-primary-600/95 px-3 py-2 text-white shadow-lg">
                  <span className="text-[11px] font-semibold tracking-wide uppercase">
                    {t('media.uploading_to_provider', 'Uploading to')}
                  </span>
                  <span className="text-sm font-bold leading-tight">{storageProviderLabel}</span>
                  {storageProviderMeta && (
                    <span className="text-[10px] font-medium opacity-80">
                      {storageProviderMeta}
                    </span>
                  )}
                </div>
              )}
              <div className="p-8 sm:p-12 text-center">
                <div className={clsx(
                  'w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300',
                  dragActive 
                    ? 'bg-primary-100 dark:bg-primary-900/40 scale-110' 
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:scale-105'
                )}>
                  <Upload className={clsx(
                    'w-6 h-6 transition-colors duration-300',
                    dragActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                  )} />
                </div>
                
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Uploading files...</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we process your files</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {dragActive ? 'Drop your files here!' : `Upload ${multiple ? 'files' : 'a file'}`}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {dragActive 
                        ? 'Release to upload your files'
                        : 'Drag and drop files here, or click the button below to browse'
                      }
                    </p>
                    {!dragActive && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Files
                        </button>
                        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p>Maximum file size: <span className="font-medium">{maxSize}MB</span></p>
                          <p>Accepted formats: <span className="font-medium">{accept === '*' ? 'All files' : accept.replace(/,/g, ', ')}</span></p>
                        </div>
                      </>
                    )}
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>
            {storageProviderLabel && (
              <div className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {t('media.current_storage_provider', 'Current storage provider')}:
                </span>{' '}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {storageProviderLabel}
                </span>
                {storageProviderMeta && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {' '}
                    • {storageProviderMeta}
                  </span>
                )}
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ready to Upload ({uploadedFiles.length})
                  </h3>
                  {uploadedFiles.length > 1 && (
                    <button
                      onClick={() => {
                        uploadedFiles.forEach((file, index) => {
                          URL.revokeObjectURL(file.url);
                          if (file.preview) URL.revokeObjectURL(file.preview);
                        });
                        setUploadedFiles([]);
                      }}
                      className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {uploadedFiles.map((uploadedFile, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {uploadedFile.type === 'image' && uploadedFile.preview ? (
                          <img
                            src={uploadedFile.preview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : uploadedFile.type === 'video' && uploadedFile.preview ? (
                          <video
                            src={uploadedFile.preview}
                            className="w-16 h-16 object-cover rounded-lg"
                            muted
                            playsInline
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            {getFileIcon(uploadedFile.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={uploadedFile.file.name}>
                          {uploadedFile.file.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {uploadedFile.type}
                          </p>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {uploadedFile.file.type}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedFile(index)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors p-2 rounded-lg"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
          <div className="text-sm">
            {activeTab === 'library' && (
              <div className="flex items-center gap-2">
                {selectedMediaIds.length > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {selectedMediaIds.length} file{selectedMediaIds.length !== 1 ? 's' : ''} selected
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No files selected
                  </span>
                )}
              </div>
            )}
            {activeTab === 'upload' && (
              <div className="flex items-center gap-2">
                {uploadedFiles.length > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} ready to upload
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No files uploaded yet
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            {activeTab === 'library' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmSelection();
                }}
                disabled={selectedMediaIds.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:hover:shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Select {selectedMediaIds.length > 0 && `(${selectedMediaIds.length})`}
              </button>
            )}
            {activeTab === 'upload' && (
              <button
                onClick={() => {
                  if (uploadedFiles.length > 0) {
                    handleUploadFiles();
                  } else {
                    onClose();
                  }
                }}
                disabled={uploadedFiles.length === 0 || isUploading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:hover:shadow-md flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : uploadedFiles.length > 0 ? (
                  <>
                    <Upload className="w-4 h-4" />
                    Complete Upload ({uploadedFiles.length})
                  </>
                ) : (
                  'Close'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
