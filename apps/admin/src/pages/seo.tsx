import { FiSearch, FiHome } from 'react-icons/fi';
import { SeoManager } from '../components/SEO/SeoManager';
import BaseLayout from '../components/layout/BaseLayout';
import { useAdminSeo } from '../hooks/useAdminSeo';

const SeoPage = () => {
  // Set SEO for this page
  useAdminSeo({
    path: '/seo',
    defaultSeo: {
      title: 'SEO Management | Quasar Admin',
      description: 'Manage SEO settings and meta tags for better search engine visibility',
      keywords: 'SEO, meta tags, search engine optimization, admin'
    }
  });

  return (
    <BaseLayout
      title="SEO 管理"
      description="在这里管理您的 SEO 设置。"
      breadcrumbs={[
        {
          label: 'Home',
          href: '/',
          icon: <FiHome className="w-4 h-4" />
        },
        {
          label: 'SEO',
          icon: <FiSearch className="w-4 h-4" />
        }
      ]}
    >
      <div className="space-y-6">
        <SeoManager />
      </div>
    </BaseLayout>
  );
};

export default SeoPage; 
