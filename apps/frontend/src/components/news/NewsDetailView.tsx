'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Layout from '../layout/Layout';
import PageBreadcrumbs from '../common/PageBreadcrumbs';
import Container from '../common/Container';
import TableOfContents from './TableOfContents';
import type { NewsItem, RelatedNewsItem } from '../../app/news/[slug]/page';

interface NewsDetailViewProps {
    newsItem: NewsItem;
    relatedNews: RelatedNewsItem[];
    headings: { id: string; text: string; level: number }[];
    processedContent: string;
}

export default function NewsDetailView({
    newsItem,
    relatedNews,
    headings,
    processedContent,
}: NewsDetailViewProps) {
    const tCommon = useTranslations('common');

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Breadcrumb */}
                <PageBreadcrumbs
                    items={[
                        { label: tCommon('home'), href: '/' },
                        { label: tCommon('news'), href: '/news' },
                        { label: newsItem.title, isCurrent: true },
                    ]}
                    fullWidth={true}
                />

                {/* News Header */}
                <header className="relative bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Decorative background element */}
                    {/* Background Elements */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        {newsItem.bannerImage ? (
                            <>
                                <img
                                    src={newsItem.bannerImage}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white dark:from-gray-950/90 dark:via-gray-950/70 dark:to-gray-950" />
                            </>
                        ) : (
                            /* Default Gradient Banner */
                            <div className="absolute inset-0 opacity-40">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[100%] bg-blue-100/30 dark:bg-blue-900/10 blur-[120px] rounded-full" />
                                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[100%] bg-purple-100/30 dark:bg-purple-900/10 blur-[120px] rounded-full" />
                            </div>
                        )}
                    </div>

                    <Container size="lg" className="relative py-16 lg:py-24">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Category */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    {newsItem.category}
                                </span>
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 leading-[1.15] tracking-tight"
                            >
                                {newsItem.title}
                            </motion.h1>

                            {/* Meta information */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-sm font-medium"
                            >
                                <div className="flex items-center gap-2.5 group">
                                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span>{newsItem.author}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 hidden sm:block" />
                                <div className="flex items-center gap-2.5 group">
                                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span>{new Date(newsItem.publishDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </motion.div>
                        </div>
                    </Container>
                </header>

                {/* Main Content Area */}
                <Container size="lg" className="py-8 lg:py-12">
                    <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-6 md:p-10 lg:p-12 space-y-10">
                            <main className="space-y-10">
                                {/* Featured Image */}
                                {newsItem.image && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-gray-800"
                                    >
                                        <img
                                            src={newsItem.image}
                                            alt={newsItem.title}
                                            className="w-full h-auto object-cover max-h-[700px] hover:scale-105 transition-transform duration-1000"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {/* Table of Contents - Minimalist integration */}
                                {headings.length > 0 && (
                                    <TableOfContents headings={headings} variant="minimal" />
                                )}

                                {/* Article Content */}
                                <article className="prose prose-lg md:prose-xl prose-gray dark:prose-invert max-w-none">
                                    <div className="relative">
                                        {/* Subtle accent decoration */}
                                        <div className="absolute -left-12 top-0 w-1 h-32 bg-gradient-to-b from-blue-500/40 to-transparent hidden lg:block" />

                                        <div
                                            className="text-gray-800 dark:text-gray-200 leading-[1.8] space-y-8"
                                            dangerouslySetInnerHTML={{ __html: processedContent }}
                                        />
                                    </div>
                                </article>

                                {/* Share Section */}
                                <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Chia sẻ bài viết</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <button className="flex items-center gap-3 px-8 py-3 bg-[#1877F2] text-white rounded-full hover:bg-[#1877F2]/90 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 font-bold">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                            Facebook
                                        </button>
                                        <button className="flex items-center gap-3 px-8 py-3 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1DA1F2]/90 hover:scale-105 transition-all shadow-lg shadow-blue-400/20 font-bold">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                            Twitter
                                        </button>
                                    </div>
                                </div>

                                {/* Related News Section */}
                                {relatedNews.length > 0 && (
                                    <section className="pt-16 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-10">
                                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Bài viết liên quan</h2>
                                            <a href="/news" className="group flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 transition-colors">
                                                Xem tất cả
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </a>
                                        </div>
                                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                                            {relatedNews.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ y: -8 }}
                                                    className="group bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
                                                >
                                                    <a href={`/news/${item.slug}`} className="block">
                                                        <div className="h-56 overflow-hidden relative">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-700">
                                                                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="p-7">
                                                            <div className="flex items-center text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-4">
                                                                <span>{item.category}</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-4 leading-snug group-hover:text-blue-600 transition-colors">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-gray-500 dark:text-gray-400 line-clamp-2 text-sm leading-relaxed">
                                                                {item.excerpt}
                                                            </p>
                                                        </div>
                                                    </a>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </main>
                        </div>
                    </div>
                </Container>

                {/* Back to News - Simplified */}
                <div className="border-t border-gray-100 dark:border-gray-800 pb-16">
                    <Container size="lg" className="pt-12 text-center">
                        <a
                            href="/news"
                            className="inline-flex items-center gap-2.5 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:scale-105 transition-all shadow-lg"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại tin tức
                        </a>
                    </Container>
                </div>
            </div>
        </Layout>
    );
}
