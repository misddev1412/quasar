'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { LoyaltyDashboard } from '../../../components/profile/LoyaltyDashboard';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`/profile/${section}`);
  };

  return (
    <Layout>
      <ProfileLayout activeSection="loyalty">
        <LoyaltyDashboard onSectionChange={handleSectionChange} />
      </ProfileLayout>
    </Layout>
  );
}