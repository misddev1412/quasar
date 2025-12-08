import React, { useState } from 'react';
import { Button, Card, Input, Textarea } from '@heroui/react';
import Rating from '../common/Rating';

interface ReviewFormProps {
  onSubmit: (review: { rating: number; title: string; comment: string }) => void;
  initialRating?: number;
  initialTitle?: string;
  initialComment?: string;
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  loading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  initialRating = 0,
  initialTitle = '',
  initialComment = '',
  className = '',
  submitButtonText = 'Submit Review',
  cancelButtonText = 'Cancel',
  showCancelButton = true,
  onCancel,
  loading = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(initialTitle);
  const [comment, setComment] = useState(initialComment);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!title.trim()) {
      newErrors.title = 'Please enter a review title';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please enter your review comments';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: '' }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (errors.comment) {
      setErrors((prev) => ({ ...prev, comment: '' }));
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <Rating value={rating} onChange={handleRatingChange} size="lg" className="mb-1" />
            <span className="text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
            </span>
          </div>
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
        </div>

        {/* Review Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Summarize your experience"
            variant="bordered"
            isInvalid={!!errors.title}
            errorMessage={errors.title}
            fullWidth
          />
        </div>

        {/* Review Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={comment}
            onChange={handleCommentChange as any}
            placeholder="Share your thoughts about this product"
            variant="bordered"
            minRows={4}
            isInvalid={!!errors.comment}
            errorMessage={errors.comment}
            fullWidth
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {comment.length}/1000 characters
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {showCancelButton && (
            <Button type="button" variant="flat" onPress={handleCancel} isDisabled={loading}>
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" color="primary" isLoading={loading}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ReviewForm;
