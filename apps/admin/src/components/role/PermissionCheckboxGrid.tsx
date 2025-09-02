import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Eye, Edit, Trash, Plus, Settings, Users, Activity } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Loading } from '../common/Loading';
import { Alert, AlertDescription } from '../common/Alert';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
  isActive?: boolean;
}

interface PermissionCheckboxGridProps {
  selectedPermissionIds: string[];
  onPermissionChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

const getResourceIcon = (resource: string) => {
  const icons: Record<string, React.ReactNode> = {
    user: <Users className="w-4 h-4" />,
    role: <Shield className="w-4 h-4" />,
    permission: <Lock className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
    analytics: <Activity className="w-4 h-4" />,
    system: <Settings className="w-4 h-4" />,
  };
  return icons[resource.toLowerCase()] || <Lock className="w-4 h-4" />;
};

const getActionIcon = (action: string) => {
  const icons: Record<string, React.ReactNode> = {
    create: <Plus className="w-3 h-3" />,
    read: <Eye className="w-3 h-3" />,
    update: <Edit className="w-3 h-3" />,
    delete: <Trash className="w-3 h-3" />,
    execute: <Activity className="w-3 h-3" />,
    manage: <Settings className="w-3 h-3" />,
  };
  return icons[action.toLowerCase()] || <Lock className="w-3 h-3" />;
};

const getScopeColor = (scope: string) => {
  const colors: Record<string, string> = {
    own: 'text-blue-600 bg-blue-50 border-blue-200',
    team: 'text-green-600 bg-green-50 border-green-200', 
    department: 'text-purple-600 bg-purple-50 border-purple-200',
    organization: 'text-orange-600 bg-orange-50 border-orange-200',
    global: 'text-red-600 bg-red-50 border-red-200',
    any: 'text-gray-600 bg-gray-50 border-gray-200',
  };
  return colors[scope.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
};

export const PermissionCheckboxGrid: React.FC<PermissionCheckboxGridProps> = ({
  selectedPermissionIds,
  onPermissionChange,
  disabled = false,
}) => {
  const { t } = useTranslationWithBackend();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('all');

  // Fetch permissions using the real API
  const { data, isLoading, error } = trpc.adminPermission.getAllPermissions.useQuery({});

  // Process permissions data
  const permissions = useMemo(() => {
    if (!data || !(data as any)?.data) return [];
    const rawData = (data as any).data;
    
    // Ensure we have an array
    if (!Array.isArray(rawData)) {
      console.warn('Permissions API returned non-array data:', rawData);
      return [];
    }
    
    // Validate each permission object has required fields
    return rawData.filter(p => p && typeof p === 'object' && p.id && p.name && p.resource && p.action && p.scope) as Permission[];
  }, [data]);

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    // Ensure permissions is always an array
    if (!Array.isArray(permissions)) {
      return {};
    }

    let filteredPermissions = [...permissions]; // Create a copy to avoid mutations

    // Apply search filter
    if (searchTerm) {
      filteredPermissions = filteredPermissions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.scope.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply resource filter
    if (selectedResource !== 'all') {
      filteredPermissions = filteredPermissions.filter(p => p.resource === selectedResource);
    }

    // Ensure filteredPermissions is still an array before reduce
    if (!Array.isArray(filteredPermissions)) {
      return {};
    }

    // Group by resource
    const grouped = filteredPermissions.reduce((acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    // Sort resources and permissions within each group
    const sortedGroup: Record<string, Permission[]> = {};
    Object.keys(grouped)
      .sort()
      .forEach(resource => {
        sortedGroup[resource] = grouped[resource].sort((a, b) => a.name.localeCompare(b.name));
      });

    return sortedGroup;
  }, [permissions, searchTerm, selectedResource]);

  // Get unique resources for filter dropdown
  const resources = useMemo(() => {
    if (!Array.isArray(permissions)) {
      return [];
    }
    const resourceSet = new Set(permissions.map(p => p.resource));
    return Array.from(resourceSet).sort();
  }, [permissions]);

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    if (disabled) return;

    const newSelectedIds = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter(id => id !== permissionId)
      : [...selectedPermissionIds, permissionId];

    onPermissionChange(newSelectedIds);
  };

  // Handle resource group toggle (select/deselect all permissions in a resource)
  const handleResourceToggle = (resource: string) => {
    if (disabled) return;

    const resourcePermissions = groupedPermissions[resource];
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    const allSelected = resourcePermissionIds.every(id => selectedPermissionIds.includes(id));

    let newSelectedIds: string[];
    if (allSelected) {
      // Deselect all permissions in this resource
      newSelectedIds = selectedPermissionIds.filter(id => !resourcePermissionIds.includes(id));
    } else {
      // Select all permissions in this resource
      const newIds = resourcePermissionIds.filter(id => !selectedPermissionIds.includes(id));
      newSelectedIds = [...selectedPermissionIds, ...newIds];
    }

    onPermissionChange(newSelectedIds);
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (disabled || !Array.isArray(permissions)) return;
    const allPermissionIds = permissions.map(p => p.id);
    onPermissionChange(allPermissionIds);
  };

  const handleSelectNone = () => {
    if (disabled) return;
    onPermissionChange([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading size="small" />
        <span className="ml-2 text-sm text-gray-600">{t('common.loading_permissions', 'Loading permissions...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t('messages.failed_to_load_permissions', 'Failed to load permissions')}: {(error as any)?.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (permissions.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          {t('permissions.no_permissions_available', 'No permissions are available')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('permissions.search_permissions', 'Search permissions...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm h-10"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm h-10"
          >
            <option value="all">{t('common.all_resources', 'All Resources')}</option>
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {t('permissions.selected_count', {
            count: selectedPermissionIds.length,
            total: permissions.length,
          })}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.select_all', 'Select All')}
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            disabled={disabled}
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.select_none', 'Select None')}
          </button>
        </div>
      </div>

      {/* Permission Grid */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
          const resourcePermissionIds = resourcePermissions.map(p => p.id);
          const selectedInResource = resourcePermissionIds.filter(id => selectedPermissionIds.includes(id));
          const allSelected = resourcePermissionIds.length > 0 && selectedInResource.length === resourcePermissionIds.length;
          const someSelected = selectedInResource.length > 0 && selectedInResource.length < resourcePermissionIds.length;

          return (
            <div key={resource} className="border border-gray-200 rounded-lg p-4">
              {/* Resource Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleResourceToggle(resource)}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelected;
                          }
                        }}
                        onChange={() => {}} // Handled by onClick
                        disabled={disabled}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource)}
                      <h3 className="text-base font-medium text-gray-900">
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </h3>
                    </div>
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedInResource.length}/{resourcePermissionIds.length} {t('common.selected', 'selected')}
                </div>
              </div>

              {/* Permission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {resourcePermissions.map((permission) => {
                  const isSelected = selectedPermissionIds.includes(permission.id);
                  
                  return (
                    <div
                      key={permission.id}
                      className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handlePermissionToggle(permission.id)}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by div onClick
                          disabled={disabled}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      {/* Permission Info */}
                      <div className="pr-8">
                        <div className="flex items-center gap-2 mb-2">
                          {getActionIcon(permission.action)}
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {t(`permissions.names.${permission.name}`, permission.name)}
                          </h4>
                        </div>
                        <div className="mb-2">
                          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {permission.name}
                          </code>
                        </div>

                        {/* Action and Scope */}
                        <div className="flex gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {permission.action}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getScopeColor(permission.scope)}`}>
                            {permission.scope}
                          </span>
                        </div>

                        {/* Description */}
                        {permission.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(groupedPermissions).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>{t('permissions.no_permissions_match_filter', 'No permissions match your current filter')}</p>
        </div>
      )}
    </div>
  );
};

export default PermissionCheckboxGrid;