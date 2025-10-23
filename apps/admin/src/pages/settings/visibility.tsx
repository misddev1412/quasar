import React, { useState } from 'react';
import { withSeo } from '../../components/SEO/withSeo';
import BaseLayout from '../../components/layout/BaseLayout';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { FiHome, FiSettings } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { Toggle } from '../../components/common/Toggle';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

interface SettingsVisibilityPageProps {}

const SettingsVisibilityPage: React.FC<SettingsVisibilityPageProps> = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  // Use pagination when searching or on pages beyond 1
  const usePagination = currentPage > 1 || searchTerm !== '';

  const {
    settings,
    groupedSettings,
    isLoading,
    updateSetting,
    pagination
  } = useSettings({
    pagination: usePagination ? {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm
    } : undefined,
    group: selectedGroup === 'all' ? undefined : selectedGroup
  });

  // Group settings and count total
  const allGroups = Object.keys(groupedSettings || {});
  const totalSettings = pagination?.total || settings?.length || 0;
  const publicSettings = settings?.filter(s => s.isPublic).length || 0;
  const privateSettings = totalSettings - publicSettings;

  // When using backend pagination, settings are already filtered and paginated
  const displaySettings = settings || [];
  const totalPages = pagination?.totalPages || Math.ceil((settings?.length || 0) / itemsPerPage);

  // Description editing functions
  const startEditingDescription = (setting: SettingData) => {
    setEditingId(setting.id);
    setEditingDescription(setting.description || '');
  };

  const cancelEditingDescription = () => {
    setEditingId(null);
    setEditingDescription('');
  };

  const saveDescription = async (setting: SettingData) => {
    try {
      await updateSetting(setting.id, { description: editingDescription });
      addToast({
        type: 'success',
        title: t('settings.description_update_success', 'Description Updated'),
        description: t('settings.description_update_desc', 'Description has been updated successfully.')
      });
      setEditingId(null);
      setEditingDescription('');
    } catch (error) {
      console.error('Failed to update description:', error);
      addToast({
        type: 'error',
        title: t('settings.description_update_failed', 'Update Failed'),
        description: t('settings.description_update_failed_desc', 'Could not update description. Please try again.')
      });
    }
  };

  const handleTogglePublic = async (setting: SettingData) => {
    try {
      await updateSetting(setting.id, { isPublic: !setting.isPublic });
      addToast({
        type: 'success',
        title: t('settings.visibility_update_success', 'Visibility Updated'),
        description: t('settings.visibility_update_desc', `"${setting.key}" is now ${!setting.isPublic ? 'public' : 'private'}`)
      });
    } catch (error) {
      console.error('Failed to update visibility:', error);
      addToast({
        type: 'error',
        title: t('settings.visibility_update_failed', 'Update Failed'),
        description: t('settings.visibility_update_failed_desc', 'Could not update visibility. Please try again.')
      });
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGroup]);

  const getGroupColor = (group: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-blue-100 text-blue-800',
      appearance: 'bg-purple-100 text-purple-800',
      system: 'bg-gray-100 text-gray-800',
      other: 'bg-green-100 text-green-800'
    };
    return colors[group] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      string: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      number: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      boolean: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      json: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      array: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    };
    return icons[type] || icons.string;
  };

  if (isLoading) {
    return (
      <BaseLayout
        title={t('settings.visibility_title', 'Settings Visibility')}
        description={t('settings.visibility_description', 'Manage which settings are visible to users')}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('settings.visibility_title', 'Settings Visibility')}
      description={t('settings.visibility_description', 'Manage which settings are visible to users')}
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: 'Home',
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: t('navigation.settings', 'Settings'),
              href: '/settings',
              icon: <FiSettings className="w-4 h-4" />
            },
            {
              label: t('settings.visibility_title', 'Settings Visibility'),
              icon: <FiSettings className="w-4 h-4" />
            }
          ]}
        />

        {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('settings.total_settings', 'Total Settings')}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSettings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('settings.public_settings', 'Public Settings')}</p>
              <p className="text-2xl font-semibold text-green-600">{publicSettings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('settings.private_settings', 'Private Settings')}</p>
              <p className="text-2xl font-semibold text-red-600">{privateSettings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('settings.groups_count', 'Groups')}</p>
              <p className="text-2xl font-semibold text-purple-600">{allGroups.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder={t('settings.search_settings', 'Search settings...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('settings.all_groups', 'All Groups')}</option>
              {allGroups.map(group => (
                <option key={group} value={group}>
                  {t(`settings.groups.${group}`, group)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('settings.settings_list', 'Settings List')} ({displaySettings.length})
          </h3>
          <div className="text-sm text-gray-500">
            {t('settings.showing_page', 'Showing page')} {currentPage} {t('settings.of', 'of')} {totalPages}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {displaySettings.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('settings.no_settings_found', 'No settings found')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('settings.no_settings_found_desc', 'Try adjusting your search or filter criteria.')}
              </p>
            </div>
          ) : (
            <>
              {displaySettings.map((setting) => (
                <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(setting.type)}
                          <span className="text-sm font-medium text-gray-600">{setting.type}</span>
                        </div>
                        {setting.group && (
                          <Badge className={getGroupColor(setting.group)}>
                            {t(`settings.groups.${setting.group}`, setting.group)}
                          </Badge>
                        )}
                        {setting.isPublic && (
                          <Badge className="bg-green-100 text-green-800">
                            {t('settings.public', 'Public')}
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-lg font-medium text-gray-900 mb-1 truncate">
                        {t(`settings.keys.${setting.key}`, setting.key)}
                      </h4>

                      {/* Description Section with Inline Editing */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {t('settings.description', 'Description')}:
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingDescription(setting)}
                            className="!p-1 !h-6 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        </div>

                        {editingId === setting.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={t('settings.enter_description', 'Enter description...')}
                            />
                            <div className="flex space-x-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => saveDescription(setting)}
                                disabled={!editingDescription.trim()}
                              >
                                {t('common.save', 'Save')}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={cancelEditingDescription}
                              >
                                {t('common.cancel', 'Cancel')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {setting.description || (
                              <span className="text-gray-400 italic">
                                {t('settings.no_description', 'No description')}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{t('settings.value', 'Value')}:</span>{' '}
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs max-w-xs inline-block truncate">
                          {setting.value || <span className="text-gray-400">{t('common.empty', 'Empty')}</span>}
                        </code>
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {setting.isPublic ? t('settings.public', 'Public') : t('settings.private', 'Private')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {setting.isPublic
                            ? t('settings.visible_to_users', 'Visible to all users')
                            : t('settings.admin_only', 'Admin only')
                          }
                        </p>
                      </div>

                      <Toggle
                        checked={setting.isPublic}
                        onChange={() => handleTogglePublic(setting)}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {t('settings.showing_items', 'Showing')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination?.total || displaySettings.length)} {t('settings.of', 'of')} {pagination?.total || displaySettings.length} {t('settings.items', 'items')}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        {t('common.previous', 'Previous')}
                      </Button>

                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "primary" : "ghost"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="!px-3 !py-1"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {t('common.next', 'Next')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </BaseLayout>
  );
};

export default withSeo(SettingsVisibilityPage, {
  title: 'Settings Visibility | Quasar Admin',
  description: 'Manage visibility of system settings',
  path: '/settings/visibility',
});