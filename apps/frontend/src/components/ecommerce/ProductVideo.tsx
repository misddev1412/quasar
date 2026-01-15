'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FiCamera, FiPlay, FiPause, FiVolume2, FiMaximize } from 'react-icons/fi';

interface ProductVideoProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

const ProductVideo: React.FC<ProductVideoProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  className = '',
}) => {
  const t = useTranslations('product.detail.video');
  const displayTitle = title || t('defaultTitle');
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e: any) => {
      setError(t('loadError'));
      setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (autoplay) {
      video.play().catch(() => {
        // Autoplay was prevented
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [autoplay, t]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        setError(t('playError'));
      });
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  };

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <FiCamera className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('unavailableTitle')}</h3>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          controls={controls}
          loop={loop}
          muted={muted}
          className="w-full h-full object-cover"
          playsInline
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
          </div>
        )}

        {/* Play/Pause Overlay (when controls are hidden) */}
        {!controls && !isLoading && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-200 group"
          >
            <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
              {isPlaying ? (
                <FiPause className="text-4xl text-gray-800" />
              ) : (
                <FiPlay className="text-4xl text-gray-800 ml-1" />
              )}
            </div>
          </button>
        )}

        {/* Video Title */}
        {displayTitle && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
            <h3 className="text-white font-medium">{displayTitle}</h3>
          </div>
        )}
      </div>

      {/* Custom Controls */}
      {!controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-white"
              onPress={togglePlay}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <FiVolume2 className="text-white text-lg" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-white"
              onPress={toggleFullscreen}
            >
              {isFullscreen ? <FiMaximize /> : <FiMaximize />}
            </Button>
          </div>
        </div>
      )}

      {/* Fullscreen Button */}
      {controls && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="absolute top-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
          onPress={toggleFullscreen}
        >
          <FiMaximize className="text-xl" />
        </Button>
      )}
    </div>
  );
};

export default ProductVideo;