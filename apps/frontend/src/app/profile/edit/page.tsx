'use client';

import Layout from '../../../components/Layout';
import ProfileLayout from '../../../components/profile/ProfileLayout';
import { PersonalInformation } from '../../../components/profile/PersonalInformation';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`/profile/${section}`);
  };

  return (
    <Layout>
      <ProfileLayout activeSection="personal">
        <PersonalInformation onSectionChange={handleSectionChange} />
      </ProfileLayout>
    </Layout>
  );
}