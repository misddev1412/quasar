import React, { useState, useMemo } from 'react';
import { Table, Column } from './Table';

// Sample data interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-07-30',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2024-07-29',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Moderator',
    status: 'inactive',
    createdAt: '2024-03-10',
    lastLogin: '2024-07-25',
  },
  // Add more sample data...
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `${i + 4}`,
    name: `User ${i + 4}`,
    email: `user${i + 4}@example.com`,
    role: ['Admin', 'User', 'Moderator'][i % 3],
    status: (i % 2 === 0 ? 'active' : 'inactive') as 'active' | 'inactive',
    createdAt: `2024-0${(i % 9) + 1}-${(i % 28) + 1}`,
    lastLogin: `2024-07-${(i % 30) + 1}`,
  })),
];

/**
 * Demo component showcasing the enhanced Table with column visibility and page size selection
 */
export const TableDemo: React.FC = () => {
  // Table state
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  
  // Column visibility state - initially all columns are visible
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'])
  );

  // Define columns with IDs for visibility control
  const columns: Column<User>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      isSortable: true,
      hideable: true, // This column can be hidden
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {user.status}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessor: 'createdAt',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      accessor: 'lastLogin',
      isSortable: true,
      hideable: true,
    },
  ], []);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue) return sampleUsers;
    
    return sampleUsers.filter(user =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.role.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(columnId);
      } else {
        newSet.delete(columnId);
      }
      return newSet;
    });
  };

  // Handle page size change (server-side simulation)
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Enhanced Table Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This demo showcases the enhanced Table component with column visibility selection and page size selection features.
        </p>
      </div>

      <Table
        data={paginatedData}
        columns={columns}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        visibleColumns={visibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        showColumnVisibility={true}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredData.length,
          itemsPerPage: pageSize,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handlePageSizeChange,
        }}
        bulkActions={[
          {
            label: 'Delete Selected',
            value: 'delete',
            variant: 'danger',
          },
          {
            label: 'Export Selected',
            value: 'export',
            variant: 'outline',
          },
        ]}
        onBulkAction={() => undefined}
        searchPlaceholder="Search users..."
        enableRowHover={true}
        density="normal"
      />

      {/* Demo information */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          New Features Demonstrated:
        </h3>
        <ul className="space-y-1 text-blue-800 dark:text-blue-200">
          <li>• <strong>Column Visibility:</strong> Click the "Columns" button to show/hide table columns</li>
          <li>• <strong>Page Size Selection:</strong> Use the dropdown at the bottom to change rows per page (10, 25, 50, 100)</li>
          <li>• <strong>Server-side Integration:</strong> Page size changes trigger callbacks for server-side pagination</li>
          <li>• <strong>Client-side Filtering:</strong> Column visibility is managed on the client side</li>
        </ul>
      </div>
    </div>
  );
};

export default TableDemo;
