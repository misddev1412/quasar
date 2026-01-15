'use client';

import React, { useState } from 'react';
import { Button, Card, Textarea, Avatar, Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FiThumbsUp, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked?: boolean;
  isVerified?: boolean;
}

interface CommentSectionProps {
  productId: string;
  comments?: Comment[];
  loading?: boolean;
  onCommentSubmit?: (comment: { content: string; parentId?: string }) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentReport?: (commentId: string) => void;
  className?: string;
  showPagination?: boolean;
  commentsPerPage?: number;
  sortType?: 'newest' | 'oldest' | 'popular';
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments = [],
  loading = false,
  onCommentSubmit,
  onCommentLike,
  onCommentReport,
  className = '',
  showPagination = true,
  commentsPerPage = 10,
  sortType = 'newest',
}) => {
  const t = useTranslations('product.detail.comments');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [currentSortType, setCurrentSortType] = useState(sortType);
  const [currentPage, setCurrentPage] = useState(1);

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    switch (currentSortType) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  // Filter top-level comments (no parentId)
  const topLevelComments = sortedComments.filter(comment => !comment.parentId);

  // Calculate pagination
  const totalPages = Math.ceil(topLevelComments.length / commentsPerPage);
  const startIndex = (currentPage - 1) * commentsPerPage;
  const paginatedComments = topLevelComments.slice(startIndex, startIndex + commentsPerPage);

  const handleSubmitComment = () => {
    if (newComment.trim() && onCommentSubmit) {
      onCommentSubmit({ content: newComment.trim() });
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim() && onCommentSubmit) {
      onCommentSubmit({ content: replyContent.trim(), parentId });
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (onCommentLike) {
      onCommentLike(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return t('time.justNow');
    } else if (diffInHours < 24) {
      return t('time.hoursAgo', { count: diffInHours });
    } else if (diffInHours < 168) {
      return t('time.daysAgo', { count: Math.floor(diffInHours / 24) });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-6'}`}>
      <div className="flex gap-3">
        <Avatar
          src={comment.userAvatar}
          name={comment.userName}
          size="sm"
          className="flex-shrink-0"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.userName}</span>
            {comment.isVerified && (
              <Chip size="sm" color="primary" variant="flat">
                ✓ {t('verified')}
              </Chip>
            )}
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>

          <p className="text-gray-700 text-sm mb-2">{comment.content}</p>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="light"
              className={`text-xs ${comment.isLiked ? 'text-blue-600' : 'text-gray-500'}`}
              onPress={() => handleLikeComment(comment.id)}
              startContent={<FiThumbsUp className={comment.isLiked ? "fill-current" : ""} />}
            >
              {comment.likes > 0 ? comment.likes : t('like')}
            </Button>

            {!isReply && (
              <Button
                size="sm"
                variant="light"
                className="text-xs text-gray-500"
                onPress={() => setReplyingTo(comment.id)}
                startContent={<FiMessageSquare />}
              >
                {t('reply')}
              </Button>
            )}

            <Button
              size="sm"
              variant="light"
              className="text-xs text-gray-500"
              onPress={() => onCommentReport?.(comment.id)}
              startContent={<FiAlertTriangle />}
            >
              {t('report')}
            </Button>
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('replyPlaceholder', { name: comment.userName })}
                minRows={2}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  onPress={() => handleSubmitReply(comment.id)}
                  isDisabled={!replyContent.trim()}
                >
                  {t('postReply')}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <Card className="p-8 text-center">
      <div className="text-5xl mb-4 flex justify-center text-gray-300">
        <FiMessageSquare />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h3>
      <p className="text-gray-600">{t('emptyDescription')}</p>
    </Card>
  );

  const renderSkeletons = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className={className}>{renderSkeletons()}</div>;
  }

  if (comments.length === 0) {
    return (
      <div className={className}>
        {renderEmptyState()}
        {/* Comment Form */}
        <div className="mt-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">{t('formTitle')}</h3>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('placeholder')}
              minRows={3}
              className="mb-3"
            />
            <Button
              color="primary"
              onPress={handleSubmitComment}
              isDisabled={!newComment.trim()}
            >
              {t('postComment')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Comment Input */}
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {t('title', { count: comments.length })}
        </h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('placeholder')}
          minRows={3}
          className="mb-3"
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={currentSortType === 'newest' ? 'solid' : 'flat'}
              color={currentSortType === 'newest' ? 'primary' : 'default'}
              onPress={() => setCurrentSortType('newest')}
            >
              {t('sort.newest')}
            </Button>
            <Button
              size="sm"
              variant={currentSortType === 'popular' ? 'solid' : 'flat'}
              color={currentSortType === 'popular' ? 'primary' : 'default'}
              onPress={() => setCurrentSortType('popular')}
            >
              {t('sort.popular')}
            </Button>
          </div>
          <Button
            color="primary"
            onPress={handleSubmitComment}
            isDisabled={!newComment.trim()}
          >
            {t('postComment')}
          </Button>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {paginatedComments.map(comment => renderComment(comment))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              isDisabled={currentPage === 1}
              onPress={() => setCurrentPage(currentPage - 1)}
            >
              {t('pagination.previous')}
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
                  onPress={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              size="sm"
              variant="flat"
              isDisabled={currentPage === totalPages}
              onPress={() => setCurrentPage(currentPage + 1)}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;