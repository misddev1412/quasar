'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '../../utils/apiBase';
import type { MaintenanceStatus, MaintenanceVerifyResponse } from '../../types/maintenance';

interface MaintenancePageClientProps {
  status: MaintenanceStatus;
  redirectTo: string;
}

export const MaintenancePageClient: React.FC<MaintenancePageClientProps> = ({
  status,
  redirectTo,
}) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status.passwordRequired && password.trim() === '') {
      setError('Vui lòng nhập mật khẩu bảo trì');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/maintenance/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        cache: 'no-store',
      });

      if (!response.ok) {
        setError(response.status === 401 ? 'Mật khẩu không chính xác' : 'Không thể xác thực. Vui lòng thử lại.');
        return;
      }

      const data = (await response.json()) as MaintenanceVerifyResponse;
      persistToken(data.token, data.expiresAt);
      router.push(safeRedirect || '/');
      router.refresh();
    } catch (err) {
      console.error('Failed to verify maintenance password:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const persistToken = (token: string, expiresAt: number) => {
    const expires = new Date(expiresAt).toUTCString();
    const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `maintenance_token=${token}; Path=/; Expires=${expires}; SameSite=Lax${secureFlag}`;
  };

  return (
    <div className="max-w-md w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-white/30">
      <div className="text-center space-y-3">
        <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">Quasar Storefront</p>
        <h1 className="text-3xl font-bold text-gray-900">Chúng tôi đang bảo trì</h1>
        <p className="text-gray-600">
          {status.message || 'Hệ thống đang tạm dừng để nâng cấp. Vui lòng nhập mật khẩu do quản trị viên cung cấp để tiếp tục truy cập.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu bảo trì
          </label>
          <input
            type="password"
            name="maintenance-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            disabled={isSubmitting || !status.passwordRequired}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
            {error}
          </div>
        )}

        {!status.passwordRequired && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            Chưa có mật khẩu bảo trì. Liên hệ quản trị viên để cấu hình trước khi bật chế độ bảo trì.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !status.passwordRequired}
          className="w-full inline-flex justify-center items-center rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang xác thực...' : 'Tiếp tục truy cập'}
        </button>
      </form>
    </div>
  );
};
