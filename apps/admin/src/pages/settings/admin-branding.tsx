import React, { useEffect, useMemo, useState } from 'react';
import BaseLayout from '../../components/layout/BaseLayout';
import { withSeo } from '../../components/SEO/withSeo';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Toggle } from '../../components/common/Toggle';
import { MediaManager } from '../../components/common/MediaManager';
import { useBrandingSetting } from '../../hooks/useBrandingSetting';
import {
  ADMIN_LOGIN_BRANDING_KEY,
  ADMIN_SIDEBAR_BRANDING_KEY,
  DEFAULT_ADMIN_LOGIN_BRANDING,
  DEFAULT_ADMIN_SIDEBAR_BRANDING,
  AdminLoginBrandingConfig,
  AdminSidebarBrandingConfig,
} from '../../constants/adminBranding';
import { trpc } from '../../utils/trpc';
import { FiHome, FiSettings, FiImage, FiBookOpen, FiLayout } from 'react-icons/fi';

const numberOrUndefined = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const AdminBrandingPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const loginBrandingQuery = useBrandingSetting(ADMIN_LOGIN_BRANDING_KEY, DEFAULT_ADMIN_LOGIN_BRANDING);
  const sidebarBrandingQuery = useBrandingSetting(ADMIN_SIDEBAR_BRANDING_KEY, DEFAULT_ADMIN_SIDEBAR_BRANDING);
  const updateMutation = trpc.adminSettings.update.useMutation();

  const [loginForm, setLoginForm] = useState<AdminLoginBrandingConfig>(loginBrandingQuery.config);
  const [sidebarForm, setSidebarForm] = useState<AdminSidebarBrandingConfig>(sidebarBrandingQuery.config);
  const [isLoginMediaManagerOpen, setIsLoginMediaManagerOpen] = useState(false);
  const [isLoginBackgroundMediaManagerOpen, setIsLoginBackgroundMediaManagerOpen] = useState(false);
  const [isSidebarMediaManagerOpen, setIsSidebarMediaManagerOpen] = useState(false);

  useEffect(() => {
    setLoginForm(loginBrandingQuery.config);
  }, [loginBrandingQuery.config]);

  useEffect(() => {
    setSidebarForm(sidebarBrandingQuery.config);
  }, [sidebarBrandingQuery.config]);

  const isLoading = loginBrandingQuery.isLoading || sidebarBrandingQuery.isLoading;
  const isSaving = updateMutation.isPending;

  const handleSave = async (
    scope: 'login' | 'sidebar',
    payload: AdminLoginBrandingConfig | AdminSidebarBrandingConfig,
  ) => {
    const target = scope === 'login' ? loginBrandingQuery : sidebarBrandingQuery;
    const settingId = target.setting?.id;
    if (!settingId) {
      addToast({
        type: 'error',
        title: t('settings.save_failed'),
        description: t('settings.branding.save_missing_setting'),
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: settingId,
        value: JSON.stringify(payload),
      });
      addToast({
        type: 'success',
        title: t('settings.update_success_title'),
        description:
          scope === 'login'
            ? t('settings.branding.login_saved')
            : t('settings.branding.sidebar_saved'),
      });
      target.refetch();
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: t('settings.update_failed_title'),
        description: t('settings.branding.save_failed'),
      });
    }
  };

  const loginPreviewText = useMemo(() => loginForm.logoText || 'Q', [loginForm.logoText]);
  const sidebarPreviewText = useMemo(() => sidebarForm.logoText || 'Q', [sidebarForm.logoText]);
  const loginHasChanges = useMemo(
    () => JSON.stringify(loginForm) !== JSON.stringify(loginBrandingQuery.config),
    [loginForm, loginBrandingQuery.config],
  );
  const sidebarHasChanges = useMemo(
    () => JSON.stringify(sidebarForm) !== JSON.stringify(sidebarBrandingQuery.config),
    [sidebarForm, sidebarBrandingQuery.config],
  );

  const handleLogoFromMedia = (scope: 'login' | 'sidebar') => (selected: any) => {
    const file = Array.isArray(selected) ? selected[0] : selected;
    if (!file?.url) return;
    if (scope === 'login') {
      setLoginForm((prev) => ({ ...prev, logoUrl: file.url }));
      setIsLoginMediaManagerOpen(false);
    } else {
      setSidebarForm((prev) => ({ ...prev, logoUrl: file.url }));
      setIsSidebarMediaManagerOpen(false);
    }
  };

  const handleBackgroundFromMedia = (selected: any) => {
    const file = Array.isArray(selected) ? selected[0] : selected;
    if (!file?.url) return;
    setLoginForm((prev) => ({ ...prev, backgroundImageUrl: file.url }));
    setIsLoginBackgroundMediaManagerOpen(false);
  };

  if (isLoading) {
    return (
      <BaseLayout
        title={t('settings.branding.title', 'Giao diện Admin')}
        description={t('settings.branding.subtitle', 'Tuỳ chỉnh logo và nội dung thương hiệu cho khu vực admin.')}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('settings.branding.title', 'Giao diện Admin')}
      description={t('settings.branding.subtitle', 'Tuỳ chỉnh logo và nội dung thương hiệu cho khu vực admin.')}
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/', icon: <FiHome className="h-4 w-4" /> },
        { label: t('navigation.settings', 'Cài đặt'), href: '/settings', icon: <FiSettings className="h-4 w-4" /> },
        { label: t('settings.branding.title', 'Giao diện Admin') },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white p-6 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff_0,_transparent_55%)] pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">{t('settings.branding.hero_label', 'Trải nghiệm thương hiệu')}</p>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-white">
                {t('settings.branding.hero_title', 'Đồng bộ hoá logo và thông điệp trên toàn bộ admin portal')}
              </h1>
              <p className="text-white/80 text-base max-w-2xl">
                {t(
                  'settings.branding.hero_desc',
                  'Cập nhật logo ở một nơi, áp dụng ngay cho trang đăng nhập và toàn bộ giao diện điều hướng. Người dùng sẽ cảm nhận thương hiệu nhất quán ngay từ phút đầu.',
                )}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  t('settings.branding.hero_highlight_login', 'Trải nghiệm đăng nhập mang dấu ấn riêng.'),
                  t('settings.branding.hero_highlight_sidebar', 'Sidebar hiển thị thông tin thương hiệu rõ ràng.'),
                ].map((item) => (
                  <li key={item} className="flex items-start text-sm text-white/80 gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t('settings.branding.status_label', 'Trạng thái')}</p>
              <div className="space-y-3">
                {[
                  { label: t('settings.branding.login_title', 'Trang đăng nhập'), dirty: loginHasChanges },
                  { label: t('settings.branding.sidebar_title', 'Thanh điều hướng'), dirty: sidebarHasChanges },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm">
                    <span>{stat.label}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        stat.dirty ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {stat.dirty
                        ? t('settings.branding.status_dirty', 'Chờ lưu')
                        : t('settings.branding.status_synced', 'Đã đồng bộ')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                <Button variant="primary" onClick={() => setIsLoginMediaManagerOpen(true)}>
                  {t('settings.branding.quick_pick_login', 'Chọn logo trang đăng nhập')}
                </Button>
                <Button
                  variant="ghost"
                  className="bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setIsSidebarMediaManagerOpen(true)}
                >
                  {t('settings.branding.quick_pick_sidebar', 'Chọn logo sidebar')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <FiImage className="h-5 w-5 text-indigo-600" />,
              title: t('settings.branding.asset_library', 'Thư viện Brand Assets'),
              desc: t('settings.branding.asset_library_desc', 'Quản lý logo gốc và bộ nhận diện ở một nơi.'),
              action: () => window.open('/brand-assets', '_blank'),
              actionLabel: t('settings.branding.open_assets', 'Mở Brand Assets'),
            },
            {
              icon: <FiLayout className="h-5 w-5 text-violet-600" />,
              title: t('settings.branding.layout_preview', 'Xem thử giao diện'),
              desc: t('settings.branding.layout_preview_desc', 'Xem các trang admin áp dụng logo mới của bạn.'),
              action: () => window.open('/settings/visibility', '_blank'),
              actionLabel: t('settings.branding.open_preview', 'Mở trang hiển thị'),
            },
            {
              icon: <FiBookOpen className="h-5 w-5 text-blue-600" />,
              title: t('settings.branding.guideline', 'Hướng dẫn nhận diện'),
              desc: t('settings.branding.guideline_desc', 'Tạo hướng dẫn nhanh cho đội ngũ nội bộ.'),
              action: () => window.open('/site-content', '_blank'),
              actionLabel: t('settings.branding.create_guideline', 'Soạn hướng dẫn'),
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">{card.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{card.title}</p>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={card.action} className="w-fit text-sm">
                {card.actionLabel}
              </Button>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-gray-50">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{t('settings.branding.login_label', 'Login Experience')}</p>
                  <h2 className="text-xl font-semibold text-gray-900">{t('settings.branding.login_title', 'Trang đăng nhập')}</h2>
                  <p className="text-sm text-gray-500">
                    {t('settings.branding.login_desc', 'Logo hiển thị trên thẻ đăng nhập và màn hình giới thiệu.')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                    loginHasChanges ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {loginHasChanges
                    ? t('settings.branding.pending_changes', 'Có thay đổi chưa lưu')
                    : t('settings.branding.saved', 'Đang sử dụng')}
                </span>
              </div>
              <div className="p-6 flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700">{t('settings.branding.logo_url', 'Đường dẫn logo')}</span>
                    <div className="flex gap-3 flex-col sm:flex-row">
                      <Input
                        value={loginForm.logoUrl ?? ''}
                        placeholder="/assets/images/logo.png"
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                      />
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setIsLoginMediaManagerOpen(true)}
                        className="shrink-0"
                      >
                        {t('media.select', 'Chọn ảnh')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('settings.branding.media_hint', 'Hỗ trợ PNG, JPG, SVG. Gợi ý kích thước vuông 1:1.')}
                    </p>
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.logo_text', 'Chữ hiển thị khi thiếu logo')}</span>
                      <Input
                        value={loginForm.logoText ?? ''}
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, logoText: event.target.value }))}
                      />
                    </label>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{t('settings.branding.toggle_label', 'Tự hiển thị chữ')}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {t('settings.branding.show_logo_text_help', 'Logo hỏng hoặc đang tải sẽ hiển thị chữ viết tắt.')}
                      </p>
                      <div className="flex items-center justify-between">
                        <Toggle
                          checked={Boolean(loginForm.showLogoText)}
                          onChange={() => setLoginForm((prev) => ({ ...prev, showLogoText: !prev.showLogoText }))}
                        />
                        <span className="text-xs text-gray-500">
                          {loginForm.showLogoText ? t('common.enabled') : t('common.disabled')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t('settings.branding.platform_title', 'Tiêu đề hiển thị')}
                    </span>
                    <Input
                      value={loginForm.platformTitle ?? ''}
                      placeholder={t('settings.branding.platform_title_placeholder', 'Quasar Admin Platform')}
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, platformTitle: event.target.value }))}
                    />
                    <p className="text-xs text-gray-500">
                      {t(
                        'settings.branding.platform_title_hint',
                        'Dòng chữ nổi bật xuất hiện trong hero của trang đăng nhập.',
                      )}
                    </p>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t('settings.branding.login_background_label', 'Hình nền trang đăng nhập')}
                    </span>
                    <div className="flex gap-3 flex-col sm:flex-row">
                      <Input
                        value={loginForm.backgroundImageUrl ?? ''}
                        placeholder="https://cdn.example.com/backgrounds/login.jpg"
                        onChange={(event) =>
                          setLoginForm((prev) => ({ ...prev, backgroundImageUrl: event.target.value || undefined }))
                        }
                      />
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setIsLoginBackgroundMediaManagerOpen(true)}
                        className="shrink-0"
                      >
                        {t('settings.branding.choose_background', 'Chọn hình')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t(
                        'settings.branding.login_background_hint',
                        'Khuyến nghị ảnh 1600x900px, định dạng JPG/PNG nhẹ để tối ưu tốc độ.',
                      )}
                    </p>
                    {loginForm.backgroundImageUrl && (
                      <div className="rounded-2xl border border-dashed border-gray-200 overflow-hidden mt-2">
                        <div
                          className="h-32 w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${loginForm.backgroundImageUrl})` }}
                        />
                        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
                          {t(
                            'settings.branding.login_background_preview_hint',
                            'Áp dụng cho toàn bộ hình nền của trang đăng nhập.',
                          )}
                        </div>
                      </div>
                    )}
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.width', 'Chiều rộng (px)')}</span>
                      <Input
                        type="number"
                        min={24}
                        value={loginForm.width ?? ''}
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, width: numberOrUndefined(event.target.value) }))}
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.height', 'Chiều cao (px)')}</span>
                      <Input
                        type="number"
                        min={24}
                        value={loginForm.height ?? ''}
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, height: numberOrUndefined(event.target.value) }))}
                      />
                    </label>
                  </div>
                </div>
                <div className="lg:w-72">
                  <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg p-5 space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">{t('settings.branding.preview_label', 'Preview')}</p>
                    <div className="flex items-center gap-4">
                      {loginForm.logoUrl ? (
                        <div className="bg-white/15 rounded-2xl p-3 border border-white/10">
                          <img
                            src={loginForm.logoUrl}
                            alt="Admin login logo preview"
                            className="object-contain"
                            style={{
                              width: `${loginForm.width || 48}px`,
                              height: `${loginForm.height || 48}px`,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                          {loginPreviewText}
                        </div>
                      )}
                      <p className="text-sm text-white/80">
                        {t('settings.branding.login_preview_desc', 'Hiển thị ở phần hero của trang đăng nhập.')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-3">
                      <p className="text-base font-semibold text-white">
                        {loginForm.platformTitle?.trim() || t('auth.admin_platform', 'Quasar Admin Platform')}
                      </p>
                      <p className="text-xs text-white/70">
                        {t('settings.branding.platform_title_preview_hint', 'Người dùng thấy nội dung này ngay khi mở trang.')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-3 text-xs text-white/80">
                      {t('settings.branding.tip_brand_story', 'Tip: Sử dụng logo nền trong suốt để nổi bật hơn.')}
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      {loginForm.backgroundImageUrl ? (
                        <>
                          <div
                            className="h-24 w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${loginForm.backgroundImageUrl})` }}
                          />
                          <p className="px-4 py-2 text-xs text-white/70">
                            {t(
                              'settings.branding.login_background_preview_card',
                              'Ảnh nền này phủ toàn bộ trang đăng nhập phía sau khối nội dung.',
                            )}
                          </p>
                        </>
                      ) : (
                        <div className="px-4 py-3 text-xs text-white/70">
                          {t(
                            'settings.branding.login_background_empty',
                            'Chưa thiết lập hình nền, hệ thống sẽ dùng hiệu ứng gradient mặc định.',
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 px-6 py-4 bg-gray-50">
                <p className="text-xs text-gray-500">{t('settings.branding.auto_apply', 'Thay đổi được áp dụng ngay sau khi lưu.')}</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setLoginForm({ ...DEFAULT_ADMIN_LOGIN_BRANDING })}
                    disabled={isSaving}
                  >
                    {t('settings.branding.reset_default', 'Khôi phục mặc định')}
                  </Button>
                  <Button
                    variant="primary"
                    isLoading={isSaving}
                    disabled={!loginHasChanges && !isSaving}
                    onClick={() => handleSave('login', loginForm)}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-gray-50">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{t('settings.branding.sidebar_label', 'Navigation Shell')}</p>
                  <h2 className="text-xl font-semibold text-gray-900">{t('settings.branding.sidebar_title', 'Thanh điều hướng')}</h2>
                  <p className="text-sm text-gray-500">{t('settings.branding.sidebar_desc', 'Logo sidebar, tên thương hiệu và mô tả ngắn gọn.')}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                    sidebarHasChanges ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {sidebarHasChanges
                    ? t('settings.branding.pending_changes', 'Có thay đổi chưa lưu')
                    : t('settings.branding.saved', 'Đang sử dụng')}
                </span>
              </div>
              <div className="p-6 flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-gray-700">{t('settings.branding.logo_url', 'Đường dẫn logo')}</span>
                    <div className="flex gap-3 flex-col sm:flex-row">
                      <Input
                        value={sidebarForm.logoUrl ?? ''}
                        placeholder="/assets/images/logo.png"
                        onChange={(event) => setSidebarForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                      />
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setIsSidebarMediaManagerOpen(true)}
                        className="shrink-0"
                      >
                        {t('media.select', 'Chọn ảnh')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('settings.branding.media_hint_sidebar', 'Nên sử dụng logo nằm ngang để hiển thị rõ khi thu gọn.')}
                    </p>
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.brand_name', 'Tên thương hiệu')}</span>
                      <Input
                        value={sidebarForm.brandName ?? ''}
                        onChange={(event) => setSidebarForm((prev) => ({ ...prev, brandName: event.target.value }))}
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.subtitle', 'Phụ đề')}</span>
                      <Input
                        value={sidebarForm.subtitle ?? ''}
                        onChange={(event) => setSidebarForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.width', 'Chiều rộng (px)')}</span>
                      <Input
                        type="number"
                        min={24}
                        value={sidebarForm.width ?? ''}
                        onChange={(event) => setSidebarForm((prev) => ({ ...prev, width: numberOrUndefined(event.target.value) }))}
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-gray-700">{t('settings.branding.height', 'Chiều cao (px)')}</span>
                      <Input
                        type="number"
                        min={24}
                        value={sidebarForm.height ?? ''}
                        onChange={(event) => setSidebarForm((prev) => ({ ...prev, height: numberOrUndefined(event.target.value) }))}
                      />
                    </label>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{t('settings.branding.show_logo_text', 'Hiển thị chữ khi có logo')}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {t('settings.branding.sidebar_toggle_help', 'Giúp giữ thương hiệu khi sidebar thu gọn hoặc lỗi ảnh.')}
                    </p>
                    <div className="flex items-center justify-between">
                      <Toggle
                        checked={Boolean(sidebarForm.showLogoText)}
                        onChange={() => setSidebarForm((prev) => ({ ...prev, showLogoText: !prev.showLogoText }))}
                      />
                      <span className="text-xs text-gray-500">
                        {sidebarForm.showLogoText ? t('common.enabled') : t('common.disabled')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="lg:w-72">
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-inner p-5 space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{t('settings.branding.preview_label', 'Preview')}</p>
                    <div className="flex items-center gap-4">
                      {sidebarForm.logoUrl ? (
                        <div className="rounded-2xl border border-gray-100 p-3">
                          <img
                            src={sidebarForm.logoUrl}
                            alt="Admin sidebar logo preview"
                            className="object-contain"
                            style={{
                              width: `${sidebarForm.width || 36}px`,
                              height: `${sidebarForm.height || 36}px`,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-lg font-semibold text-primary-700">
                          {sidebarPreviewText}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {sidebarForm.brandName || t('common.brand_name', 'Quasar')}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {sidebarForm.subtitle || t('common.admin_dashboard', 'Admin Dashboard')}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
                      {t('settings.branding.tip_sidebar', 'Gợi ý: Logo ngang với chiều rộng ~36px phù hợp cả chế độ thu gọn.')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 px-6 py-4 bg-gray-50">
                <p className="text-xs text-gray-500">
                  {t('settings.branding.auto_apply_sidebar', 'Thay đổi áp dụng cho sidebar, mini sidebar và trang profile.')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSidebarForm({ ...DEFAULT_ADMIN_SIDEBAR_BRANDING })}
                    disabled={isSaving}
                  >
                    {t('settings.branding.reset_default', 'Khôi phục mặc định')}
                  </Button>
                  <Button
                    variant="primary"
                    isLoading={isSaving}
                    disabled={!sidebarHasChanges && !isSaving}
                    onClick={() => handleSave('sidebar', sidebarForm)}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-6 h-fit">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{t('settings.branding.tips_label', 'Gợi ý nhanh')}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {t('settings.branding.tips_title', 'Giữ hình ảnh rõ nét và đồng bộ')}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-800">{t('settings.branding.tip_size', 'Kích thước khuyến nghị')}</p>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t('settings.branding.tip_login_size', 'Trang đăng nhập: 48px x 48px hoặc 64px x 64px')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t('settings.branding.tip_sidebar_size', 'Sidebar: chiều cao ~36px để tương thích mini sidebar')}</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-800">{t('settings.branding.tip_formats', 'Định dạng gợi ý')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.branding.tip_formats_desc', 'PNG/SVG nền trong suốt hoặc JPEG chất lượng cao (>500px).')}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-800">{t('settings.branding.tip_access', 'Truy cập nhanh Media Manager')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.branding.tip_access_desc', 'Chọn lại logo đã dùng hoặc tải mới ngay trong trang này.')}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-900">{t('settings.branding.help_needed', 'Cần hỗ trợ?')}</p>
              <p className="text-sm text-blue-700">
                {t('settings.branding.help_text', 'Đội ngũ hỗ trợ có thể giúp chuẩn hoá kích thước và tối ưu logo.')}
              </p>
              <Button variant="secondary" onClick={() => window.open('/support-clients', '_blank')}>
                {t('settings.branding.contact_support', 'Liên hệ hỗ trợ')}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <MediaManager
        isOpen={isLoginMediaManagerOpen}
        onClose={() => setIsLoginMediaManagerOpen(false)}
        onSelect={handleLogoFromMedia('login')}
        accept="image/*"
        multiple={false}
        title={t('settings.branding.login_media_title', 'Chọn logo cho trang đăng nhập')}
      />
      <MediaManager
        isOpen={isLoginBackgroundMediaManagerOpen}
        onClose={() => setIsLoginBackgroundMediaManagerOpen(false)}
        onSelect={handleBackgroundFromMedia}
        accept="image/*"
        multiple={false}
        title={t('settings.branding.login_background_media_title', 'Chọn hình nền cho trang đăng nhập')}
      />
      <MediaManager
        isOpen={isSidebarMediaManagerOpen}
        onClose={() => setIsSidebarMediaManagerOpen(false)}
        onSelect={handleLogoFromMedia('sidebar')}
        accept="image/*"
        multiple={false}
        title={t('settings.branding.sidebar_media_title', 'Chọn logo cho sidebar')}
      />
    </BaseLayout>
  );
};

export default withSeo(AdminBrandingPage, {
  title: 'Admin Branding | Quasar',
  description: 'Customize the admin shell and login branding.',
  path: '/settings/admin-branding',
});
