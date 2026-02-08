import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serverTrpc } from '../../../utils/trpc-server';
import { getPublicSiteName } from '../../../lib/site-name';
import { processHtmlWithToc } from '../../../utils/toc';
import NewsDetailView from '../../../components/news/NewsDetailView';

// News item interface
export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  image?: string;
  bannerImage?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Related news interface
export interface RelatedNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishDate: string;
  category: string;
  image?: string;
}

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for server-side SEO
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch news data server-side
  const newsResponse = await serverTrpc.clientNews.getNewsBySlug.query({ slug }) as any;
  const newsItem = newsResponse?.data?.news as NewsItem | undefined;

  if (!newsItem) {
    notFound();
  }

  const pathname = `/news/${slug}`;

  // Use news-specific SEO fields with fallbacks
  const title = newsItem.title;
  const description = newsItem.excerpt || `Read the latest news: ${newsItem.title}. Stay updated with our announcements and updates.`;
  const keywords = `${newsItem.title}, ${newsItem.category}, news, updates, announcements`;
  const imageUrl = newsItem.image;

  const siteName = getPublicSiteName();
  const formattedTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: formattedTitle,
    description,
    keywords,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
    },
    openGraph: {
      title: formattedTitle,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
      type: 'article',
      publishedTime: newsItem.publishDate,
      modifiedTime: newsItem.updatedAt ? new Date(newsItem.updatedAt).toISOString() : newsItem.publishDate,
      authors: [newsItem.author],
      section: newsItem.category,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

// Server component for news detail page
async function NewsPageContent({ params }: NewsPageProps) {
  const { slug } = await params;

  // Fetch news data server-side
  const newsResponse = await serverTrpc.clientNews.getNewsBySlug.query({ slug }) as any;
  const newsItem = newsResponse?.data?.news as NewsItem | undefined;

  if (!newsItem) {
    notFound();
  }

  // Fetch related news server-side (latest news from same category or general latest)
  const relatedNewsResponse = await serverTrpc.clientNews.getNews.query({
    page: 1,
    limit: 4,
    category: newsItem.category,
    isActive: true,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  }) as any;

  const relatedNews = relatedNewsResponse?.data?.items?.filter((item: NewsItem) => item.id !== newsItem.id).slice(0, 3) as RelatedNewsItem[] || [];
  const pathname = `/news/${slug}`;
  const siteName = getPublicSiteName();
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;
  const description = newsItem.excerpt || `Read the latest news: ${newsItem.title}. Stay updated with our announcements and updates.`;
  const publishedIso = new Date(newsItem.publishDate).toISOString();
  const updatedIso = newsItem.updatedAt ? new Date(newsItem.updatedAt).toISOString() : publishedIso;
  const keywords = `${newsItem.title}, ${newsItem.category}, news, updates, announcements`;

  const articleJsonLd: Record<string, unknown> = {
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: newsItem.title,
    description,
    datePublished: publishedIso,
    dateModified: updatedIso,
    author: {
      '@type': 'Person',
      name: newsItem.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    articleSection: newsItem.category,
    keywords,
    url: canonicalUrl,
  };

  if (newsItem.image) {
    articleJsonLd.image = [newsItem.image];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      articleJsonLd,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'News',
            item: `${process.env.NEXT_PUBLIC_SITE_URL}/news`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: newsItem.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const { content: processedContent, headings } = processHtmlWithToc(newsItem.content);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is server-rendered so crawlers get structured data without JS.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsDetailView
        newsItem={newsItem}
        relatedNews={relatedNews}
        headings={headings}
        processedContent={processedContent}
      />
    </>
  );
}

export default NewsPageContent;
