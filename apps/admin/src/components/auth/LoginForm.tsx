import React, { useState, FormEvent } from 'react';
import { FormInput } from '../common/FormInput';
import { Button } from '../common/Button';
import { MailIcon, LockIcon, AlertIcon } from '../common/Icons';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isSubmitting = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  const forgotPasswordLink = (
    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
      忘记密码?
    </a>
  );

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">管理员登录</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">请输入您的凭据以继续使用系统</p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <FormInput 
          id="email"
          type="email"
          label="电子邮件"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon className="h-5 w-5 text-gray-400" />}
          required
          autoComplete="email"
        />
        
        {/* Password Input */}
        <FormInput 
          id="password"
          type="password"
          label="密码"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockIcon className="h-5 w-5 text-gray-400" />}
          rightElement={forgotPasswordLink}
          required
          autoComplete="current-password"
        />
        
        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            记住我
          </label>
        </div>
        
        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          fullWidth
        >
          登录
        </Button>
      </form>
      
      {/* Support Link */}
      <div className="mt-8">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          需要帮助? <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">联系管理员</a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 