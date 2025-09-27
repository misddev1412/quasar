'use client';

import Layout from '../../components/layout/Layout';
import ProfileLayout from '../../components/layout/ProfileLayout';
import { ProfileOverview } from '../../components/profile/ProfileOverview';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`/profile`);
  };

  return (
    <Layout>
      <ProfileLayout activeSection="overview">
        <ProfileOverview onSectionChange={handleSectionChange} />
      </ProfileLayout>
    </Layout>
  );
}