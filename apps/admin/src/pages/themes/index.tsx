import React, { useMemo, useState } from 'react';
import { FiEdit2, FiFeather, FiHome, FiMoon, FiPlus, FiRefreshCw, FiSearch, FiStar, FiSun, FiTrash2 } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { withAdminSeo } from '../../components/SEO/withAdminSeo';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Toggle } from '../../components/common/Toggle';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ThemeRecord, ThemeColorConfig, ThemeColorModes } from '../../types/theme';
import { defaultThemeConfig } from '../../config/theme.config';
import { trpc } from '../../utils/trpc';
import clsx from 'clsx';

interface ThemeFiltersState {
  page: number;
  limit: number;
  search: string;
}

type ColorMode = keyof ThemeColorModes;

interface ThemeFormState {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  setAsDefault: boolean;
  colors: ThemeColorModes;
}

const defaultLightColors: ThemeColorConfig = {
  bodyBackgroundColor: defaultThemeConfig.modes.light.background,
  surfaceBackgroundColor: defaultThemeConfig.modes.light.surface,
  textColor: defaultThemeConfig.modes.light.text.primary,
  mutedTextColor: defaultThemeConfig.modes.light.text.muted,
  primaryColor: defaultThemeConfig.colors.primary,
  primaryTextColor: '#ffffff',
  secondaryColor: defaultThemeConfig.colors.secondary,
  secondaryTextColor: '#ffffff',
  accentColor: defaultThemeConfig.colors.accent,
  borderColor: defaultThemeConfig.modes.light.border,
};

const defaultDarkColors: ThemeColorConfig = {
  bodyBackgroundColor: defaultThemeConfig.modes.dark.background,
  surfaceBackgroundColor: defaultThemeConfig.modes.dark.surface,
  textColor: defaultThemeConfig.modes.dark.text.primary,
  mutedTextColor: defaultThemeConfig.modes.dark.text.muted,
  primaryColor: defaultThemeConfig.colors.primary,
  primaryTextColor: '#ffffff',
  secondaryColor: defaultThemeConfig.colors.secondary,
  secondaryTextColor: '#ffffff',
  accentColor: defaultThemeConfig.colors.accent,
  borderColor: defaultThemeConfig.modes.dark.border,
};

const defaultColorConfig: ThemeColorModes = {
  light: { ...defaultLightColors },
  dark: { ...defaultDarkColors },
};

const cloneColorModes = (colors: ThemeColorModes): ThemeColorModes => ({
  light: { ...colors.light },
  dark: { ...colors.dark },
});

const createEmptyFormState = (): ThemeFormState => ({
  name: '',
  slug: '',
  description: '',
  isActive: true,
  setAsDefault: false,
  colors: cloneColorModes(defaultColorConfig),
});

const ThemeManagementPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const utils = trpc.useContext();

  const [filters, setFilters] = useState<ThemeFiltersState>({ page: 1, limit: 6, search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<ThemeFormState>(createEmptyFormState());
  const [editingTheme, setEditingTheme] = useState<ThemeRecord | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; theme?: ThemeRecord }>({ open: false });
  const [activeColorMode, setActiveColorMode] = useState<ColorMode>('light');

  const themesQuery = trpc.adminThemes.getThemes.useQuery(filters);
  const createThemeMutation = trpc.adminThemes.createTheme.useMutation();
  const updateThemeMutation = trpc.adminThemes.updateTheme.useMutation();
  const deleteThemeMutation = trpc.adminThemes.deleteTheme.useMutation();
  const toggleStatusMutation = trpc.adminThemes.toggleThemeStatus.useMutation();
  const setDefaultThemeMutation = trpc.adminThemes.setDefaultTheme.useMutation();

  const themes = Array.isArray((themesQuery.data as any)?.data?.items)
    ? ((themesQuery.data as any).data.items as ThemeRecord[])
    : [];
  const pagination = (themesQuery.data as any)?.data || {
    page: filters.page,
    limit: filters.limit,
    total: 0,
    totalPages: 0,
  };

  const stats = useMemo(() => {
    const activeCount = themes.filter(theme => theme.isActive).length;
    const defaultTheme = themes.find(theme => theme.isDefault);
    return {
      total: pagination.total || 0,
      active: activeCount,
      inactive: Math.max((pagination.total || 0) - activeCount, 0),
      defaultName: defaultTheme?.name,
    };
  }, [themes, pagination]);

  const openCreateModal = () => {
    setEditingTheme(null);
    setFormState(createEmptyFormState());
    setActiveColorMode('light');
    setIsModalOpen(true);
  };

  const openEditModal = (theme: ThemeRecord) => {
    setEditingTheme(theme);
    setFormState({
      name: theme.name,
      slug: theme.slug,
      description: theme.description || '',
      isActive: theme.isActive,
      setAsDefault: false,
      colors: cloneColorModes(theme.colors || defaultColorConfig),
    });
    setActiveColorMode('light');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTheme(null);
    setFormState(createEmptyFormState());
    setActiveColorMode('light');
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const invalidateThemes = () => {
    utils.adminThemes.getThemes.invalidate();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: formState.name.trim(),
      slug: formState.slug.trim() || undefined,
      description: formState.description.trim() || undefined,
      isActive: formState.isActive,
      colors: cloneColorModes(formState.colors),
      ...(formState.setAsDefault ? { isDefault: true } : {}),
    };
    // Cast until backend AppRouter types for theme mutations are regenerated
    const trpcPayload = payload as any;

    try {
      if (editingTheme) {
        await updateThemeMutation.mutateAsync({
          id: editingTheme.id,
          data: trpcPayload,
        });
        addToast({
          type: 'success',
          title: t('themes.toast.updated', 'Theme updated'),
        });
      } else {
        await createThemeMutation.mutateAsync(trpcPayload);
        addToast({
          type: 'success',
          title: t('themes.toast.created', 'Theme created'),
        });
      }
      invalidateThemes();
      closeModal();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('themes.toast.failed', 'Operation failed'),
        description: error?.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirmState.theme) return;
    try {
      await deleteThemeMutation.mutateAsync({ id: confirmState.theme.id });
      addToast({
        type: 'success',
        title: t('themes.toast.deleted', 'Theme deleted'),
      });
      invalidateThemes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('themes.toast.failed', 'Operation failed'),
        description: error?.message,
      });
    } finally {
      setConfirmState({ open: false });
    }
  };

  const handleToggleStatus = async (theme: ThemeRecord) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: theme.id });
      addToast({
        type: 'success',
        title: theme.isActive
          ? t('themes.toast.deactivated', 'Theme deactivated')
          : t('themes.toast.activated', 'Theme activated'),
      });
      invalidateThemes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('themes.toast.failed', 'Operation failed'),
        description: error?.message,
      });
    }
  };

  const handleSetDefault = async (theme: ThemeRecord) => {
    try {
      await setDefaultThemeMutation.mutateAsync({ id: theme.id });
      addToast({
        type: 'success',
        title: t('themes.toast.default_updated', 'Default theme updated'),
      });
      invalidateThemes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('themes.toast.failed', 'Operation failed'),
        description: error?.message,
      });
    }
  };

  const renderColorField = (key: keyof ThemeColorConfig, label: string) => (
    <div key={key} className="space-y-2">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="color"
          value={formState.colors[activeColorMode][key]}
          onChange={event =>
            setFormState(prev => ({
              ...prev,
              colors: {
                ...prev.colors,
                [activeColorMode]: {
                  ...prev.colors[activeColorMode],
                  [key]: event.target.value,
                },
              },
            }))
          }
          className="h-11 w-16 rounded border border-gray-300"
        />
        <Input
          value={formState.colors[activeColorMode][key]}
          onChange={event =>
            setFormState(prev => ({
              ...prev,
              colors: {
                ...prev.colors,
                [activeColorMode]: {
                  ...prev.colors[activeColorMode],
                  [key]: event.target.value,
                },
              },
            }))
          }
          inputSize="md"
        />
      </div>
    </div>
  );

  return (
    <BaseLayout
      title={t('themes.title', 'Thư viện theme')}
      description={t('themes.subtitle', 'Tạo và quản lý các bộ màu sử dụng cho giao diện storefront hoặc admin.')}
      breadcrumbs={[
        { label: t('navigation.home', 'Trang chủ'), href: '/', icon: <FiHome className="h-4 w-4" /> },
        { label: t('themes.title', 'Thư viện theme'), icon: <FiFeather className="h-4 w-4" /> },
      ]}
      actions={[
        {
          label: t('themes.actions.add', 'Thêm theme'),
          onClick: openCreateModal,
          primary: true,
          icon: <FiPlus />,
        },
        {
          label: t('common.refresh', 'Làm mới'),
          onClick: () => themesQuery.refetch(),
          primary: false,
          icon: <FiRefreshCw />,
          disabled: themesQuery.isLoading,
        },
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{t('themes.stats.total', 'Tổng số theme')}</p>
            <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{t('themes.stats.active', 'Đang hoạt động')}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{t('themes.stats.default', 'Theme mặc định')}</p>
            <p className="mt-2 text-lg font-semibold">
              {stats.defaultName || t('themes.stats.not_set', 'Chưa thiết lập')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={event => handleSearchChange(event.target.value)}
                  placeholder={t('themes.search', 'Tìm theo tên hoặc slug')}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {t('themes.pagination', {
                defaultValue: 'Trang {{current}} / {{total}}',
                current: pagination.page,
                total: Math.max(pagination.totalPages || 1, 1),
              })}
            </div>
          </div>
        </div>

        {themesQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : themes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-700">
              {t('themes.empty.title', 'Chưa có theme nào')}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {t('themes.empty.subtitle', 'Hãy tạo theme đầu tiên để chuẩn hóa màu sắc của hệ thống.')}
            </p>
            <Button className="mt-4" onClick={openCreateModal} startIcon={<FiPlus />}>
              {t('themes.actions.add', 'Thêm theme')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {themes.map(theme => {
              const colorFields: Array<{ key: keyof ThemeColorConfig; label: string }> = [
                { key: 'bodyBackgroundColor', label: t('themes.colors.body', 'Body') },
                { key: 'surfaceBackgroundColor', label: t('themes.colors.surface', 'Surface') },
                { key: 'textColor', label: t('themes.colors.text', 'Text') },
                { key: 'mutedTextColor', label: t('themes.colors.muted', 'Muted') },
                { key: 'primaryColor', label: t('themes.colors.primary', 'Primary') },
                { key: 'secondaryColor', label: t('themes.colors.secondary', 'Secondary') },
                { key: 'accentColor', label: t('themes.colors.accent', 'Accent') },
                { key: 'borderColor', label: t('themes.colors.border', 'Border') },
              ];

              return (
                <div key={theme.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
                        {theme.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            <FiStar className="h-3 w-3" />
                            {t('themes.badges.default', 'Default')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{theme.slug}</p>
                      {theme.description && <p className="mt-1 text-sm text-gray-600">{theme.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className={clsx('rounded-full px-3 py-1 font-medium', theme.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                          {theme.isActive ? t('themes.badges.active', 'Đang dùng') : t('themes.badges.inactive', 'Ngưng')}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                          <FiSun />
                          <FiMoon />
                          {t('themes.mode.dual', 'Light & Dark')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" startIcon={<FiEdit2 />} onClick={() => openEditModal(theme)}>
                        {t('common.edit', 'Sửa')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        startIcon={<FiTrash2 />}
                        disabled={theme.isDefault}
                        onClick={() => setConfirmState({ open: true, theme })}
                      >
                        {t('common.delete', 'Xóa')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        startIcon={<FiStar />}
                        disabled={theme.isDefault}
                        onClick={() => handleSetDefault(theme)}
                      >
                        {t('themes.actions.set_default', 'Đặt mặc định')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(theme)}
                      >
                        {theme.isActive ? t('themes.actions.deactivate', 'Ngưng dùng') : t('themes.actions.activate', 'Kích hoạt')}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {(['light', 'dark'] as ColorMode[]).map(mode => {
                      const palette = theme.colors?.[mode] ?? defaultColorConfig[mode];
                      return (
                        <div key={mode}>
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            {mode === 'light' ? <FiSun /> : <FiMoon />}
                            <span>
                              {mode === 'light'
                                ? t('themes.mode.light', 'Light mode')
                                : t('themes.mode.dark', 'Dark mode')}
                            </span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {colorFields.map(color => (
                              <div key={`${mode}-${color.key}`} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2">
                                <div>
                                  <p className="text-xs font-medium text-gray-600">{color.label}</p>
                                  <p className="font-mono text-sm text-gray-700">{palette[color.key]}</p>
                                </div>
                                <span
                                  className="h-8 w-8 rounded-full border border-white shadow"
                                  style={{ backgroundColor: palette[color.key] }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {themes.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              {t('common.prev', 'Trước')}
            </Button>
            <p className="text-sm text-gray-600">
              {t('themes.pagination', {
                defaultValue: 'Trang {{current}} / {{total}}',
                current: pagination.page,
                total: Math.max(pagination.totalPages || 1, 1),
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.totalPages || pagination.totalPages <= filters.page}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              {t('common.next', 'Tiếp')}
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {editingTheme ? t('themes.modal.edit_title', 'Chỉnh sửa theme') : t('themes.modal.create_title', 'Thêm theme mới')}
              </h2>
              <p className="text-sm text-gray-500">
                {editingTheme
                  ? t('themes.modal.edit_subtitle', 'Cập nhật màu sắc và thông tin hiển thị cho theme này.')
                  : t('themes.modal.create_subtitle', 'Đặt tên, chọn chế độ và thiết lập bảng màu.')}
              </p>
            </div>
            <Button variant="ghost" onClick={closeModal}>
              {t('common.close', 'Đóng')}
            </Button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {t('themes.fields.name', 'Tên theme')}
                </label>
                <Input
                  value={formState.name}
                  onChange={event => setFormState(prev => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {t('themes.fields.slug', 'Slug (tùy chọn)')}
                </label>
                <Input
                  value={formState.slug}
                  onChange={event => setFormState(prev => ({ ...prev, slug: event.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <Toggle
                  checked={formState.isActive}
                  onChange={checked => setFormState(prev => ({ ...prev, isActive: checked }))}
                  label={t('themes.fields.is_active', 'Kích hoạt theme')}
                  description={t('themes.fields.is_active_desc', 'Theme chỉ có thể áp dụng khi đang hoạt động.')}
                />
                <Toggle
                  checked={formState.setAsDefault}
                  onChange={checked => setFormState(prev => ({ ...prev, setAsDefault: checked }))}
                  label={t('themes.fields.set_default', 'Đặt làm theme mặc định sau khi lưu')}
                  description={t('themes.fields.set_default_desc', 'Chỉ một theme có thể là mặc định tại một thời điểm.')}
                />
              </div>
            </div>

            <TextareaInput
              id="theme-description"
              label={t('themes.fields.description', 'Mô tả')}
              value={formState.description}
              onChange={event => setFormState(prev => ({ ...prev, description: event.target.value }))}
              rows={3}
            />

            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                {t('themes.fields.palette', 'Bảng màu')}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(['light', 'dark'] as ColorMode[]).map(mode => {
                  const isActiveMode = activeColorMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setActiveColorMode(mode)}
                      className={clsx(
                        'flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition',
                        isActiveMode ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 bg-white text-gray-600',
                      )}
                    >
                      {mode === 'light' ? <FiSun /> : <FiMoon />}
                      {mode === 'light'
                        ? t('themes.mode.light', 'Light mode')
                        : t('themes.mode.dark', 'Dark mode')}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {renderColorField('bodyBackgroundColor', t('themes.colors.body', 'Body background'))}
                {renderColorField('surfaceBackgroundColor', t('themes.colors.surface', 'Surface background'))}
                {renderColorField('textColor', t('themes.colors.text', 'Primary text'))}
                {renderColorField('mutedTextColor', t('themes.colors.muted', 'Muted text'))}
                {renderColorField('primaryColor', t('themes.colors.primary', 'Primary color'))}
                {renderColorField('primaryTextColor', t('themes.colors.primary_text', 'Primary text color'))}
                {renderColorField('secondaryColor', t('themes.colors.secondary', 'Secondary color'))}
                {renderColorField('secondaryTextColor', t('themes.colors.secondary_text', 'Secondary text color'))}
                {renderColorField('accentColor', t('themes.colors.accent', 'Accent color'))}
                {renderColorField('borderColor', t('themes.colors.border', 'Border color'))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button type="submit" isLoading={createThemeMutation.isPending || updateThemeMutation.isPending}>
                {editingTheme ? t('common.save_changes', 'Lưu thay đổi') : t('themes.actions.create', 'Tạo theme')}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ open: false })}
        onConfirm={handleDelete}
        title={t('themes.confirm.delete_title', 'Xóa theme?')}
        message={t('themes.confirm.delete_desc', 'Theme "{{name}}" sẽ bị xóa khỏi hệ thống.', {
          name: confirmState.theme?.name ?? '',
        })}
        confirmText={t('common.delete', 'Xóa')}
        cancelText={t('common.cancel', 'Hủy')}
        confirmVariant="danger"
        isLoading={deleteThemeMutation.isPending}
      />
    </BaseLayout>
  );
};

export default withAdminSeo(ThemeManagementPage, {
  title: 'Theme Library | Quasar Admin',
  description: 'Manage body, primary and secondary colors for your storefront themes.',
  path: '/themes',
});
