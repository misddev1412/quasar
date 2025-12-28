import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, ArrowLeft, FolderOpen } from 'lucide-react';
import { FiHome, FiEdit3 } from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { EditPostForm } from '../../components/posts/EditPostForm';
import { MediaManager } from '../../components/common/MediaManager';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { FormSubmitOptions, FormSubmitAction } from '../../types/forms';

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
  const lastSubmitActionRef = useRef<FormSubmitAction>('save');

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

  // tRPC mutation for updating post
  const updatePostMutation = trpc.adminPosts.updatePost.useMutation({
    onSuccess: (data) => {
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
    const post = (postData as any)?.data;
    if (!post) return {};
    
    return {
      id: post?.id,
      title: post?.translations?.[0]?.title || '',
      slug: post?.translations?.[0]?.slug || '',
      content: post?.translations?.[0]?.content || '',
      excerpt: post?.translations?.[0]?.excerpt || '',
      languageCode: post?.translations?.[0]?.locale || 'en',
      status: post?.status,
      type: post?.type,
      featuredImage: post?.featuredImage || '',
      imageGallery: post?.imageGallery || [],
      isFeatured: post?.isFeatured,
      allowComments: post?.allowComments,
      metaTitle: post?.translations?.[0]?.metaTitle || '',
      metaDescription: post?.translations?.[0]?.metaDescription || '',
      metaKeywords: post?.translations?.[0]?.metaKeywords || '',
      additionalTranslations: post?.translations?.slice(1) || [], // Additional translations excluding the first one
      categoryIds: post?.categories?.map((category: any) => category.id) || [],
    };
  }, [postData]);

  // Handle missing ID early (after all hooks)
  if (!id) {
    navigate('/posts');
    return null;
  }

  const handleSubmit = async (formData: any, options?: FormSubmitOptions) => {
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


  const pageActions = [
    {
      label: t('posts.back_to_posts', 'Back to Posts'),
      onClick: handleCancel,
      icon: <ArrowLeft className="w-4 h-4" />,
    },
    {
      label: 'Media Manager',
      onClick: () => setShowMediaManager(true),
      icon: <FolderOpen className="w-4 h-4" />,
      variant: 'primary' as const,
    },
  ];

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: 'Posts',
      href: '/posts',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: t('posts.edit', 'Edit Post'),
      icon: <FiEdit3 className="w-4 h-4" />,
    },
  ]), [t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (error || !postData) {
      return (
        <div className="p-4 md:p-8 text-red-500">
          {t('common.error')}: {(error as any)?.message || 'Failed to load post'}
        </div>
      );
    }

    return (
      <EditPostForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updatePostMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    );
  };

  return (
    <>
      <BaseLayout
        title={t('posts.edit', 'Edit Post')}
        description={t('posts.editDescription') || 'Update post content and metadata'}
        actions={pageActions}
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('posts.edit_post_information', 'Edit Post Information')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('posts.editDescription') || 'Update post content and metadata'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">{renderContent()}</CardContent>
        </Card>
        </div>
      </BaseLayout>

      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelect={handleMediaSelect}
        multiple={true}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        maxSize={50}
        title="Select Media for Post"
      />
    </>
  );
};

export default EditPostPage;
