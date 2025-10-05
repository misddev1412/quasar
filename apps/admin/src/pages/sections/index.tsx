import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BaseLayout from '../../components/layout/BaseLayout';
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
      <SectionsManager page={page} onPageChange={handlePageChange} />
    </BaseLayout>
  );
};

export default SectionsPage;
