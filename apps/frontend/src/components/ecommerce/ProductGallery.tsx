import React, { useState } from 'react';
import { Button, Image } from '@heroui/react';
import { Modal } from '@heroui/react';

interface ProductGalleryProps {
  images: string[];
  selectedImageIndex?: number;
  onImageSelect?: (index: number) => void;
  className?: string;
  showThumbnails?: boolean;
  showZoom?: boolean;
  imageHeight?: string;
  thumbnailSize?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  selectedImageIndex = 0,
  onImageSelect,
  className = '',
  showThumbnails = true,
  showZoom = true,
  imageHeight = 'h-96',
  thumbnailSize = 'w-20 h-20',
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedImageIndex);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handleImageSelect = (index: number) => {
    setCurrentIndex(index);
    if (onImageSelect) {
      onImageSelect(index);
    }
  };

  const handlePrevImage = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    handleImageSelect(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    handleImageSelect(newIndex);
  };

  const handleZoomOpen = () => {
    setIsZoomOpen(true);
  };

  const handleZoomClose = () => {
    setIsZoomOpen(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${imageHeight} ${className}`}>
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image */}
      <div className={`relative overflow-hidden rounded-lg ${imageHeight} bg-gray-100`}>
        <Image
          src={images[currentIndex] || '/placeholder-product.png'}
          alt="Product image"
          className="w-full h-full object-contain cursor-zoom-in"
          removeWrapper
          onClick={handleZoomOpen}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100"
              onPress={handlePrevImage}
            >
              <span className="text-lg">←</span>
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100"
              onPress={handleNextImage}
            >
              <span className="text-lg">→</span>
            </Button>
          </>
        )}
        
        {/* Zoom Button */}
        {showZoom && (
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="absolute right-2 bottom-2 bg-white bg-opacity-70 hover:bg-opacity-100"
            onPress={handleZoomOpen}
          >
            <span className="text-lg">🔍</span>
          </Button>
        )}
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 rounded-md overflow-hidden border-2 ${
                index === currentIndex ? 'border-primary-500' : 'border-gray-200'
              }`}
              onClick={() => handleImageSelect(index)}
            >
              <Image
                src={image || '/placeholder-product.png'}
                alt={`Product thumbnail ${index + 1}`}
                className={`${thumbnailSize} object-cover`}
                removeWrapper
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <Modal
        isOpen={isZoomOpen}
        onClose={handleZoomClose}
        size="5xl"
        className="p-0"
        hideCloseButton
      >
        <div className="relative bg-black">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-70 hover:bg-opacity-100"
            onPress={handleZoomClose}
          >
            <span className="text-lg">✕</span>
          </Button>
          
          <div className="flex items-center justify-center min-h-screen">
            <Image
              src={images[currentIndex] || '/placeholder-product.png'}
              alt="Product image zoomed"
              className="max-w-full max-h-[90vh] object-contain"
              removeWrapper
            />
          </div>
          
          {/* Navigation Arrows in Zoom Modal */}
          {images.length > 1 && (
            <>
              <Button
                isIconOnly
                size="lg"
                variant="flat"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100"
                onPress={handlePrevImage}
              >
                <span className="text-2xl">←</span>
              </Button>
              <Button
                isIconOnly
                size="lg"
                variant="flat"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100"
                onPress={handleNextImage}
              >
                <span className="text-2xl">→</span>
              </Button>
            </>
          )}
          
          {/* Image Counter in Zoom Modal */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProductGallery;