import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Image, File, Video, Music, FileText, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import { MediaManager } from './MediaManager';
import { UploadService } from '../../utils/upload';
import { BASE_LABEL_CLASS } from './styles';

interface MediaUploadProps {
  value?: string | string[]; // Support single or multiple files
  onChange?: (value: string | string[]) => void;
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

interface UploadedFile {
  file: File;
  url: string;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  value,
  onChange,
  label,
  description,
  accept = 'image/*,video/*',
  maxSize = 10,
  multiple = false,
  disabled = false,
  error,
  required = false,
  className = '',
  placeholder,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);

  // Initialize uploaded files from value prop
  useEffect(() => {
    if (value && uploadedFiles.length === 0) {
      // If value is provided but no files are loaded, this might be from initial form data
      // In a real implementation, you might want to fetch file info from URLs
    }
  }, [value, uploadedFiles.length]);

  const getFileType = (file: File): UploadedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
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

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
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
        return 'File type not allowed';
      }
    }

    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      console.error(validationError);
      return;
    }

    setIsUploading(true);

    try {
      const fileType = getFileType(file);
      let preview: string | undefined;

      // Create preview for images and videos
      if (fileType === 'image' || fileType === 'video') {
        preview = URL.createObjectURL(file);
      }

      // Actually upload the file to the server
      const uploadResult = await UploadService.uploadSingle(file, {
        folder: fileType === 'image' ? 'gallery' : 'general',
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const uploadedData = uploadResult.data?.[0];
      if (!uploadedData) {
        throw new Error('No upload data returned');
      }

      const uploadedFile: UploadedFile = {
        file,
        url: uploadedData.url, // Use the actual server URL
        preview,
        type: fileType,
      };

      if (multiple) {
        const newFiles = [...uploadedFiles, uploadedFile];
        setUploadedFiles(newFiles);
        setSelectedMedia([]); // Clear selected media when uploading new files
        onChange?.(newFiles.map(f => f.url));
      } else {
        // Clean up previous files
        uploadedFiles.forEach(f => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        setUploadedFiles([uploadedFile]);
        setSelectedMedia([]); // Clear selected media when uploading new files
        onChange?.(uploadedFile.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Show error to user (you could add a toast notification here)
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, multiple, onChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (multiple) {
      files.forEach(file => processFile(file));
    } else {
      processFile(files[0]);
    }
  }, [processFile, multiple]);

  const handleRemove = useCallback((index: number, isSelectedMedia = false) => {
    if (isSelectedMedia) {
      // Removing selected media
      const newSelectedMedia = selectedMedia.filter((_, i) => i !== index);
      setSelectedMedia(newSelectedMedia);

      if (multiple) {
        onChange?.(newSelectedMedia.map(media => media.url));
      } else {
        onChange?.('');
      }
    } else {
      // Removing uploaded files
      const fileToRemove = uploadedFiles[index];
      
      // Only revoke blob URLs, not server URLs
      if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);

      if (multiple) {
        onChange?.(newFiles.map(f => f.url));
      } else {
        onChange?.('');
      }

      // Reset file input if no files left
      if (newFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadedFiles, selectedMedia, multiple, onChange]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    if (multiple) {
      files.forEach(file => processFile(file));
    } else {
      processFile(files[0]);
    }
  }, [disabled, processFile, multiple]);

  // Handle media manager selection
  const handleMediaManagerSelect = useCallback((selected: any) => {
    // Clean up existing uploaded files first (only blob URLs)
    uploadedFiles.forEach(f => {
      if (f.preview && f.preview.startsWith('blob:')) {
        URL.revokeObjectURL(f.preview);
      }
    });

    if (multiple && Array.isArray(selected)) {
      const urls = selected.map((media: any) => media.url);
      setUploadedFiles([]); // Clear uploaded files since these are existing media
      setSelectedMedia(selected); // Store selected media for display
      onChange?.(urls);
    } else if (!multiple && !Array.isArray(selected)) {
      setUploadedFiles([]); // Clear uploaded files since this is existing media
      setSelectedMedia([selected]); // Store selected media for display (as array for consistency)
      onChange?.(selected.url);
    }
    
    setShowMediaManager(false);
  }, [multiple, onChange, uploadedFiles]);

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className={BASE_LABEL_CLASS}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg transition-all duration-200',
          dragActive && !disabled
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : error
            ? 'border-red-300 dark:border-red-600'
            : 'border-gray-300 dark:border-gray-600',
          !disabled && 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-6 text-center">
          <Upload className={clsx(
            'w-8 h-8 mx-auto mb-4',
            dragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
          
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {placeholder || `Drag and drop ${multiple ? 'files' : 'a file'} here, or click to select`}
              </p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </button>
                <span className="text-gray-400">or</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMediaManager(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  Media Manager
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Max size: {maxSize}MB • Accepted: {accept}
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
        </div>
      </div>

      {/* Uploaded Files and Selected Media */}
      {(uploadedFiles.length > 0 || selectedMedia.length > 0) && (
        <div className="space-y-3">
          {/* Show uploaded files */}
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={`uploaded-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {uploadedFile.type} • {uploadedFile.file.type}
                  </p>
                </div>
                
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index, false);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Show selected media */}
          {selectedMedia.map((media, index) => (
            <div key={`selected-${media.id}`} className="border border-blue-200 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.alt || media.originalName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      {getFileIcon(media.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {media.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {media.sizeFormatted || `${(media.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    From Media Library
                  </p>
                </div>
                
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index, true);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
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
        multiple={multiple}
        accept={accept}
        maxSize={maxSize}
        title="Select or Upload Media"
      />
    </div>
  );
};
