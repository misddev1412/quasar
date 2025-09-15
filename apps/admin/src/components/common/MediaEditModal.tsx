import React, { useState } from 'react';
import { ImageModal } from './ImageModal';
import { Modal } from './Modal';
import { Button } from './Button';
import { MediaType } from './ProductMediaUpload';
import { Z_INDEX } from '../../utils/zIndex';

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

interface MediaEditModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaItem, updates: Partial<MediaItem>) => void;
  title?: string;
  className?: string;
}

const getMediaIcon = (type: MediaType) => {
  const iconProps = "w-8 h-8 text-gray-400";

  switch (type) {
    case MediaType.IMAGE:
      return (
        <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case MediaType.VIDEO:
      return (
        <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case MediaType.AUDIO:
      return (
        <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    case MediaType.DOCUMENT:
      return (
        <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

export const MediaEditModal: React.FC<MediaEditModalProps> = ({
  media,
  isOpen,
  onClose,
  onSave,
  title = "Edit Media Details",
  className = "",
}) => {
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(media);
  const [showImageModal, setShowImageModal] = useState(false);

  // Update local state when media prop changes
  React.useEffect(() => {
    setEditingMedia(media);
  }, [media]);

  if (!isOpen || !editingMedia) return null;

  const handleSave = () => {
    if (editingMedia) {
      onSave(editingMedia, {
        altText: editingMedia.altText,
        caption: editingMedia.caption
      });
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingMedia.type === MediaType.IMAGE) {
      setShowImageModal(true);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showImageModal}
        onClose={onClose}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pr-8">
            <h2 className="text-xl font-semibold">
              {title}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {editingMedia.type === MediaType.IMAGE ? (
                  <div
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleImageClick}
                    title="Click to view full size"
                  >
                    <img
                      src={editingMedia.url}
                      alt={editingMedia.altText}
                      className="w-32 h-32 object-cover rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400"
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Click to enlarge</p>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                    {getMediaIcon(editingMedia.type)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center px-2">
                      {editingMedia.type}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Alt Text / Title
                  </label>
                  <input
                    type="text"
                    value={editingMedia.altText || ''}
                    onChange={(e) => setEditingMedia({
                      ...editingMedia,
                      altText: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Describe this media..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Caption
                  </label>
                  <textarea
                    value={editingMedia.caption || ''}
                    onChange={(e) => setEditingMedia({
                      ...editingMedia,
                      caption: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
                    placeholder="Add a caption..."
                  />
                </div>

                {/* Media Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Type: {editingMedia.type}</div>
                  {editingMedia.fileSize && (
                    <div>Size: {(editingMedia.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  )}
                  {editingMedia.mimeType && (
                    <div>Format: {editingMedia.mimeType}</div>
                  )}
                  {editingMedia.width && editingMedia.height && (
                    <div>Dimensions: {editingMedia.width} × {editingMedia.height}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={editingMedia.url}
        alt={editingMedia.altText}
        title={editingMedia.altText || `${editingMedia.type} file`}
      />
    </>
  );
};

export default MediaEditModal;