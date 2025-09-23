import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Checkbox,
  Divider,
  Image
} from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { SEO } from '../components/utility/SEO';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineHeart,
  HiOutlineGift,
  HiOutlineStar
} from 'react-icons/hi';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
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
        general: error?.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <>
      <SEO
        title="Login"
        description="Sign in to your Quasar Store account to access exclusive deals and track your orders"
      />

      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and Welcome */}
            <div className="text-center">
              <Link to="/" className="inline-flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">Quasar Store</span>
              </Link>

              <h2 className="text-3xl font-extrabold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Login Form */}
            <Card className="border-0 shadow-lg">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <Input
                      type="email"
                      label="Email address"
                      placeholder="you@example.com"
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
                        label: "text-gray-700 font-medium",
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300 hover:border-primary-400 focus:border-primary-500",
                      }}
                      startContent={
                        <HiOutlineMail className="text-gray-400 text-xl" />
                      }
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <Input
                      type={showPassword ? "text" : "password"}
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
                        label: "text-gray-700 font-medium",
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300 hover:border-primary-400 focus:border-primary-500",
                      }}
                      startContent={
                        <HiOutlineLockClosed className="text-gray-400 text-xl" />
                      }
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <HiOutlineEyeOff className="text-gray-400 text-xl" />
                          ) : (
                            <HiOutlineEye className="text-gray-400 text-xl" />
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
                        label: "text-sm text-gray-700",
                      }}
                    >
                      Remember me
                    </Checkbox>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="w-full font-semibold"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>

                  {/* Social Login Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Divider className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="bordered"
                      className="w-full"
                      onPress={() => handleSocialLogin('google')}
                    >
                      <FaGoogle className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="bordered"
                      className="w-full"
                      onPress={() => handleSocialLogin('facebook')}
                    >
                      <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                    </Button>

                    <Button
                      variant="bordered"
                      className="w-full"
                      onPress={() => handleSocialLogin('apple')}
                    >
                      <FaApple className="w-5 h-5" />
                    </Button>
                  </div>
                </form>

                {/* Terms and Privacy */}
                <p className="mt-6 text-xs text-center text-gray-500">
                  By signing in, you agree to our{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </p>
              </CardBody>
            </Card>

            {/* Guest Checkout Option */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Just browsing?{' '}
                <button
                  onClick={() => navigate('/')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Continue as guest
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Feature Image */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-white text-center max-w-md">
                <h3 className="text-4xl font-bold mb-6">
                  Shop the Latest Trends
                </h3>
                <p className="text-xl mb-8 opacity-90">
                  Discover exclusive deals, track your orders, and enjoy a personalized shopping experience.
                </p>

                {/* Features List */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <HiOutlineSparkles className="text-2xl" />
                    <span className="text-lg">Exclusive member discounts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineTruck className="text-2xl" />
                    <span className="text-lg">Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineHeart className="text-2xl" />
                    <span className="text-lg">Personalized recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineGift className="text-2xl" />
                    <span className="text-lg">Earn rewards with every purchase</span>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                  <p className="italic mb-4">
                    "Quasar Store has completely transformed my shopping experience. Fast delivery and amazing deals!"
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex space-x-1 text-yellow-300">
                      <HiOutlineStar className="fill-current" />
                      <HiOutlineStar className="fill-current" />
                      <HiOutlineStar className="fill-current" />
                      <HiOutlineStar className="fill-current" />
                      <HiOutlineStar className="fill-current" />
                    </div>
                  </div>
                  <p className="mt-2 font-semibold">- Sarah Johnson</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;