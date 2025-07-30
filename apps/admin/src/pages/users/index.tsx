import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, Column } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { UserFilters } from '../../components/features/UserFilters';
import { User, UserRole, UserFiltersType } from '../../types/user';

// Helper functions for URL parameter validation
const validateUserRole = (role: string | null): UserRole | undefined => {
  if (!role) return undefined;
  return Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : undefined;
};

const validateBoolean = (value: string | null): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const validatePage = (page: string | null): number => {
  const pageNum = page ? parseInt(page, 10) : 1;
  return pageNum > 0 ? pageNum : 1;
};

const UserListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => validatePage(searchParams.get('page')));
  const [limit] = useState(10);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>(() => ({
    role: validateUserRole(searchParams.get('role')),
    isActive: validateBoolean(searchParams.get('isActive')),
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  }));
  const [sortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder] = useState(() => searchParams.get('sortOrder') || 'desc');

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams();

      // Add non-empty parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          newSearchParams.set(key, value);
        }
      });

      // Update URL without causing navigation
      setSearchParams(newSearchParams, { replace: true });
    }, 100); // Short debounce for URL updates
  }, [setSearchParams]);

  // Debounce search value for API calls and URL updates
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1); // Reset to first page when search changes

      // Update URL with search parameter
      updateUrlParams({
        search: searchValue || undefined,
        role: filters.role || undefined,
        isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page: searchValue ? '1' : String(page), // Reset to page 1 if searching
        sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
        sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
      });
    }, 400); // 400ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, filters, page, sortBy, sortOrder, updateUrlParams]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Build query parameters including filters
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    role: filters.role as any || undefined,
    isActive: filters.isActive !== undefined ? filters.isActive : undefined,
  };

  const { data, isLoading, error } = trpc.adminUser.getAllUsers.useQuery(queryParams);

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleFilterChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change

    // Update URL with new filters
    updateUrlParams({
      search: searchValue || undefined,
      role: newFilters.role || undefined,
      isActive: newFilters.isActive !== undefined ? String(newFilters.isActive) : undefined,
      dateFrom: newFilters.dateFrom || undefined,
      dateTo: newFilters.dateTo || undefined,
      page: '1', // Reset to page 1 when filters change
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);

    // Update URL to remove all filters but keep search
    updateUrlParams({
      search: searchValue || undefined,
      role: undefined,
      isActive: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: '1',
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    // Update URL with new page
    updateUrlParams({
      search: searchValue || undefined,
      role: filters.role || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Count active filters for display (search is handled separately by Table component)
  const activeFilterCount = Object.values(filters).filter(value =>
    value !== undefined && value !== null && value !== ''
  ).length;

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
      header: 'User',
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {item.profile?.firstName && item.profile?.lastName
              ? `${item.profile.firstName} ${item.profile.lastName}`
              : item.username
            }
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {item.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {item.role || 'USER'}
        </span>
      ),
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
      <div className="space-y-6">
        {/* Filter Panel */}
        {showFilters && (
          <UserFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Users Table */}
        <Table<User>
          columns={columns}
          data={users}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          searchPlaceholder="Search users by name, email, or username..."
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            onPageChange: handlePageChange,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default UserListPage; 