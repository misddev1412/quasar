import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Move, Eye, Trash2, Plus, Grid, Edit, Camera, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { MediaManager } from './MediaManager';
import { UploadService } from '../../utils/upload';

interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  order: number;
  file?: File;
  preview?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
  uploadProgress?: number;
}

interface ImageGalleryUploadProps {
  value?: GalleryImage[];
  onChange?: (images: GalleryImage[]) => void;
  label?: string;
  description?: string;
  maxImages?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export const ImageGalleryUpload: React.FC<ImageGalleryUploadProps> = ({
  value = [],
  onChange,
  label,
  description,
  maxImages = 10,
  maxSize = 10,
  disabled = false,
  error,
  required = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>(value);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Update local state when value prop changes
  useEffect(() => {
    setImages(value);
  }, [value]);

  // Notify parent of changes
  const updateImages = useCallback((newImages: GalleryImage[]) => {
    setImages(newImages);
    onChange?.(newImages);
  }, [onChange]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      console.error(validationError);
      return null;
    }

    // Create preview URL for immediate display
    const preview = URL.createObjectURL(file);
    const tempId = generateId();
    const newImage: GalleryImage = {
      id: tempId,
      url: preview,
      alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      caption: '',
      order: images.length,
      file,
      preview,
      uploadStatus: 'uploading',
      uploadProgress: 0,
    };

    // Add image with uploading status immediately
    const currentImages = [...images, newImage];
    updateImages(currentImages);

    try {
      // Upload to server
      const uploadResult = await UploadService.uploadSingle(file, {
        folder: 'gallery',
        alt: newImage.alt,
        onProgress: (progress) => {
          // Update progress
          const updatedImages = currentImages.map(img => 
            img.id === tempId ? { ...img, uploadProgress: progress } : img
          );
          updateImages(updatedImages);
        },
      });

      if (uploadResult.success && uploadResult.data?.[0]) {
        const uploadedFile = uploadResult.data[0];
        
        // Update image with server data
        const finalImage: GalleryImage = {
          id: uploadedFile.id,
          url: uploadedFile.url,
          alt: newImage.alt,
          caption: newImage.caption,
          order: newImage.order,
          uploadStatus: 'success',
        };

        // Clean up preview URL
        URL.revokeObjectURL(preview);

        // Update the image in the list
        const finalImages = currentImages.map(img => 
          img.id === tempId ? finalImage : img
        );
        updateImages(finalImages);

        return finalImage;
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update image with error status
      const errorImages = currentImages.map(img => 
        img.id === tempId ? { ...img, uploadStatus: 'error' as const } : img
      );
      updateImages(errorImages);
      
      return null;
    }
  }, [images, updateImages, maxSize]);

  const processMultipleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    if (filesToProcess.length < files.length) {
      console.warn(`Only ${remainingSlots} images can be added. ${files.length - filesToProcess.length} files were skipped.`);
    }

    setIsUploading(true);

    try {
      // Validate all files first
      const validFiles = filesToProcess.filter(file => {
        const validationError = validateFile(file);
        if (validationError) {
          console.error(`Validation failed for ${file.name}:`, validationError);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      // Create preview images immediately
      const tempImages: GalleryImage[] = validFiles.map((file, index) => {
        const preview = URL.createObjectURL(file);
        return {
          id: generateId(),
          url: preview,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          caption: '',
          order: images.length + index,
          file,
          preview,
          uploadStatus: 'uploading',
          uploadProgress: 0,
        };
      });

      // Add all images with uploading status
      const currentImages = [...images, ...tempImages];
      updateImages(currentImages);

      try {
        // Upload files using batch upload
        const uploadResult = await UploadService.uploadGallery(validFiles, {
          folder: 'gallery',
        });

        if (uploadResult.success && uploadResult.data) {
          // Update all images with server data
          const finalImages = currentImages.map((img, index) => {
            const tempIndex = tempImages.findIndex(temp => temp.id === img.id);
            if (tempIndex !== -1 && uploadResult.data![tempIndex]) {
              const uploadedFile = uploadResult.data![tempIndex];
              // Clean up preview URL
              if (img.preview) {
                URL.revokeObjectURL(img.preview);
              }
              return {
                id: uploadedFile.id,
                url: uploadedFile.url,
                alt: img.alt,
                caption: img.caption,
                order: img.order,
                uploadStatus: 'success' as const,
              };
            }
            return img;
          });

          updateImages(finalImages);
        } else {
          throw new Error(uploadResult.error || 'Batch upload failed');
        }
      } catch (error) {
        console.error('Batch upload error:', error);
        
        // Update all temp images with error status
        const errorImages = currentImages.map(img => {
          const isTempImage = tempImages.some(temp => temp.id === img.id);
          return isTempImage ? { ...img, uploadStatus: 'error' as const } : img;
        });
        updateImages(errorImages);
      }
    } finally {
      setIsUploading(false);
    }
  }, [images, maxImages, updateImages, validateFile]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await processMultipleFiles(files);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processMultipleFiles]);

  const handleMediaManagerSelect = useCallback((selectedMedia: any) => {
    const mediaArray = Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia];
    const remainingSlots = maxImages - images.length;
    const mediaToAdd = mediaArray.slice(0, remainingSlots);

    const newImages: GalleryImage[] = mediaToAdd.map((media: any, index: number) => ({
      id: media.id || generateId(),
      url: media.url,
      alt: media.alt || media.originalName || '',
      caption: media.caption || '',
      order: images.length + index,
    }));

    const updatedImages = [...images, ...newImages];
    updateImages(updatedImages);
    setShowMediaManager(false);
  }, [images, maxImages, updateImages]);

