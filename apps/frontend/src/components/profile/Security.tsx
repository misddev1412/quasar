'use client';

import React, { useState } from 'react';
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  Monitor,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/utils/trpc';
import { toast } from 'react-hot-toast';

interface Session {
  id: string;
  browser: string;
  device: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
}

interface SessionsResponse {
  sessions: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SecurityStatus {
  hasPassword: boolean;
  hasTwoFactor: boolean;
  twoFactorMethod: 'email' | 'authenticator' | 'sms' | null;
  lastPasswordChange: Date | null;
  loginProviders: Array<{
    provider: string;
    email: string;
    lastLogin: Date | null;
  }>;
}

export const Security: React.FC = () => {
  const t = useTranslations();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [selected2FAMethod, setSelected2FAMethod] = useState<'email' | 'authenticator' | 'sms'>('email');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: securityStatus, refetch: refetchSecurityStatus } = trpc.clientSecurity.getSecurityStatus.useQuery<SecurityStatus>();
  const { data: sessions, refetch: refetchSessions } = trpc.clientSecurity.getActiveSessions.useQuery<SessionsResponse>({
    page: currentPage,
    limit: pageSize
  });

  const changePassword = trpc.clientSecurity.changePassword.useMutation({
    onSuccess: () => {
      toast.success(t('pages.profile.security.password_changed'));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      refetchSecurityStatus();
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'An error occurred while changing your password';
      toast.error(errorMessage);
    }
  });

  const setup2FA = trpc.clientSecurity.setup2FA.useMutation({
    onSuccess: (data) => {
      if (data.qrCode) {
        setShowBackupCodes(true);
      } else {
        toast.success(t('pages.profile.security.2fa_setup_initiated'));
      }
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'An error occurred while setting up 2FA';
      toast.error(errorMessage);
    }
  });

  const verify2FA = trpc.clientSecurity.verify2FA.useMutation({
    onSuccess: () => {
      toast.success(t('pages.profile.security.2fa_verified'));
      setShow2FAModal(false);
      setShowBackupCodes(false);
      refetchSecurityStatus();
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'An error occurred while verifying 2FA';
      toast.error(errorMessage);
    }
  });

  const disable2FA = trpc.clientSecurity.disable2FA.useMutation({
    onSuccess: () => {
      toast.success(t('pages.profile.security.2fa_disabled'));
      refetchSecurityStatus();
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'An error occurred while disabling 2FA';
      toast.error(errorMessage);
    }
  });

  const revokeSession = trpc.clientSecurity.revokeSession.useMutation({
    onSuccess: () => {
      toast.success(t('pages.profile.security.session_revoked'));
      refetchSessions();
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'An error occurred while revoking session';
      toast.error(errorMessage);
    }
  });

  const revokeAllSessions = trpc.clientSecurity.revokeAllSessions.useMutation({
    onSuccess: () => {
      toast.success(t('pages.profile.security.all_sessions_revoked'));
      refetchSessions();
    },
    onError: (error) => {
      const errorMessage = error.data?.data?.message || error.message || 'An error occurred while revoking all sessions';
      toast.error(errorMessage);
    }
  });

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = t('pages.profile.security.current_password_required');
    }

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = t('pages.profile.security.new_password_required');
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = t('pages.profile.security.password_too_short');
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = t('pages.profile.security.confirm_password_required');
    } else if (passwordData.confirmPassword.length < 8) {
      errors.confirmPassword = t('pages.profile.security.password_too_short');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = t('pages.profile.security.passwords_do_not_match');
    }

    setPasswordErrors(errors);
    return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword;
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    changePassword.mutate(passwordData);
  };

  const handlePasswordInputChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handle2FASetup = () => {
    setup2FA.mutate({ method: selected2FAMethod });
  };

  const handle2FAVerify = (token: string) => {
    verify2FA.mutate({ method: selected2FAMethod, token });
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('pages.profile.security.copied_to_clipboard'));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('pages.profile.security.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t('pages.profile.security.description')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Password Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('pages.profile.security.password')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {securityStatus?.hasPassword
                      ? t('pages.profile.security.password_set')
                      : t('pages.profile.security.password_not_set')
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('pages.profile.security.change_password')}
              </button>
            </div>

            {securityStatus?.lastPasswordChange && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {t('pages.profile.security.last_changed')} {formatLastActive(securityStatus.lastPasswordChange)}
                </span>
              </div>
            )}
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('pages.profile.security.two_factor')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {securityStatus?.hasTwoFactor
                      ? t('pages.profile.security.two_factor_enabled', { method: securityStatus.twoFactorMethod })
                      : t('pages.profile.security.two_factor_disabled')
                    }
                  </p>
                </div>
              </div>

              {securityStatus?.hasTwoFactor ? (
                <button
                  onClick={() => {
                    const password = prompt(t('pages.profile.security.enter_password_to_disable'));
                    if (password) {
                      disable2FA.mutate({ password });
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('pages.profile.security.disable')}
                </button>
              ) : (
                <button
                  onClick={() => setShow2FAModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('pages.profile.security.enable')}
                </button>
              )}
            </div>
          </div>

          {/* Active Sessions Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('pages.profile.security.active_sessions')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('pages.profile.security.sessions_description')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => revokeAllSessions.mutate()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('pages.profile.security.revoke_all')}
              </button>
            </div>

            <div className="space-y-3">
              {sessions?.sessions?.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {session.device || session.browser}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {session.location} • {formatLastActive(session.lastActive)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.isCurrent && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {t('pages.profile.security.current_session')}
                      </span>
                    )}
                    {!session.isCurrent && (
                      <button
                        onClick={() => revokeSession.mutate({ sessionId: session.id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {sessions?.pagination && sessions.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((sessions.pagination.page - 1) * sessions.pagination.limit) + 1} to {Math.min(sessions.pagination.page * sessions.pagination.limit, sessions.pagination.total)} of {sessions.pagination.total} sessions
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={sessions.pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">
                      {sessions.pagination.page} of {sessions.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(sessions.pagination.totalPages, prev + 1))}
                      disabled={sessions.pagination.page === sessions.pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('pages.profile.security.change_password')}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('pages.profile.security.current_password')}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    passwordErrors.currentPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                  required
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('pages.profile.security.new_password')}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    passwordErrors.newPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                  required
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('pages.profile.security.password_min_length')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('pages.profile.security.confirm_password')}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    passwordErrors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                  required
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={changePassword.isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {changePassword.isLoading ? t('pages.profile.security.changing') : t('pages.profile.security.change')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('pages.profile.security.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('pages.profile.security.setup_2fa')}
              </h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pages.profile.security.select_method')}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'authenticator', icon: Smartphone, label: t('pages.profile.security.authenticator_app') },
                    { value: 'email', icon: Mail, label: t('pages.profile.security.email') },
                    { value: 'sms', icon: Smartphone, label: t('pages.profile.security.sms') }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setSelected2FAMethod(method.value as any)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        selected2FAMethod === method.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <method.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handle2FASetup}
                  disabled={setup2FA.isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {setup2FA.isLoading ? t('pages.profile.security.setting_up') : t('pages.profile.security.setup')}
                </button>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('pages.profile.security.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};