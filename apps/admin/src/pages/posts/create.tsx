import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FolderOpen } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreatePostForm } from '../../components/posts/CreatePostForm';
import { MediaManager } from '../../components/common/MediaManager';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FormSubmitOptions, FormSubmitAction } from '../../types/forms';

// Transform the form data to match API expectations
interface CreatePostAPIData {
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  type: 'post' | 'page' | 'news' | 'event';
  featuredImage?: string;
  imageGallery?: Array<{
    id: string;
    url: string;
    alt?: string;
    caption?: string;
    order: number;
  }>;
  publishedAt?: Date;
  scheduledAt?: Date;
  isFeatured: boolean;
  allowComments: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  translations: Array<{
    locale: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }>;
  categoryIds?: string[];
  tagIds?: string[];
}

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [showMediaManager, setShowMediaManager] = useState(false);
  const lastSubmitActionRef = useRef<FormSubmitAction>('save');

  // tRPC mutation for creating post
  const createPostMutation = trpc.adminPosts.createPost.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('posts.createSuccess'),
        description: t('posts.createSuccessDescription'),
      });

      // Get the ID of the newly created post
      const newPostId = (data as any)?.data?.id;

      // Navigate based on submit action
      if (lastSubmitActionRef.current === 'save_and_stay' && newPostId) {
        // Redirect to edit page
        navigate(`/posts/${newPostId}/edit`);
      } else {
        // Redirect to list page
        navigate('/posts');
      }
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('posts.createError'),
        description: error.message || t('posts.createErrorDescription'),
      });
    },
  });

  const handleSubmit = async (formData: any, options?: FormSubmitOptions) => {
    // Track the submit action
    lastSubmitActionRef.current = options?.submitAction || 'save';

    try {
      // Transform form data to match API expectations
      const postData: CreatePostAPIData = {
        status: formData.status,
        type: formData.type,
        featuredImage: formData.featuredImage || undefined,
        imageGallery: formData.imageGallery || undefined,
        publishedAt: formData.status === 'published' ? (formData.publishedAt || new Date()) : undefined,
        scheduledAt: formData.status === 'scheduled' ? formData.scheduledAt : undefined,
        isFeatured: formData.isFeatured ?? false,
        allowComments: formData.allowComments ?? true,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
        translations: [
          {
            locale: formData.languageCode || 'en', // Use the selected language code
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            excerpt: formData.excerpt || undefined,
            metaTitle: formData.metaTitle || undefined,
            metaDescription: formData.metaDescription || undefined,
            metaKeywords: formData.metaKeywords || undefined,
          },
          // Add any additional translations if they exist
          ...(formData.additionalTranslations || []),
        ],
        categoryIds: formData.categoryIds || [],
        tagIds: formData.tagIds || [],
      };

      await createPostMutation.mutateAsync(postData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Post creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/posts');
  };

  const handleMediaSelect = (selectedMedia: any) => {
    // Handle selected media - you can customize this based on your needs
    if (Array.isArray(selectedMedia)) {
      addToast({
        type: 'success',
        title: 'Media Selected',
        description: `${selectedMedia.length} files selected`,
      });
    } else {
      addToast({
        type: 'success',
        title: 'Media Selected',
        description: `${selectedMedia.originalName} selected`,
      });
    }
    setShowMediaManager(false);
  };

  return (
    <>
      <CreatePageTemplate
        title={t('posts.create')}
        description={t('posts.createDescription')}
        icon={<FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('common.post', 'Post')}
        entityNamePlural={t('common.posts', 'Posts')}
        backUrl="/posts"
        onBack={handleCancel}
        isSubmitting={createPostMutation.isPending}
        maxWidth="full"
        breadcrumbs={[
          {
            label: t('navigation.home', 'Home'),
            href: '/',
          },
          {
            label: t('posts.title', 'Posts'),
            onClick: handleCancel,
          },
          {
            label: t('posts.create'),
          }
        ]}
        customActions={[
          {
            label: t('posts.media_manager'),
            onClick: () => setShowMediaManager(true),
            icon: <FolderOpen className="w-4 h-4" />,
            variant: 'primary' as const,
          },
        ]}
      >
        <CreatePostForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createPostMutation.isPending}
        />
      </CreatePageTemplate>

      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelect={handleMediaSelect}
        multiple={true}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        maxSize={50}
        title={t('posts.select_media_title')}
      />
    </>
  );
};

export default CreatePostPage;