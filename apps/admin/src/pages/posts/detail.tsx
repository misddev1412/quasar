import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Calendar, User, Tag, Globe, Clock, Eye } from 'lucide-react';
import { FiHome, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { PostStatus } from '../../types/post';

const PostDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslationWithBackend();

    // Fetch existing post data
    const { data: postData, isLoading, error } = trpc.adminPosts.getPostById.useQuery(
        { id: id as string },
        { enabled: !!id }
    );

    const post = (postData as any)?.data;
    const currentTranslation = post?.translations?.[0];

    const handleBack = () => {
        navigate('/posts');
    };

    const handleEdit = () => {
        navigate(`/posts/${id}`);
    };

    const pageActions = [
        {
            label: t('posts.back_to_posts', 'Back to Posts'),
            onClick: handleBack,
            icon: <ArrowLeft className="w-4 h-4" />,
        },
        {
            label: t('common.edit', 'Edit'),
            onClick: handleEdit,
            icon: <Pencil className="w-4 h-4" />,
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
            icon: <FiFileText className="w-4 h-4" />,
        },
        {
            label: currentTranslation?.title || t('posts.detail', 'Post Details'),
            icon: <Eye className="w-4 h-4" />,
        },
    ]), [t, currentTranslation]);

    const getStatusColor = (status: PostStatus) => {
        switch (status) {
            case PostStatus.PUBLISHED:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case PostStatus.DRAFT:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case PostStatus.ARCHIVED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case PostStatus.SCHEDULED:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    if (isLoading) {
        return (
            <BaseLayout
                title={t('posts.detail', 'Post Details')}
                breadcrumbs={breadcrumbs}
                actions={pageActions}
            >
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            </BaseLayout>
        );
    }

    if (error || !post) {
        return (
            <BaseLayout
                title={t('posts.detail', 'Post Details')}
                breadcrumbs={breadcrumbs}
                actions={pageActions}
            >
                <div className="p-4 md:p-8 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    {t('common.error')}: {(error as any)?.message || 'Failed to load post'}
                </div>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout
            title={t('posts.detail', 'Post Details')}
            breadcrumbs={breadcrumbs}
            actions={pageActions}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Post Header & Content */}
                    <Card className="overflow-hidden">
                        {post.featuredImage && (
                            <div className="w-full h-64 md:h-80 relative bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={post.featuredImage}
                                    alt={currentTranslation?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {currentTranslation?.title || <span className="text-gray-400 italic">Untitled Post</span>}
                                </h1>

                                {currentTranslation?.excerpt && (
                                    <div className="text-lg text-gray-600 dark:text-gray-300 border-l-4 border-primary-500 pl-4 py-1 italic">
                                        {currentTranslation.excerpt}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                        {t(`posts.status.${post.status}`, post.status)}
                                    </span>

                                    {post.author && (
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            <span>{post.author.username || post.author.email}</span>
                                        </div>
                                    )}

                                    {post.publishedAt && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>{format(new Date(post.publishedAt), 'PPP')}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4" />
                                        <span className="uppercase">{currentTranslation?.locale}</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary-600"
                                dangerouslySetInnerHTML={{ __html: currentTranslation?.content || '' }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Metadata Card */}
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Metadata
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200 capitalize">{post.type}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</label>
                                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-1.5 rounded mt-1">
                                        {currentTranslation?.slug}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {post.categories && post.categories.length > 0 ? (
                                            post.categories.map((cat: any) => (
                                                <span key={cat.id} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {cat.translations?.[0]?.name || cat.code}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No categories</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamps</label>
                                    <div className="mt-1 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Created</span>
                                            <span className="text-gray-900 dark:text-gray-300">{format(new Date(post.createdAt), 'PP p')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Updated</span>
                                            <span className="text-gray-900 dark:text-gray-300">{format(new Date(post.updatedAt), 'PP p')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Card */}
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                SEO Information
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Title</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-200">
                                        {currentTranslation?.metaTitle || <span className="text-gray-400 italic">Not set</span>}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Description</label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {currentTranslation?.metaDescription || <span className="text-gray-400 italic">Not set</span>}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {currentTranslation?.metaKeywords ? (
                                            currentTranslation.metaKeywords.split(',').map((keyword: string, idx: number) => (
                                                <span key={idx} className="inline-block px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                                                    {keyword.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No keywords</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BaseLayout>
    );
};

export default PostDetailPage;
