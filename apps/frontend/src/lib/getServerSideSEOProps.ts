import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { getServerSideSEOWithFallback } from './seo-server';
import type { SEOData } from '../types/trpc';

/**
 * Get server-side SEO props for a page
 * This function should be called in getServerSideProps or getStaticProps
 */
export async function getServerSideSEOProps(
  context: GetServerSidePropsContext | GetStaticPropsContext,
  fallback: SEOData
) {
  const pathname = context.params?.path
    ? Array.isArray(context.params.path)
      ? `/${context.params.path.join('/')}`
      : `/${context.params.path}`
    : context.resolvedPath || '/';

  const seoData = await getServerSideSEOWithFallback(pathname, fallback);

  return {
    props: {
      serverSEOData: seoData,
    },
  };
}

/**
 * Higher-order function to wrap getServerSideProps with SEO data
 */
export function withServerSideSEO<T extends Record<string, any>>(
  getServerSidePropsFn?: (context: GetServerSidePropsContext) => Promise<T>,
  fallback: SEOData = {
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
  }
) {
  return async (context: GetServerSidePropsContext) => {
    const seoProps = await getServerSideSEOProps(context, fallback);

    if (getServerSidePropsFn) {
      const userProps = await getServerSidePropsFn(context);
      return {
        ...userProps,
        props: {
          ...userProps.props,
          ...seoProps.props,
        },
      };
    }

    return seoProps;
  };
}

/**
 * Higher-order function to wrap getStaticProps with SEO data
 */
export function withStaticSEO<T extends Record<string, any>>(
  getStaticPropsFn?: (context: GetStaticPropsContext) => Promise<T>,
  fallback: SEOData = {
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
  }
) {
  return async (context: GetStaticPropsContext) => {
    const seoProps = await getServerSideSEOProps(context, fallback);

    if (getStaticPropsFn) {
      const userProps = await getStaticPropsFn(context);
      return {
        ...userProps,
        props: {
          ...userProps.props,
          ...seoProps.props,
        },
      };
    }

    return seoProps;
  };
}