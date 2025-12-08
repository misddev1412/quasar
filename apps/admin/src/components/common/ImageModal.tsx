import React, { useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  title?: string;
  className?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  src,
  alt = '',
  title,
  className = '',
}) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="fullscreen">
      <div className="w-full h-full bg-black text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-90 backdrop-blur-sm z-10">
          <div className="flex-1">
            {title && (
              <h2 className="text-xl font-semibold truncate">{title}</h2>
            )}
            {alt && !title && (
              <h2 className="text-xl font-semibold truncate">{alt}</h2>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mx-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-sm min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 5}
              className="p-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="p-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="px-3 py-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
              title="Reset view"
            >
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="p-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30 ml-4"
              title="Close"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Image Container - Full Screen */}
        <div
          className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-none transition-transform duration-200 ease-out select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              maxHeight: scale === 1 ? 'calc(100vh - 120px)' : 'none',
              maxWidth: scale === 1 ? '100vw' : 'none',
            }}
            draggable={false}
          />
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-black bg-opacity-90 backdrop-blur-sm text-center">
          <p className="text-xs opacity-75">
            Use mouse wheel to zoom • Click and drag to pan • Press ESC to close
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ImageModal;