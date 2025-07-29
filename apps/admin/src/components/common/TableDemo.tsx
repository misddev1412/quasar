import React, { useState, useMemo } from 'react';
import { Table, Column, SortDescriptor } from './Table';

// Sample data interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T09:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00Z',
    createdAt: '2023-07-15T14:30:00Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Viewer',
    status: 'inactive',
    lastLogin: '2024-01-10T08:15:00Z',
    createdAt: '2023-08-20T11:00:00Z',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Editor',
    status: 'pending',
    lastLogin: '2024-01-12T13:20:00Z',
    createdAt: '2023-09-05T16:45:00Z',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-16T09:10:00Z',
    createdAt: '2023-10-10T10:15:00Z',
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: User['status'] }) => {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const TableDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<User> | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Define table columns
  const columns: Column<User>[] = [
    {
      header: 'Name',
      accessor: 'name',
      isSortable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      isSortable: true,
    },
    {
      header: 'Role',
      accessor: 'role',
      isSortable: true,
    },
    {
      header: 'Status',
      accessor: (user) => <StatusBadge status={user.status} />,
      isSortable: true,
    },
    {
      header: 'Last Login',
      accessor: (user) => formatDate(user.lastLogin),
      isSortable: true,
    },
    {
      header: 'Created',
      accessor: (user) => formatDate(user.createdAt),
      isSortable: true,
    },
  ];

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = sampleUsers;

    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.role.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply sorting
    if (sortDescriptor) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortDescriptor.columnAccessor as keyof User];
        const bValue = b[sortDescriptor.columnAccessor as keyof User];
        
        if (aValue < bValue) {
          return sortDescriptor.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDescriptor.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [searchValue, sortDescriptor]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleRowClick = (user: User) => {
    console.log('Row clicked:', user);
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'Selected IDs:', Array.from(selectedIds));
    
    if (action === 'delete') {
      // Simulate delete action
      setIsLoading(true);
      setTimeout(() => {
        setSelectedIds(new Set());
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const bulkActions = [
    { label: 'Export', value: 'export' },
    { label: 'Activate', value: 'activate' },
    { label: 'Deactivate', value: 'deactivate' },
    { label: 'Delete', value: 'delete', variant: 'danger' as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Enhanced Table Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstration of the enhanced Table component with modern UI/UX features.
        </p>
      </div>

      <Table
        data={paginatedData}
        columns={columns}
        isLoading={isLoading}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onFilterClick={handleFilterClick}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={handleRowClick}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredAndSortedData.length,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: setItemsPerPage,
        }}
        emptyMessage="No users found matching your criteria."
        emptyAction={{
          label: 'Add User',
          onClick: () => console.log('Add user clicked'),
        }}
        className="shadow-lg"
      />
    </div>
  );
};

export default TableDemo;
