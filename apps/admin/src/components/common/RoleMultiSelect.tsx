import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, X, Users, Search, Shield, UserCheck } from 'lucide-react';
import { trpc } from '../../utils/trpc';

interface Role {
  id: string;
  name: string;
  code?: string;
  description?: string;
  userCount?: number;
  isActive?: boolean;
  isDefault?: boolean;
  permissionCount?: number;
}

interface RoleMultiSelectProps {
  value?: string[];
  onChange?: (selectedRoles: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export const RoleMultiSelect: React.FC<RoleMultiSelectProps> = ({
  value = [],
  onChange,
  placeholder = 'Select roles...',
  disabled = false,
  error,
  label,
  description,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch roles
  const { data: rolesResponse, isLoading } = trpc.adminRole.getAllRoles.useQuery({
    page: 1,
    limit: 100, // Get all roles for selection
    search: searchTerm,
    isActive: true, // Only show active roles for selection
  });

  const roles = (rolesResponse as any)?.data?.items || [];
  
  // Filter roles based on search term
  const filteredRoles = roles.filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get selected role names for display
  const selectedRoles = roles.filter((role: Role) => value.includes(role.id));

  const handleRoleToggle = (roleId: string) => {
    if (disabled) return;

    const newValue = value.includes(roleId)
      ? value.filter(id => id !== roleId)
      : [...value, roleId];
    
    onChange?.(newValue);
  };

  const handleRemoveRole = (roleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    
    const newValue = value.filter(id => id !== roleId);
    onChange?.(newValue);
  };

  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onChange?.([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.role-multiselect')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="role-multiselect relative">
        <div
          className={`min-h-[40px] w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 cursor-pointer transition-colors ${
            error
              ? 'border-red-300 focus-within:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus-within:border-primary-500'
          } ${
            disabled
              ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-60'
              : 'hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0 pl-1">
              {selectedRoles.length === 0 ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {placeholder}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedRoles.length} selected:
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {selectedRoles.slice(0, 2).map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded"
                      >
                        {role.name}
                        {!disabled && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveRole(role.id, e)}
                            className="hover:text-primary-900 dark:hover:text-primary-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {selectedRoles.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{selectedRoles.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {selectedRoles.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Clear all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-64 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            {/* Role list */}
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {searchTerm ? 'No roles found' : 'No roles available'}
                  </p>
                </div>
              ) : (
                filteredRoles.map((role: Role, index: number) => {
                  const isSelected = value.includes(role.id);
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleToggle(role.id)}
                      className={`group w-full px-3 py-2 text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      } ${index !== filteredRoles.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${
                          isSelected 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Users className="w-3.5 h-3.5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:!text-white truncate">
                                {role.name}
                              </p>
                              {role.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:!text-white truncate mt-0.5">
                                  {role.description}
                                </p>
                              )}
                            </div>
                            
                            {role.userCount !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 group-hover:!text-white group-hover:bg-blue-600 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                                {role.userCount} users
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {selectedRoles.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};