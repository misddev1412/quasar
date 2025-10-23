import { FiSearch, FiHome } from 'react-icons/fi';
import { SeoManager } from '../components/SEO/SeoManager';
import { Breadcrumb } from '../components/common/Breadcrumb';
import BaseLayout from '../components/layout/BaseLayout';

const SeoPage = () => {
  return (
    <BaseLayout title="SEO 管理" description="在这里管理您的 SEO 设置。">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
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
        />

        <SeoManager />
      </div>
    </BaseLayout>
  );
};

export default SeoPage; 