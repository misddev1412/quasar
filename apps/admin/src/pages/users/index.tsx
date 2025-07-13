import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, Column } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';

type User = {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string | Date;
};

const UserListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = trpc.adminUser.getAllUsers.useQuery({ page, limit });

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const actions = [
    {
      label: 'Create User',
      onClick: handleCreateUser,
      primary: true,
      icon: <FiPlus />,
    },
  ];

  const columns: Column<User>[] = [
    {
      header: 'Username',
      accessor: 'username',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Status',
      accessor: (item) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created At',
      accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical />
            </Button>
          }
          items={[
            { label: 'Edit', onClick: () => alert(`Editing ${item.id}`) },
            { label: 'Delete', onClick: () => alert(`Deleting ${item.id}`), className: 'text-red-500' },
          ]}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <BaseLayout title="User Management" description="Manage all users in the system" actions={actions}>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title="User Management" description="Manage all users in the system" actions={actions}>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }
  
  const users = (data as any)?.data?.items ?? [];
  const totalUsers = (data as any)?.data?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <BaseLayout title="User Management" description="Manage all users in the system" actions={actions}>
      <Table<User>
        columns={columns}
        data={users}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
        }}
      />
    </BaseLayout>
  );
};

export default UserListPage; 