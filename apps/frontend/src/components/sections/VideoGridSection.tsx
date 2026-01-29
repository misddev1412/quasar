'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';
import { SectionHeader } from './SectionHeader';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SectionTranslationContent } from './HeroSlider';


export interface VideoGridItemConfig {
    id?: string;
    type?: 'embed' | 'upload';
    title?: string;
    description?: string;
    embedUrl?: string; // Standardized field from editor
    uploadUrl?: string; // Standardized field from editor
    videoUrl?: string; // Legacy/Simplified field
    posterImage?: string;
    duration?: string;
}

export interface VideoGridSectionConfig {
    title?: string;
    subtitle?: string;
    description?: string;
    videos?: VideoGridItemConfig[];
    backgroundStyle?: 'surface' | 'muted' | 'contrast';
    itemsPerRow?: number;
}

interface VideoGridSectionProps {
    config: VideoGridSectionConfig;
    translation?: SectionTranslationContent | null;
}

const ensureProtocol = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    if (url.startsWith('//')) {
        return `https:${url}`;
    }
    return `https://${url}`;
};

const buildYoutubeEmbed = (videoId: string, params?: URLSearchParams) => {
    const query = params && Array.from(params.keys()).length > 0 ? `?${params.toString()}` : '';
    // Auto play when clicked
    const autoPlayQuery = query ? `${query}&autoplay=1` : '?autoplay=1';
    return `https://www.youtube.com/embed/${videoId}${autoPlayQuery}`;
};

const normalizeEmbedUrl = (url?: string) => {
    if (!url) {
        return undefined;
    }

    const trimmed = url.trim();
    if (!trimmed) {
        return undefined;
    }

    const withProtocol = ensureProtocol(trimmed);

    try {
        const parsed = new URL(withProtocol);
        const host = parsed.hostname.replace(/^www\./i, '');
        const pathSegments = parsed.pathname.split('/').filter(Boolean);

        if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
            if (parsed.pathname === '/watch') {
                const videoId = parsed.searchParams.get('v');
                if (videoId) {
                    const params = new URLSearchParams(parsed.searchParams);
                    params.delete('v');
                    return buildYoutubeEmbed(videoId, params);
                }
            }

            if (pathSegments[0] === 'shorts' && pathSegments[1]) {
                const params = new URLSearchParams(parsed.searchParams);
                return buildYoutubeEmbed(pathSegments[1], params);
            }

            if (pathSegments[0] === 'live' && pathSegments[1]) {
                const params = new URLSearchParams(parsed.searchParams);
                return buildYoutubeEmbed(pathSegments[1], params);
            }
        }

        if (host === 'youtu.be' && pathSegments[0]) {
            const params = new URLSearchParams(parsed.searchParams);
            return buildYoutubeEmbed(pathSegments[0], params);
        }

        // Add autoplay if not present
        if (parsed.toString().includes('youtube.com/embed/')) {
            if (!parsed.searchParams.has('autoplay')) {
                parsed.searchParams.set('autoplay', '1');
            }
            return parsed.toString();
        }

        return parsed.toString();
    } catch {
        return withProtocol;
    }
};

const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const trimmed = url.trim();

    // Check if it's already an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    // Enhanced regex to support shorts, live, and various other patterns
    // Added " to the excluded characters to handle IDs inside iframe tags/quotes
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?"]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const VideoThumbnail: React.FC<{
    video: VideoGridItemConfig;
    isYoutube: boolean;
    onClick: () => void;
}> = ({ video, isYoutube, onClick }) => {
    const youtubeId = isYoutube ? getYoutubeId(video.embedUrl || video.videoUrl) : null;
    const fallbackLevels = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
    const [levelIndex, setLevelIndex] = useState(0);
    const [isUnsplashFallback, setIsUnsplashFallback] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const [thumbUrl, setThumbUrl] = useState<string>(() => {
        if (video.posterImage) return video.posterImage;
        if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/${fallbackLevels[0]}.jpg`;
        return 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=1600&auto=format&fit=crop';
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset/Sync when video ID changes
    useEffect(() => {
        setLevelIndex(0);
        setIsUnsplashFallback(false);
        if (video.posterImage) {
            setThumbUrl(video.posterImage);
        } else if (youtubeId) {
            setThumbUrl(`https://img.youtube.com/vi/${youtubeId}/${fallbackLevels[0]}.jpg`);
        } else {
            setThumbUrl('https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=1600&auto=format&fit=crop');
        }
    }, [youtubeId, video.posterImage]);

    const triggerNextFallback = () => {
        if (!youtubeId || isUnsplashFallback) return;

        if (levelIndex < fallbackLevels.length - 1) {
            const nextIndex = levelIndex + 1;
            setLevelIndex(nextIndex);
            setThumbUrl(`https://img.youtube.com/vi/${youtubeId}/${fallbackLevels[nextIndex]}.jpg`);
        } else {
            setIsUnsplashFallback(true);
            setThumbUrl('https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=1600&auto=format&fit=crop');
        }
    };

    const checkPlaceholder = (img: HTMLImageElement) => {
        // YouTube returns a 120x90 placeholder when a higher res thumbnail doesn't exist.
        if (isYoutube && !isUnsplashFallback && img.naturalWidth === 120 && img.naturalHeight === 90) {
            triggerNextFallback();
        }
    };

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        checkPlaceholder(e.currentTarget);
    };

    const handleError = () => {
        triggerNextFallback();
    };

    // Check on mount/update because images might be in cache and onLoad might not fire predictably
    useEffect(() => {
        if (isMounted && imgRef.current && imgRef.current.complete) {
            checkPlaceholder(imgRef.current);
        }
    }, [isMounted, thumbUrl]);

    return (
        <img
            ref={imgRef}
            key={`${youtubeId}-${levelIndex}-${isUnsplashFallback}`}
            src={thumbUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110 opacity-90 cursor-pointer"
            onClick={onClick}
            onLoad={handleLoad}
            onError={handleError}
        />
    );
};

