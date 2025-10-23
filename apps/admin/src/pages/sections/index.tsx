import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiHome, FiLayout } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { SectionsManager } from '../../components/sections/SectionsManager';

const SectionsPage: React.FC = () => {
  const params = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const page = params.page || 'home';

  const handlePageChange = (nextPage: string) => {
    if (!nextPage) return;
    navigate(`/sections/${nextPage}`);
  };

  return (
    <BaseLayout
      title="Section Manager"
      description="Configure which sections appear on each page, manage translations, and update layout order."
    >
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
              label: 'Section Manager',
              icon: <FiLayout className="w-4 h-4" />
            }
          ]}
        />

        <SectionsManager page={page} onPageChange={handlePageChange} />
      </div>
    </BaseLayout>
  );
};

export default SectionsPage;
