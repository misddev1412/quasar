import React, { useState, useCallback, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiFile } from 'react-icons/fi';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadedFile {
  file: File;
  url: string;
  preview?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  accept = 'image/*',
  maxSize = 5,
  className = '',
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Process file upload logic
  const processFile = useCallback((file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      addToast({ title: t('media.fileTooLarge', { maxSize }), type: 'error' });
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    // For demo purposes, we'll simulate upload by creating a blob URL
    // In a real implementation, you would upload to your server/cloud storage
    const url = URL.createObjectURL(file);
    
    setUploadedFile({
      file,
      url,
      preview,
    });

    onUpload(url);
    addToast({ title: t('media.uploadSuccess'), type: 'success' });
  }, [maxSize, onUpload, addToast, t]);

  // Handle file selection from input
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, [processFile]);

  // Handle file removal
  const handleRemove = useCallback(() => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url);
      if (uploadedFile.preview) {
        URL.revokeObjectURL(uploadedFile.preview);
      }
    }
    setUploadedFile(null);
    onUpload('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedFile, onUpload]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
        addToast({ title: t('media.invalidFileType'), type: 'error' });
        return;
      }

      processFile(file);
    }
  }, [accept, processFile, addToast, t]);

  const isImage = uploadedFile?.file.type.startsWith('image/');

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('media.dragDropOrClick')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {t('media.maxSize', { maxSize })} • {accept}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {isImage && uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {isImage ? (
                    <FiImage className="w-6 h-6 text-gray-400" />
                  ) : (
                    <FiFile className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {uploadedFile.file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {uploadedFile.file.type}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <FiX className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
