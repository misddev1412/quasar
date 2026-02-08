import React, { useCallback, useMemo } from 'react';
import { withAdminSeo } from '@admin/components/SEO';
import { AdminSeoData } from '@admin/hooks/useAdminSeo';
import { useAuth } from '@admin/hooks/useAuth';
import { isSuperAdminUser, isAdminUser, isManagerUser } from '@admin/utils/permission-access';
import { AdminDashboard, StaffDashboard, ManagerDashboard } from '@admin/components/dashboard';

// Define the static SEO data for the home page
const homeSeoData: AdminSeoData = {
  path: '/',
  title: 'Dashboard | Quasar Admin',
  description: 'Welcome to Quasar Admin Dashboard - Manage your application with ease',
  keywords: 'dashboard, admin, quasar, management',
  ogTitle: 'Quasar Admin Dashboard',
  ogDescription: 'Powerful admin dashboard for managing your application',
  ogType: 'website'
};

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Determine dashboard type based on user role
  const isAdmin = useMemo(() => {
    return isSuperAdminUser(user) || isAdminUser(user);
  }, [user]);

  const isManager = useMemo(() => {
    return isManagerUser(user);
  }, [user]);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isManager) {
    return <ManagerDashboard />;
  }

  return <StaffDashboard />;
};

// Wrap the HomePage component with SEO
export default withAdminSeo(HomePage, homeSeoData); 
