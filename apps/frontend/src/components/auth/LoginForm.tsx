import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Checkbox, Link } from '@heroui/react';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; remember: boolean }) => Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  showRememberMe?: boolean;
  showSocialLogin?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignUp,
  showRememberMe = true,
  showSocialLogin = true,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-0 pt-8 px-8">
        <div className="w-full text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back! 👋</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to continue your journey</p>
        </div>
      </CardHeader>
      <CardBody className="px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="email"
              label="Email address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

          <div>
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          {showRememberMe && (
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
              {onForgotPassword && (
                <Link
                  size="sm"
                  className="cursor-pointer text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
                  onPress={onForgotPassword}
                >
                  Forgot password?
                </Link>
              )}
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl transition-shadow"
            isLoading={isLoading}
          >
            {isLoading ? 'Signing you in...' : 'Sign In'}
          </Button>
        </form>

        {showSocialLogin && (
          <>
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

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="bordered"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
              </Button>
              <Button
                variant="bordered"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FaFacebook className="w-5 h-5 text-[#1877F2]" />
              </Button>
              <Button
                variant="bordered"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FaApple className="w-5 h-5 text-gray-800 dark:text-white" />
              </Button>
            </div>
          </>
        )}

        {onSignUp && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                className="cursor-pointer font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                onPress={onSignUp}
              >
                Sign up for free
              </Link>
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default LoginForm;
