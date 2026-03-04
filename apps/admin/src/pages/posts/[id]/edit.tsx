import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { MediaManager, Alert, AlertDescription, AlertTitle, StandardFormPage } from '@admin/components/common';
import { EditPostForm } from '@admin/components/posts';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useUrlTabs } from '@admin/hooks/useUrlTabs';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { FormSubmitOptions, FormSubmitAction } from '@admin/types/forms';
import { useAuth } from '@admin/hooks/useAuth';
import { canEditRouteResource } from '@admin/utils/permission-access';
import { useLanguages } from '@admin/hooks/useLanguages';

interface UpdatePostPayload {
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

// Transform the form data to match API expectations
interface UpdatePostAPIData {
  id: string;
  data: UpdatePostPayload;
}

const EditPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [showMediaManager, setShowMediaManager] = useState(false);
  const trpcContext = trpc.useContext();
  const lastSubmitActionRef = useRef<FormSubmitAction>('save');
  const { user } = useAuth();
  const location = useLocation();
  const { defaultLanguage } = useLanguages();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'media', 'seo', 'translations'] // Maps to tab IDs
  });

  // Fetch existing post data (only if ID exists)
  const { data: postData, isLoading, error } = trpc.adminPosts.getPostById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const post = (postData as any)?.data;
  const postOwnerId =
    post?.author?.id ||
    post?.authorId ||
    post?.author_id ||
    post?.createdBy ||
    post?.created_by;
  const canEdit = canEditRouteResource(location.pathname, user, postOwnerId);
  const isEditRestricted = Boolean(post) && !canEdit;

  // tRPC mutation for updating post
  const updatePostMutation = trpc.adminPosts.updatePost.useMutation({
    onSuccess: async (data) => {
      // Invalidate both list and detail queries
      await Promise.all([
        trpcContext.adminPosts.getPosts.invalidate(),
        id ? trpcContext.adminPosts.getPostById.invalidate({ id: id as string }) : Promise.resolve(),
      ]);

      addToast({
        type: 'success',
        title: t('posts.updateSuccess'),
        description: t('posts.updateSuccessDescription') || 'Post updated successfully',
      });

      // Navigate based on submit action
      if (lastSubmitActionRef.current !== 'save_and_stay') {
        // Redirect to list page
        navigate('/posts');
      }
      // If save_and_stay, stay on the current edit page
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('posts.updateError'),
        description: error.message || t('posts.updateErrorDescription') || 'Failed to update post',
      });
    },
  });

  // Transform post data for the form
  const initialFormData = useMemo(() => {
    if (!post) return {};

    return {
      id: post?.id,
      title: post?.translations?.[0]?.title || '',
      slug: post?.translations?.[0]?.slug || '',
      content: post?.translations?.[0]?.content || '',
      excerpt: post?.translations?.[0]?.excerpt || '',
      languageCode: post?.translations?.[0]?.locale || defaultLanguage?.code || 'vi',
      status: post?.status,
      type: post?.type,
      featuredImage: post?.featured_image || post?.featuredImage || '',
      bannerImage: post?.banner_image || post?.bannerImage || '',
      imageGallery: post?.image_gallery || post?.imageGallery || [],
      isFeatured: post?.isFeatured,
      allowComments: post?.allowComments,
      metaTitle: post?.translations?.[0]?.metaTitle || '',
      metaDescription: post?.translations?.[0]?.metaDescription || '',
      metaKeywords: post?.translations?.[0]?.metaKeywords || '',
      additionalTranslations: post?.translations?.slice(1) || [], // Additional translations excluding the first one
      categoryIds: post?.categories?.map((category: any) => category.id) || [],
    };
  }, [post]);

  // Handle missing ID early (after all hooks)
  if (!id) {
    navigate('/posts');
    return null;
  }

  const handleSubmit = async (formData: any, options?: FormSubmitOptions) => {
    if (isEditRestricted) {
      addToast({
        type: 'error',
        title: t('common.permission_denied', 'Permission denied'),
        description: t(
          'posts.edit_restricted',
          'You can only edit posts you created unless you are an admin.'
        ),
      });
      return;
    }

    // Track the submit action
    lastSubmitActionRef.current = options?.submitAction || 'save';

    try {
      // Transform form data to match API expectations
      const postUpdateData: UpdatePostAPIData = {
        id,
        data: {
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
              locale: formData.languageCode || defaultLanguage?.code || 'vi',
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
        },
      };

      await updatePostMutation.mutateAsync(postUpdateData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Post update error:', error);
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
        title: t('common.media.mediaSelected', 'Media Selected'),
        description: t('common.media.filesSelected', { count: selectedMedia.length, defaultValue: '{{count}} files selected' }),
      });
    } else {
      addToast({
        type: 'success',
        title: t('common.media.mediaSelected', 'Media Selected'),
        description: t('common.media.fileSelected', { name: selectedMedia.originalName, defaultValue: '{{name}} selected' }),
      });
    }
    setShowMediaManager(false);
  };


  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
    },
    {
      label: t('posts.title', 'Posts'),
      onClick: handleCancel,
    },
    {
      label: post?.translations?.[0]?.title || t('posts.edit', 'Edit Post'),
    },
  ]), [handleCancel, post, t]);

  const formId = 'post-edit-form';

  return (
    <>
      <StandardFormPage
        title={t('posts.edit', 'Edit Post')}
        description={t('posts.editDescription') || 'Update post content and metadata'}
        icon={<FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('common.post', 'Post')}
        entityNamePlural={t('common.posts', 'Posts')}
        backUrl="/posts"
        onBack={handleCancel}
        onCancel={handleCancel}
        isSubmitting={updatePostMutation.isPending}
        mode="update"
        isLoading={isLoading}
        error={error}
        formId={formId}
        breadcrumbs={breadcrumbs}
      >
        {isEditRestricted && (
          <Alert variant="warning">
            <AlertTitle>{t('common.permission_denied', 'Permission denied')}</AlertTitle>
            <AlertDescription>
              {t(
                'posts.edit_restricted',
                'You can only edit posts you created unless you are an admin.'
              )}
            </AlertDescription>
          </Alert>
        )}
        <EditPostForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updatePostMutation.isPending}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          readonly={isEditRestricted}
          showActions={false}
          formId={formId}
        />
      </StandardFormPage>

      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelect={handleMediaSelect}
        multiple={true}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        maxSize={50}
        title={t('posts.select_media_title', 'Select Media for Post')}
      />
    </>
  );
};

export default EditPostPage;
