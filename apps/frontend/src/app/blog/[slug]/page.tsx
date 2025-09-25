import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSideSEOWithFallback } from '../../../lib/seo-server';
import { SEOPageLayout } from '../../../components/SEOPageLayout';
import type { SEOData } from '../../../types/trpc';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fallback SEO data for blog posts
const blogSEOFallback: SEOData = {
  title: 'Blog',
  description: 'Read our latest articles and insights',
  keywords: 'blog, articles, insights, news, updates',
};

// Generate metadata for server-side SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pathname = `/blog/${slug}`;
  const seoData = await getServerSideSEOWithFallback(pathname, blogSEOFallback);

  const siteName = 'Your Site Name';
  const title = seoData.title.includes(siteName)
    ? seoData.title
    : `${seoData.title} | ${siteName}`;

  return {
    title,
    description: seoData.description || undefined,
    keywords: seoData.keywords || undefined,
    openGraph: {
      title,
      description: seoData.description || undefined,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: seoData.description || undefined,
    },
    other: seoData.additionalMetaTags || undefined,
  };
}

// Server component for blog post page
async function BlogPostPageContent({ params }: BlogPostPageProps) {
  const { slug } = await params;
  // Fetch SEO data server-side
  const pathname = `/blog/${slug}`;
  const serverSEOData = await getServerSideSEOWithFallback(pathname, blogSEOFallback);

  // Simulate fetching blog post data (replace with actual blog fetching logic)
  const blogPost = {
    title: slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    excerpt: 'This is an interesting article about various topics that matter to our readers.',
    content: `
      <h2>Introduction</h2>
      <p>This is a comprehensive blog post that demonstrates server-side SEO implementation. The SEO metadata for this page is loaded server-side before rendering, ensuring that search engines like Google can properly crawl and index the content.</p>

      <h2>Why Server-Side SEO Matters</h2>
      <p>Server-side SEO is crucial for several reasons:</p>
      <ul>
        <li><strong>Search Engine Crawling:</strong> Google and other search engines can read meta tags immediately without waiting for JavaScript to execute.</li>
        <li><strong>Performance:</strong> SEO metadata is available in the initial HTML response, improving page load perception.</li>
        <li><strong>Social Sharing:</strong> Social media platforms can properly scrape and display rich previews when content is shared.</li>
        <li><strong>Accessibility:</strong> Screen readers and other assistive technologies can access the metadata immediately.</li>
      </ul>

      <h2>Implementation Details</h2>
      <p>This implementation uses Next.js server components and server-side data fetching to ensure SEO data is available during server-side rendering. The process involves:</p>
      <ol>
        <li>Fetching SEO data from the backend tRPC API during server-side rendering</li>
        <li>Injecting meta tags into the HTML head before sending to the client</li>
        <li>Providing fallback SEO data for when the API is unavailable</li>
        <li>Allowing client-side updates for dynamic SEO changes</li>
      </ol>

      <h2>Benefits of This Approach</h2>
      <p>By implementing server-side SEO, we ensure that:</p>
      <ul>
        <li>Search engines receive complete SEO information immediately</li>
        <li>Social media sharing works correctly with rich previews</li>
        <li>The page remains functional even if the client-side JavaScript fails</li>
        <li>SEO data can be dynamically managed through the backend CMS</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Server-side SEO is essential for modern web applications that want to rank well in search engines and provide optimal social sharing experiences. This implementation provides a robust solution that works with both static and dynamic pages.</p>
    `,
    author: 'John Doe',
    publishDate: new Date().toISOString().split('T')[0],
  };

  if (!blogPost) {
    notFound();
  }

  return (
    <SEOPageLayout
      fallback={blogSEOFallback}
      serverSEOData={serverSEOData}
    >
      <article className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{blogPost.excerpt}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>By {blogPost.author}</span>
              <span className="mx-2">•</span>
              <span>{blogPost.publishDate}</span>
            </div>
          </header>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          <footer className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-4">Share This Article</h2>
            <p className="text-gray-600">
              This article demonstrates server-side SEO implementation. The meta tags
              are loaded server-side, ensuring proper indexing by search engines.
            </p>
          </footer>
        </div>
      </article>
    </SEOPageLayout>
  );
}

export default BlogPostPageContent;