import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminSeo, AdminSeoData } from '../../hooks/useAdminSeo';

interface WithAdminSeoProps {
  path?: string;
  data?: AdminSeoData;
  defaultSeo?: Partial<AdminSeoData>;
}

/**
 * High-order component for adding SEO functionality to admin components
 * Uses static configuration instead of API calls
 */
export const AdminSeoHead: React.FC<WithAdminSeoProps> = ({ path, data, defaultSeo }) => {
  // If complete data is provided, use it directly, otherwise get from useAdminSeo
  const { seo } = data ? { seo: data } : useAdminSeo({
    path,
    defaultSeo
  });

  if (!seo) {
    // Default SEO fallback
    return (
      <Helmet>
        <title>Quasar Admin</title>
        <meta name="description" content="Admin dashboard for managing your application" />
      </Helmet>
    );
  }

  return (
    <Helmet>
      {seo.title && <title>{seo.title}</title>}
      {seo.description && <meta name="description" content={seo.description} />}
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}

      {/* Open Graph */}
      {(seo.ogTitle || seo.title) &&
        <meta property="og:title" content={seo.ogTitle || seo.title} />}
      {(seo.ogDescription || seo.description) &&
        <meta property="og:description" content={seo.ogDescription || seo.description} />}
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
      {seo.ogUrl && <meta property="og:url" content={seo.ogUrl} />}
      {seo.ogType && <meta property="og:type" content={seo.ogType} />}

      {/* Twitter */}
      {seo.twitterCard && <meta name="twitter:card" content={seo.twitterCard} />}
      {(seo.twitterTitle || seo.ogTitle || seo.title) &&
        <meta name="twitter:title" content={seo.twitterTitle || seo.ogTitle || seo.title} />}
      {(seo.twitterDescription || seo.ogDescription || seo.description) &&
        <meta name="twitter:description" content={seo.twitterDescription || seo.ogDescription || seo.description} />}
      {(seo.twitterImage || seo.ogImage) &&
        <meta name="twitter:image" content={seo.twitterImage || seo.ogImage} />}

      {/* Canonical URL */}
      {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}

      {/* Locale */}
      {seo.locale && <meta property="og:locale" content={seo.locale} />}

      {/* Render additionalMetaTags if any */}
      {seo.additionalMetaTags && Object.entries(seo.additionalMetaTags).map(([name, content]) => {
        // Decide whether to render as regular meta tag or og tag based on name
        if (name.startsWith('og:')) {
          return <meta key={name} property={name} content={content} />;
        }
        return <meta key={name} name={name} content={content} />;
      })}
    </Helmet>
  );
};

interface WithSeoHocProps {
  seoData?: AdminSeoData;
  defaultSeo?: Partial<AdminSeoData>;
}

/**
 * Higher-order component for wrapping components with admin SEO
 * @param WrappedComponent Component to wrap with SEO
 * @param defaultSeoData Optional default SEO data
 */
export const withAdminSeo = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultSeoData?: AdminSeoData
) => {
  const WithAdminSeo: React.FC<P & WithSeoHocProps> = ({ seoData, defaultSeo, ...props }) => {
    // Use provided seoData or default value
    const finalDefaultSeo = defaultSeo || defaultSeoData;

    return (
      <>
        <AdminSeoHead
          data={seoData}
          defaultSeo={finalDefaultSeo}
          path={seoData?.path || finalDefaultSeo?.path}
        />
        <WrappedComponent {...props as P} />
      </>
    );
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAdminSeo.displayName = `withAdminSeo(${displayName})`;

  return WithAdminSeo;
};

export default withAdminSeo;