  const handleRemoveImage = useCallback((index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    const updatedImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }));
    
    updateImages(updatedImages);
  }, [images, updateImages]);

  const handleImageEdit = useCallback((image: GalleryImage, updates: Partial<GalleryImage>) => {
    const updatedImages = images.map(img => 
      img.id === image.id ? { ...img, ...updates } : img
    );
    updateImages(updatedImages);
    setEditingImage(null);
  }, [images, updateImages]);

  // Drag and drop file uploads
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

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await processMultipleFiles(files);
    }
  }, [processMultipleFiles]);

  // Drag and drop reordering for existing images
  const handleImageDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  }, []);

  const handleImageDragEnd = useCallback(() => {
    if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(draggedOverIndex, 0, draggedImage);
      
      // Update order
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        order: index
      }));
      
      updateImages(reorderedImages);
    }
    
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  }, [draggedIndex, draggedOverIndex, images, updateImages]);

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className={clsx('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={clsx(
                'group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200',
                draggedIndex === index
                  ? 'border-primary-500 shadow-lg scale-105'
                  : draggedOverIndex === index
                  ? 'border-primary-300 border-dashed'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              )}
              draggable={!disabled}
              onDragStart={() => handleImageDragStart(index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragEnd={handleImageDragEnd}
            >
              <img
                src={image.url}
                alt={image.alt || `Gallery image ${index + 1}`}
                className={clsx(
                  "w-full h-full object-cover transition-opacity",
                  image.uploadStatus === 'uploading' && "opacity-50"
                )}
              />
              
              {/* Upload Status Overlay */}
              {image.uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <div className="text-xs">
                      {image.uploadProgress ? `${image.uploadProgress}%` : 'Uploading...'}
                    </div>
                  </div>
                </div>
              )}
              
              {image.uploadStatus === 'error' && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                  <div className="text-center text-white">
                    <X className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs">Upload Failed</div>
                  </div>
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                {image.uploadStatus !== 'uploading' && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingImage(image)}
                      className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-all"
                      title="Edit image"
                      disabled={image.uploadStatus === 'error'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-white bg-opacity-80 rounded-full text-red-600 hover:bg-opacity-100 transition-all"
                      title={image.uploadStatus === 'error' ? 'Remove failed upload' : 'Remove image'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Order indicator */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Upload Success Indicator */}
              {image.uploadStatus === 'success' && (
                <div className="absolute top-2 right-12 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Drag handle */}
              {!disabled && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <Move className="w-4 h-4 text-white drop-shadow" />
                </div>
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
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
                      ? 'Drop images here to upload'
                      : `Add up to ${maxImages - images.length} more ${maxImages - images.length === 1 ? 'image' : 'images'}`
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
                      Upload Images
                    </button>
                    
                    <span className="text-gray-400">or</span>
                    
                    <button
                      type="button"
                      onClick={() => setShowMediaManager(true)}
                      disabled={disabled}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Grid className="w-4 h-4" />
                      Browse Gallery
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Max {maxSize}MB per image • JPG, PNG, WebP supported
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Drag overlay indicator */}
          {isDragOver && (
            <div className="absolute inset-0 bg-primary-100/80 dark:bg-primary-900/40 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center text-primary-600 dark:text-primary-400">
                <Upload className="w-12 h-12 mb-2 animate-bounce" />
                <p className="text-lg font-semibold">Drop images to upload</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery Status */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {images.length} of {maxImages} images added
          </span>
          {images.length === maxImages && (
            <span className="text-amber-600 dark:text-amber-400">
              Maximum images reached
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
        accept="image/*"
        maxSize={maxSize}
        title="Select Images for Gallery"
      />

      {/* Image Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Image Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={editingImage.url}
                      alt={editingImage.alt}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={editingImage.alt || ''}
                        onChange={(e) => setEditingImage({
                          ...editingImage,
                          alt: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Describe this image..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Caption
                      </label>
                      <textarea
                        value={editingImage.caption || ''}
                        onChange={(e) => setEditingImage({
                          ...editingImage,
                          caption: e.target.value
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Add a caption..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleImageEdit(editingImage, {
                    alt: editingImage.alt,
                    caption: editingImage.caption
                  })}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};