import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Link } from '@heroui/react';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff, HiOutlinePhone } from 'react-icons/hi';

interface RegisterFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<void>;
  onSignIn?: () => void;
  showSocialLogin?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSignIn,
  showSocialLogin = true,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    else if (formData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';

    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
      });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-0 pt-8 px-8">
        <div className="w-full text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account! 🚀</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Join us today and get started</p>
        </div>
      </CardHeader>
      <CardBody className="px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                label="First name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                isInvalid={!!errors.firstName}
                errorMessage={errors.firstName}
                variant="bordered"
                size="lg"
                classNames={{
                  label: 'text-gray-700 dark:text-gray-300 font-medium',
                  input: 'text-gray-900 dark:text-white',
                  inputWrapper: 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-700/50',
                }}
                startContent={<HiOutlineUser className="text-gray-400 dark:text-gray-500 text-xl" />}
              />
            </div>
            <div>
              <Input
                type="text"
                label="Last name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName}
                variant="bordered"
                size="lg"
                classNames={{
                  label: 'text-gray-700 dark:text-gray-300 font-medium',
                  input: 'text-gray-900 dark:text-white',
                  inputWrapper: 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-700/50',
                }}
              />
            </div>
          </div>

          <div>
            <Input
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
              variant="bordered"
              size="lg"
              classNames={{
                label: 'text-gray-700 dark:text-gray-300 font-medium',
                input: 'text-gray-900 dark:text-white',
                inputWrapper: 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-700/50',
              }}
              startContent={<HiOutlineUser className="text-gray-400 dark:text-gray-500 text-xl" />}
            />
          </div>

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
              type="tel"
              label="Phone number (optional)"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              isInvalid={!!errors.phoneNumber}
              errorMessage={errors.phoneNumber}
              variant="bordered"
              size="lg"
              classNames={{
                label: 'text-gray-700 dark:text-gray-300 font-medium',
                input: 'text-gray-900 dark:text-white',
                inputWrapper: 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-700/50',
              }}
              startContent={<HiOutlinePhone className="text-gray-400 dark:text-gray-500 text-xl" />}
            />
          </div>

          <div>
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Create a password"
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

          <div>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <HiOutlineEyeOff className="text-gray-400 dark:text-gray-500 text-xl" />
                  ) : (
                    <HiOutlineEye className="text-gray-400 dark:text-gray-500 text-xl" />
                  )}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl transition-shadow"
            isLoading={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
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
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="bordered"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-5 h-5 bg-red-500 rounded"></div>
              </Button>
              <Button
                variant="bordered"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-5 h-5 bg-[#1877F2] rounded"></div>
              </Button>
              <Button
                variant="bordered"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="w-5 h-5 bg-gray-800 dark:bg-white rounded"></div>
              </Button>
            </div>
          </>
        )}

        {onSignIn && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                className="cursor-pointer font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                onPress={onSignIn}
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RegisterForm;
