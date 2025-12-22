'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Input, Button, Checkbox, Divider } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useProtectedRoute({
    requireGuest: true,
    requireAuth: false,
  });

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      // Navigation is handled in AuthContext
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrors({
        general: error?.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (_provider: string) => {
    // TODO: Implement social login
  };

  return (
    <>

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-500/10 dark:bg-primary-400/5"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-secondary-500/10 dark:bg-secondary-400/5"></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

            {/* Welcome Section */}
            <div className="flex-1 text-center lg:text-left lg:max-w-lg">
              {/* Welcome Message */}
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Welcome back! 👋
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  We're excited to see you again. Sign in to continue your amazing shopping experience.
                </p>
              </div>

              {/* Features */}
              <div className="hidden lg:block space-y-4">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Secure and encrypted login</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <HiOutlineSparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Access exclusive member deals</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <HiOutlineClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Track orders in real-time</span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardBody className="p-8">
                  {/* Error Message */}
                  {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 text-red-500">⚠️</div>
                        <span className="text-sm font-medium">{errors.general}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                      <Input
                        type="email"
                        label="Email address"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email}
                        variant="bordered"
                        size="lg"
                        classNames={{
                          label: 'text-gray-700 dark:text-gray-300 font-medium',
                          input: 'text-gray-900 dark:text-white',
                          inputWrapper: 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-700/50',
                        }}
                        startContent={<HiOutlineMail className="text-gray-400 dark:text-gray-500 text-xl" />}
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        isInvalid={!!errors.password}
                        errorMessage={errors.password}
                        variant="bordered"
                        size="lg"
                        classNames={{
                          label: 'text-gray-700 dark:text-gray-300 font-medium',
                          input: 'text-gray-900 dark:text-white',
                          inputWrapper: 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-700/50',
                        }}
                        startContent={<HiOutlineLockClosed className="text-gray-400 dark:text-gray-500 text-xl" />}
                        endContent={
                          <button
                            className="focus:outline-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <HiOutlineEyeOff className="text-gray-400 dark:text-gray-500 text-xl" />
                            ) : (
                              <HiOutlineEye className="text-gray-400 dark:text-gray-500 text-xl" />
                            )}
                          </button>
                        }
                      />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <Checkbox
                        isSelected={formData.remember}
                        onValueChange={(checked) => setFormData({ ...formData, remember: checked })}
                        classNames={{
                          label: 'text-sm text-gray-700 dark:text-gray-300',
                        }}
                      >
                        Remember me
                      </Checkbox>

                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      className="w-full font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl transition-shadow"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing you in...' : 'Sign In'}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="bordered"
                        className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onPress={() => handleSocialLogin('google')}
                      >
                        <FaGoogle className="w-5 h-5 text-red-500" />
                      </Button>

                      <Button
                        variant="bordered"
                        className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onPress={() => handleSocialLogin('facebook')}
                      >
                        <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                      </Button>

                      <Button
                        variant="bordered"
                        className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onPress={() => handleSocialLogin('apple')}
                      >
                        <FaApple className="w-5 h-5 text-gray-800 dark:text-white" />
                      </Button>
                    </div>
                  </form>

                  {/* Sign Up Link */}
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <Link
                        href="/register"
                        className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        Sign up for free
                      </Link>
                    </p>
                  </div>

                  {/* Terms and Privacy */}
                  <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                      Privacy Policy
                    </Link>
                  </p>
                </CardBody>
              </Card>

              {/* Guest Checkout Option */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Just browsing?{' '}
                  <button
                    onClick={() => router.push('/')}
                    className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    Continue as guest
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
