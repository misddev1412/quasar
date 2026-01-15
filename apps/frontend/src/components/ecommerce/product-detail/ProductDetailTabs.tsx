import React from 'react';
import { Card, Chip, Tabs, Tab } from '@heroui/react';
import Button from '../../common/Button';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import ProductDescription from '../ProductDescription';
import ReviewList, { Review } from '../ReviewList';
import ReviewForm from '../ReviewForm';
import CommentSection, { Comment } from '../CommentSection';
import { ProductSpecification } from '@frontend/types/product';
import { ProductSpecifications } from './ProductSpecifications';

interface ProductDetailTabsProps {
    activeTab: string;
    onTabChange: (key: 'details' | 'reviews' | 'questions') => void;
    tabRef: React.RefObject<HTMLDivElement | null>;
    descriptionText: string;
    productFeatures: string[];
    specificationItems: ProductSpecification[];
    productDetails: {
        materials?: string;
        careInstructions?: string[];
        dimensions?: string;
        weight?: string;
        origin?: string;
        warranty?: string;
    };
    productVideos: Array<{
        url: string;
        title: string;
        thumbnail?: string;
    }>;
    reviews: Review[];
    comments: Comment[];
    productId: string;
    onReviewSubmit: (review: { rating: number; title: string; comment: string }) => void;
    onCommentSubmit?: (comment: { content: string; parentId?: string }) => void;
    onCommentLike?: (commentId: string) => void;
    onScrollToReviews: () => void;
    className?: string;
    config?: any; // Config from section
}

const typography = {
    sectionTitle: 'text-2xl font-semibold text-gray-900 dark:text-white',
    meta: 'text-sm text-gray-500 dark:text-gray-400',
} as const;

export const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({
    activeTab,
    onTabChange,
    tabRef,
    descriptionText,
    productFeatures,
    specificationItems,
    productDetails,
    productVideos,
    reviews,
    comments,
    productId,
    onReviewSubmit,
    onCommentSubmit,
    onCommentLike,
    onScrollToReviews,
    className,
    config,
}) => {
    const t = useTranslations('product.detail');
    const showSidebar = config?.showSidebar !== false;
    const showDescription = config?.showDescription !== false;
    // We can also support hiding reviews/questions tabs based on config if requested, 
    // but the request focused on sidebar and boxes.

    return (
        <section ref={tabRef} className={clsx("space-y-8", className)}>
            <div className="space-y-8">
                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => onTabChange(key as 'details' | 'reviews' | 'questions')}
                    variant="underlined"
                    className="w-full"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-200 dark:border-gray-700",
                        cursor: "w-full bg-primary",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-medium text-gray-500 dark:text-gray-400 font-normal text-base"
                    }}
                >
                    {showDescription && (
                        <Tab key="details" title={t('tabs.details')}>
                            <div className={clsx("grid grid-cols-1 gap-6 pt-6", showSidebar ? "lg:grid-cols-3" : "lg:grid-cols-1")}>
                                <div className={clsx("space-y-6", showSidebar ? "lg:col-span-2" : "w-full")}>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <h3 className={typography.sectionTitle}>{t('overview.title')}</h3>
                                            <p className={typography.meta}>{t('overview.subtitle')}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            className="bg-white border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600 transition-colors"
                                            onPress={onScrollToReviews}
                                        >
                                            {t('overview.actions.viewReviews')}
                                        </Button>
                                    </div>
                                    <ProductDescription
                                        description={descriptionText}
                                        features={productFeatures}
                                        specifications={specificationItems}
                                        details={productDetails}
                                        videos={productVideos}
                                        className="space-y-6"
                                        config={config}
                                    />
                                </div>
                                {showSidebar && <ProductSpecifications specificationItems={specificationItems} />}
                            </div>
                        </Tab>
                    )}

                    <Tab
                        key="reviews"
                        title={
                            <div className="flex items-center gap-2">
                                <span>{t('tabs.reviews')}</span>
                                <Chip size="sm" variant="flat">{reviews.length}</Chip>
                            </div>
                        }
                    >
                        <div className="space-y-6 pt-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className={typography.sectionTitle}>{t('reviews.title')}</h3>
                                    <p className={typography.meta}>{t('reviews.subtitle')}</p>
                                </div>
                                <span className="text-sm font-medium text-primary-500">{t('reviews.countLabel', { count: reviews.length })}</span>
                            </div>
                            <ReviewList
                                productId={productId}
                                reviews={reviews}
                                onHelpfulVote={() => undefined}
                                onReportReview={() => undefined}
                            />
                            <div className="space-y-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-5 dark:border-gray-700/60 dark:bg-gray-900/40">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reviews.shareTitle')}</h4>
                                <p className={typography.meta}>{t('reviews.shareSubtitle')}</p>
                                <ReviewForm onSubmit={onReviewSubmit} />
                            </div>
                        </div>
                    </Tab>

                    <Tab
                        key="questions"
                        title={
                            <div className="flex items-center gap-2">
                                <span>{t('tabs.questions')}</span>
                                <Chip size="sm" variant="flat">{comments.length}</Chip>
                            </div>
                        }
                    >
                        <div className="space-y-6 pt-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className={typography.sectionTitle}>{t('questions.title')}</h3>
                                    <p className={typography.meta}>{t('questions.subtitle')}</p>
                                </div>
                                <span className="text-sm font-medium text-primary-500">{t('questions.countLabel', { count: comments.length })}</span>
                            </div>
                            <CommentSection
                                productId={productId}
                                comments={comments}
                                onCommentSubmit={onCommentSubmit}
                                onCommentLike={onCommentLike}
                            />
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </section>
    );
};