export const VideoGridSection: React.FC<VideoGridSectionProps> = ({ config, translation }) => {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [itemsPerRowState, setItemsPerRowState] = useState<number>(3);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const updateItemsPerRow = () => {
        const configVal = Number(config.itemsPerRow);
        const configItemsPerRow = !isNaN(configVal) && configVal > 0 ? configVal : 3;

        if (typeof window === 'undefined') {
            setItemsPerRowState(configItemsPerRow);
            return;
        }

        if (window.innerWidth >= 1024) {
            setItemsPerRowState(configItemsPerRow);
        } else if (window.innerWidth >= 768) {
            // Tablet/Small Laptop: Show up to 3 if configured
            setItemsPerRowState(Math.min(configItemsPerRow, 3));
        } else if (window.innerWidth >= 640) {
            // Small Tablet: Show up to 2
            setItemsPerRowState(Math.min(configItemsPerRow, 2));
        } else {
            // Mobile: Always 1
            setItemsPerRowState(1);
        }
    };

    useEffect(() => {
        updateItemsPerRow();
        window.addEventListener('resize', updateItemsPerRow);
        return () => window.removeEventListener('resize', updateItemsPerRow);
    }, [config.itemsPerRow]);

    const providedVideos = config.videos || [];
    const validVideos = providedVideos.filter(v => v.embedUrl || v.videoUrl || v.uploadUrl);

    const title = translation?.title || config.title || '';
    const subtitle = translation?.subtitle || config.subtitle || '';
    const description = translation?.description || config.description || '';

    const videos = validVideos.length > 0 ? validVideos : [
        {
            id: 'mock-1',
            title: 'MGA Việt Nam - Giải Pháp Chọn Xe Nâng Cũ Tối Ưu',
            description: 'Làm cách nào để chọn xe nâng cũ tối ưu nhất?',
            embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            type: 'embed'
        },
        {
            id: 'mock-2',
            title: 'MGA Việt Nam - Nhà Máy Lắp Ráp Xe Nâng Đầu Tiên Tại Việt Nam',
            description: 'Nhà máy lắp xe nâng đầu tiên tại Việt Nam',
            embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            type: 'embed'
        },
        {
            id: 'mock-3',
            title: 'MGA Việt Nam - Đơn Vị Đầu Tiên Ráp Xe Nâng Đạt Tiêu Chuẩn Châu Âu VTV1',
            description: 'MGA Việt Nam - Đơn vị tiên phong trong lắp ráp xe nâng đạt tiêu chuẩn Châu Âu, được giới thiệu trên VTV1.',
            embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            type: 'embed'
        }
    ] as VideoGridItemConfig[];

    const totalPages = Math.ceil(videos.length / Math.max(1, itemsPerRowState));

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

            const items = scrollRef.current.querySelectorAll('.video-grid-item');
            if (items.length > 0) {
                const itemWidth = items[0].clientWidth;
                // Use itemsPerRowState for accurate page calculation
                const pageIndex = Math.round(scrollLeft / ((itemWidth + 24) * itemsPerRowState));
                if (pageIndex !== activeIndex) {
                    setActiveIndex(pageIndex);
                }
            }
        }
    };

    useEffect(() => {
        checkScroll();
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkScroll);
        }
        window.addEventListener('resize', checkScroll);
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [videos, itemsPerRowState, activeIndex]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollToPage = (pageIndex: number) => {
        if (scrollRef.current) {
            const items = scrollRef.current.querySelectorAll('.video-grid-item');
            const targetItemIndex = pageIndex * itemsPerRowState;
            if (items[targetItemIndex]) {
                const itemWidth = items[0].clientWidth;
                scrollRef.current.scrollTo({ left: targetItemIndex * (itemWidth + 24), behavior: 'smooth' });
            }
        }
    };

    const backgroundStyle = config.backgroundStyle || 'surface';

    const getSectionStyle = (): React.CSSProperties => {
        switch (backgroundStyle) {
            case 'muted':
                return { backgroundColor: 'var(--storefront-surface)' };
            case 'contrast':
                return {
                    backgroundColor: 'var(--storefront-text)',
                    color: 'var(--storefront-body)'
                };
            case 'surface':
            default:
                return { backgroundColor: 'var(--storefront-body)' };
        }
    };

    return (
        <section
            className="py-4 lg:py-16"
            style={getSectionStyle()}
        >
            <SectionContainer>
                {(title || subtitle || description) && (
                    <SectionHeader
                        title={title}
                        subtitle={subtitle}
                        description={description}
                        className="mb-12"
                    />
                )}

                <div className="relative group/section">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll('left')}
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-800 transition-all opacity-0 group-hover/section:opacity-100 -ml-6 hover:bg-gray-50 focus:outline-none",
                            !canScrollLeft && "hidden"
                        )}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-800 transition-all opacity-0 group-hover/section:opacity-100 -mr-6 hover:bg-gray-50 focus:outline-none",
                            !canScrollRight && "hidden"
                        )}
                        aria-label="Next"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Grid/Scroll Area */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {videos.map((video, index) => {
                            const videoId = video.id || `video-${index}`;
                            const isPlaying = playingId === videoId;
                            const videoActualUrl = video.embedUrl || video.videoUrl || video.uploadUrl || '';
                            const isYoutube = !!getYoutubeId(videoActualUrl);

                            // Width calculation logic
                            const configVal = Number(config.itemsPerRow);
                            const itemsPerRow = !isNaN(configVal) && configVal > 0 ? configVal : 3;

                            const mobileWidth = "w-[calc(100%-40px)]";
                            // For tablet (md: 768px), we allow it to be 3 if configured
                            const tabletWidth = itemsPerRow >= 3 ? "md:w-[calc(33.333%-16px)]" : itemsPerRow === 2 ? "md:w-[calc(50%-12px)]" : mobileWidth;
                            // For desktop (lg: 1024px)
                            const desktopWidth = `lg:w-[calc(${100 / itemsPerRow}%-${((itemsPerRow - 1) * 24) / itemsPerRow}px)]`;

                            return (
                                <div
                                    key={videoId}
                                    className={cn(
                                        "video-grid-item flex-shrink-0 snap-start",
                                        mobileWidth,
                                        tabletWidth,
                                        desktopWidth
                                    )}
                                >
                                    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                                        {/* Thumbnail / Video Player */}
                                        <div
                                            className="relative aspect-video group/thumb overflow-hidden bg-black"
                                        >
                                            {isPlaying ? (
                                                (video.type === 'upload' || (!video.embedUrl && video.videoUrl && !getYoutubeId(video.videoUrl))) ? (
                                                    <video
                                                        src={video.uploadUrl || video.videoUrl}
                                                        poster={video.posterImage}
                                                        controls
                                                        autoPlay
                                                        className="w-full h-full"
                                                    />
                                                ) : (
                                                    <iframe
                                                        src={normalizeEmbedUrl(video.embedUrl || video.videoUrl)}
                                                        title={video.title}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                )
                                            ) : (
                                                <>
                                                    <VideoThumbnail
                                                        video={video}
                                                        isYoutube={isYoutube}
                                                        onClick={() => setPlayingId(videoId)}
                                                    />
                                                    {/* Stylized Play Button Overlay */}
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                                        onClick={() => setPlayingId(videoId)}
                                                    >
                                                        <div className={cn(
                                                            "w-16 h-11 flex items-center justify-center rounded-[12px] text-white shadow-lg transition-all duration-300 group-hover/thumb:scale-110 ring-4 ring-transparent group-hover/thumb:ring-white/20",
                                                            isYoutube ? "bg-red-600/90 group-hover/thumb:bg-red-600" : "bg-orange-600/90 group-hover/thumb:bg-orange-600"
                                                        )}>
                                                            <Play className="w-6 h-6 fill-current ml-0.5" />
                                                        </div>
                                                    </div>
                                                    {/* Duration badge if any */}
                                                    {video.duration && (
                                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
                                                            {video.duration}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3
                                                className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-[1.4] transition-colors hover:text-orange-600 cursor-pointer"
                                                onClick={() => setPlayingId(videoId)}
                                            >
                                                {video.title || t('sections.video.untitledVideo')}
                                            </h3>
                                            {video.description && (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                                    {video.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Dots */}
                    {isMounted && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-10 mb-2 relative z-30">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={`dot-page-${idx}`}
                                    onClick={() => scrollToPage(idx)}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all duration-300 border-2 focus:outline-none",
                                        activeIndex === idx
                                            ? "bg-orange-500 border-orange-500 scale-125 shadow-md"
                                            : "bg-gray-300 border-transparent hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    )}
                                    aria-label={`Go to page ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </SectionContainer>
        </section>
    );
};

export default VideoGridSection;
