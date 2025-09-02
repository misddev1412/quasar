import React, { useState, useMemo } from 'react';
import { FiPlus, FiX, FiSearch, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

interface QuickAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  roleName: string;
  onSuccess: (result: { addedCount: number; skippedCount: number }) => void;
}

export const QuickAddUserModal: React.FC<QuickAddUserModalProps> = ({
  isOpen,
  onClose,
  roleId,
  roleName,
  onSuccess
}) => {
  const { t } = useTranslationWithBackend();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: usersData, isLoading: usersLoading } = trpc.adminRole.searchUsersForRole.useQuery(
    {
      roleId,
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined
    },
    { enabled: isOpen && !!roleId }
  );

  const addUsersToRoleMutation = trpc.adminRole.addUsersToRole.useMutation({
    onSuccess: (response) => {
      const result = (response as any)?.data;
      onSuccess(result);
      onClose();
      setSelectedUsers(new Set());
      setSearchTerm('');
      setCurrentPage(1);
    },
  });

  const users = (usersData as any)?.data?.items || [];
  const totalUsers = (usersData as any)?.data?.total || 0;
  const totalPages = (usersData as any)?.data?.totalPages || 1;

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user: User) => user.id)));
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedUsers(new Set());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers(new Set());
  };

  const handleSubmit = () => {
    if (selectedUsers.size === 0) return;
    
    addUsersToRoleMutation.mutate({
      roleId,
      userIds: Array.from(selectedUsers)
    });
  };

  const handleClose = () => {
    onClose();
    setSelectedUsers(new Set());
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                {t('roles.quick_add_users', 'Quick Add Users')}
              </h3>
              <button
                onClick={handleClose}
                className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('roles.add_users_to_role', { 
                  roleName,
                  defaultValue: `Add users to role: ${roleName}`
                })}
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <div className="input-icon-left">
                <FiSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full input-with-left-icon pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('users.search_placeholder', 'Search users...')}
              />
            </div>

            {/* Select All */}
            {users.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.size === users.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('common.select_all', 'Select All')} ({users.length})
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUsers.size} {t('common.selected', 'selected')}
                </span>
              </div>
            )}

            {/* User List */}
            <div className="max-h-96 overflow-y-auto">
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? t('users.no_users_found', 'No users found')
                    : t('users.no_users_available', 'No users available for this role')
                  }
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user: User) => {
                    const isSelected = selectedUsers.has(user.id);
                    
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                user.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <FiUser className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.username}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                user.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {user.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    size="sm"
                  >
                    {t('common.previous', 'Previous')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    size="sm"
                  >
                    {t('common.next', 'Next')}
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t('common.showing', 'Showing')} <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> {t('common.to', 'to')}{' '}
                      <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> {t('common.of', 'of')}{' '}
                      <span className="font-medium">{totalUsers}</span> {t('common.results', 'results')}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">{t('common.previous', 'Previous')}</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">{t('common.next', 'Next')}</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedUsers.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('users.users_selected_count', { 
                    count: selectedUsers.size,
                    defaultValue: `${selectedUsers.size} user(s) selected to add to role`
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={addUsersToRoleMutation.isPending || selectedUsers.size === 0}
              className="w-full justify-center sm:ml-3 sm:w-auto"
            >
              {addUsersToRoleMutation.isPending ? (
                <>
                  <Loading size="small" />
                  {t('common.adding', 'Adding...')}
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  {t('users.add_users', 'Add Users')} ({selectedUsers.size})
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={addUsersToRoleMutation.isPending}
              className="mt-3 w-full justify-center sm:mt-0 sm:w-auto"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};