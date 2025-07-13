import React from 'react';
import { Card } from '../../components/common/Card';
import AppLayout from '../../components/layout/AppLayout';

const RolesPage: React.FC = () => {
  return (
    <AppLayout>
      <Card>
        <h1 className="text-2xl font-semibold">Roles Management</h1>
        <p>Manage your user roles and permissions here.</p>
        {/* Role management UI will go here */}
      </Card>
    </AppLayout>
  );
};

export default RolesPage; 