import React, { useState, useMemo } from 'react';
import { FiPlus, FiX, FiSearch } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Permission } from '../../types/permission';

interface QuickAddPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  roleName: string;
  onSuccess: () => void;
}

export const QuickAddPermissionModal: React.FC<QuickAddPermissionModalProps> = ({
  isOpen,
  onClose,
  roleId,
  roleName,
  onSuccess
}) => {
  const { t } = useTranslationWithBackend();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const { data: permissionsData, isLoading: permissionsLoading } = trpc.adminRole.getAvailablePermissions.useQuery(
    undefined,
    { enabled: isOpen }
  );

  // Fetch role's existing permissions
  const { data: roleData, isLoading: roleLoading } = trpc.adminRole.getRoleById.useQuery(
    { id: roleId },
    { enabled: isOpen && !!roleId }
  );

  const updateRolePermissionsMutation = trpc.adminRole.updateRole.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      setSelectedPermissions(new Set());
      setSearchTerm('');
    },
  });

  const permissions = (permissionsData as any)?.data || [];
  const rolePermissions = (roleData as any)?.data?.permissions || [];
  
  // Create a set of existing permission IDs for quick lookup
  const existingPermissionIds = useMemo(() => {
    return new Set(rolePermissions.map((p: Permission) => p.id));
  }, [rolePermissions]);

  // Initialize selected permissions with existing ones when role data loads
  React.useEffect(() => {
    if (isOpen && rolePermissions.length > 0 && selectedPermissions.size === 0) {
      setSelectedPermissions(new Set(rolePermissions.map((p: Permission) => p.id)));
    }
  }, [isOpen, rolePermissions, selectedPermissions.size]);

  const filteredPermissions = useMemo(() => {
    let filtered = permissions;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = permissions.filter((permission: Permission) =>
        permission.name.toLowerCase().includes(term) ||
        permission.resource.toLowerCase().includes(term) ||
        permission.action.toLowerCase().includes(term) ||
        (permission.description && permission.description.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [permissions, searchTerm]);

  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = () => {
    updateRolePermissionsMutation.mutate({
      id: roleId,
      data: {
        permissionIds: Array.from(selectedPermissions)
      }
    });
  };

  const handleClose = () => {
    onClose();
    setSelectedPermissions(new Set());
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                {t('roles.quick_add_permissions', 'Quick Add Permissions')}
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
                {t('roles.add_permissions_to_role', { 
                  roleName,
                  defaultValue: `Add permissions to role: ${roleName}`
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full input-with-left-icon pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('permissions.search_placeholder', 'Search permissions...')}
              />
            </div>

            {/* Permission List */}
            <div className="max-h-96 overflow-y-auto">
              {(permissionsLoading || roleLoading) ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : filteredPermissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? t('permissions.no_permissions_found', 'No permissions found')
                    : t('permissions.no_permissions_available', 'No permissions available')
                  }
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPermissions.map((permission: Permission) => {
                    const isExisting = existingPermissionIds.has(permission.id);
                    const isSelected = selectedPermissions.has(permission.id);
                    
                    return (
                      <div
                        key={permission.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handlePermissionToggle(permission.id)}
                      >
                        <div className="relative inline-flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-9 h-5 cursor-pointer" 
                             style={{ backgroundColor: isSelected ? '#2563eb' : '#d1d5db' }}>
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute left-0 inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out w-3.5 h-3.5 top-[2px] left-[2px]"
                            style={{
                              transform: isSelected ? 'translate(18px, 0)' : 'translate(2px, 0)'
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {permission.name}
                              </h4>
                              {isExisting && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {t('permissions.currently_assigned', 'Currently Assigned')}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {permission.resource}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {permission.action}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {permission.scope}
                              </span>
                            </div>
                          </div>
                          {permission.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {(() => {
                const toAdd = Array.from(selectedPermissions).filter(id => !existingPermissionIds.has(id));
                const toRemove = Array.from(existingPermissionIds).filter((id: string) => !selectedPermissions.has(id));
                const unchanged = Array.from(selectedPermissions).filter(id => existingPermissionIds.has(id));

                return (
                  <>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {t('permissions.total_selected', { 
                          count: selectedPermissions.size
                        })}
                      </p>
                    </div>

                    {toAdd.length > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {t('permissions.to_add_count', { 
                            count: toAdd.length
                          })}
                        </p>
                      </div>
                    )}

                    {toRemove.length > 0 && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {t('permissions.to_remove_count', { 
                            count: toRemove.length
                          })}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updateRolePermissionsMutation.isPending}
              className="w-full justify-center sm:ml-3 sm:w-auto"
            >
              {updateRolePermissionsMutation.isPending ? (
                <>
                  <Loading size="small" />
                  {t('common.updating', 'Updating...')}
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 mr-2" />
                  {t('permissions.update_permissions', 'Update Permissions')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={updateRolePermissionsMutation.isPending}
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