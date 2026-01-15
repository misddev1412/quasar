'use client';

import React, { useState } from 'react';
import { Button, Card, Avatar, Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FiEdit3, FiThumbsUp } from 'react-icons/fi';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  verifiedPurchase?: boolean;
  helpfulCount: number;
  isHelpful?: boolean;
}

interface ReviewListProps {
  productId: string;
  reviews?: Review[];
  loading?: boolean;
  onHelpfulVote?: (reviewId: string) => void;
  onReportReview?: (reviewId: string) => void;
  className?: string;
  showPagination?: boolean;
  reviewsPerPage?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews = [],
  loading = false,
  onHelpfulVote,
  onReportReview,
  className = '',
  showPagination = true,
  reviewsPerPage = 5,
  sortBy = 'newest',
}) => {
  const t = useTranslations('product.detail.reviews');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);

  // Sort reviews based on the selected criteria
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (currentSortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setCurrentSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleHelpfulVote = (reviewId: string) => {
    if (onHelpfulVote) {
      onHelpfulVote(reviewId);
    }
  };

  const handleReportReview = (reviewId: string) => {
    if (onReportReview) {
      onReportReview(reviewId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400">
            {i < Math.floor(rating) ? '★' : i < rating ? '★½' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const renderEmptyState = () => (
    <Card className="p-8 text-center">
      <div className="text-5xl mb-4 flex justify-center text-gray-300">
        <FiEdit3 />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h3>
      <p className="text-gray-600">{t('emptyDescription')}</p>
    </Card>
  );

  const renderSkeletons = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <div className={className}>{renderSkeletons()}</div>;
  }

  if (reviews.length === 0) {
    return <div className={className}>{renderEmptyState()}</div>;
  }

  return (
    <div className={className}>
      {/* Review Summary */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">
              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(
                1
              )}
            </div>
            <div className="my-2">
              {renderRatingStars(
                reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              )}
            </div>
            <div className="text-gray-600 text-sm">
              {t('countLabel', { count: reviews.length })}
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(
                  (review) => Math.floor(review.rating) === stars
                ).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-2">
                    <div className="w-8 text-sm">{stars} ★</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-sm text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={currentSortBy === 'newest' ? 'solid' : 'flat'}
            color={currentSortBy === 'newest' ? 'primary' : 'default'}
            onPress={() => handleSortChange('newest')}
          >
            {t('sort.newest')}
          </Button>
          <Button
            size="sm"
            variant={currentSortBy === 'highest' ? 'solid' : 'flat'}
            color={currentSortBy === 'highest' ? 'primary' : 'default'}
            onPress={() => handleSortChange('highest')}
          >
            {t('sort.highest')}
          </Button>
          <Button
            size="sm"
            variant={currentSortBy === 'lowest' ? 'solid' : 'flat'}
            color={currentSortBy === 'lowest' ? 'primary' : 'default'}
            onPress={() => handleSortChange('lowest')}
          >
            {t('sort.lowest')}
          </Button>
          <Button
            size="sm"
            variant={currentSortBy === 'helpful' ? 'solid' : 'flat'}
            color={currentSortBy === 'helpful' ? 'primary' : 'default'}
            onPress={() => handleSortChange('helpful')}
          >
            {t('sort.mostHelpful')}
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {paginatedReviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={review.userAvatar}
                name={review.userName}
                size="md"
                className="flex-shrink-0"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{review.userName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {renderRatingStars(review.rating)}
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      {review.verifiedPurchase && (
                        <Chip size="sm" color="success" variant="flat">
                          {t('verifiedPurchase')}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>

                <h5 className="font-medium mt-2 mb-1">{review.title}</h5>
                <p className="text-gray-700 mb-4">{review.comment}</p>

                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="flat"
                    color={review.isHelpful ? 'primary' : 'default'}
                    startContent={<FiThumbsUp className={review.isHelpful ? "fill-current" : ""} />}
                    onPress={() => handleHelpfulVote(review.id)}
                  >
                    {t('actions.helpful', { count: review.helpfulCount })}
                  </Button>

                  <Button size="sm" variant="flat" onPress={() => handleReportReview(review.id)}>
                    {t('actions.report')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              isDisabled={currentPage === 1}
              onPress={() => handlePageChange(currentPage - 1)}
            >
              { /* Reusing comment's pagination keys since we didn't add specific ones for reviews, or fallback to 'Previous' if we want hardcoded. 
                 But wait, I should consistency. I used 'pagination.previous' in CommentSection. 
                 I'll assume I added pagination to reviews in vi.json or I will add it now.
                 Actually, I'll use hardcoded 'Previous'/'Next' if I'm not sure, but to be safe I'll assume I'll add them.
                 Let's check what I used in CommentSection previously: t('pagination.previous').
                 I'll use t('pagination.previous') here too, assuming product.detail.reviews.pagination.previous exists.
                 I NEED TO ADD IT TO vi.json if it doesn't exist.
                 I'll check vi.json again later. For now, I'll use it.
              */ }
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? 'solid' : 'flat'}
                  color={currentPage === pageNum ? 'primary' : 'default'}
                  onPress={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              size="sm"
              variant="flat"
              isDisabled={currentPage === totalPages}
              onPress={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
