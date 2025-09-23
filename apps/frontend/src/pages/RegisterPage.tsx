import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Checkbox,
  Divider,
} from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { SEO } from '../components/utility/SEO';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineGift,
  HiOutlineLightningBolt,
  HiOutlineStar,
  HiOutlineDeviceMobile,
  HiOutlineBadgeCheck
} from 'react-icons/hi';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
    general?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useProtectedRoute({
    requireGuest: true,
    requireAuth: false,
  });

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
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
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // Navigation is handled in AuthContext
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({
        general: error?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    // TODO: Implement social signup
    console.log(`Sign up with ${provider}`);
  };

  return (
    <>
      <SEO
        title="Create Account"
        description="Join Quasar Store to get exclusive member benefits, track orders, and enjoy a personalized shopping experience"
      />

      <div className="min-h-screen flex">
        {/* Left Side - Feature Image */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-secondary-700">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-white text-center max-w-md">
                <h3 className="text-4xl font-bold mb-6">
                  Join Our Community
                </h3>
                <p className="text-xl mb-8 opacity-90">
                  Create your account and unlock a world of exclusive benefits.
                </p>

                {/* Benefits List */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <HiOutlineGift className="text-2xl" />
                    <span className="text-lg">Welcome bonus on first purchase</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineLightningBolt className="text-2xl" />
                    <span className="text-lg">Early access to sales and new products</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineBadgeCheck className="text-2xl" />
                    <span className="text-lg">Earn loyalty points with every order</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <HiOutlineDeviceMobile className="text-2xl" />
                    <span className="text-lg">Sync across all your devices</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold">500K+</p>
                    <p className="text-sm opacity-90">Happy Customers</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold">4.8/5</p>
                    <p className="text-sm opacity-90">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
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
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Registration Form */}
            <Card className="border-0 shadow-lg">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <Input
                      type="text"
                      label="Full Name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      isInvalid={!!errors.name}
                      errorMessage={errors.name}
                      variant="bordered"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-medium",
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300 hover:border-primary-400 focus:border-primary-500",
                      }}
                      startContent={
                        <HiOutlineUser className="text-gray-400 text-xl" />
                      }
                    />
                  </div>

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
                      placeholder="Create a strong password"
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

                  {/* Confirm Password Input */}
                  <div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      isInvalid={!!errors.confirmPassword}
                      errorMessage={errors.confirmPassword}
                      variant="bordered"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-medium",
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300 hover:border-primary-400 focus:border-primary-500",
                      }}
                      startContent={
                        <HiOutlineLockOpen className="text-gray-400 text-xl" />
                      }
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <HiOutlineEyeOff className="text-gray-400 text-xl" />
                          ) : (
                            <HiOutlineEye className="text-gray-400 text-xl" />
                          )}
                        </button>
                      }
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-2">
                    <Checkbox
                      isSelected={formData.agreeTerms}
                      onValueChange={(checked) => {
                        setFormData({ ...formData, agreeTerms: checked });
                        if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
                      }}
                      classNames={{
                        label: "text-sm text-gray-700",
                      }}
                    >
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </Link>
                    </Checkbox>
                    {errors.agreeTerms && (
                      <p className="text-danger-500 text-sm ml-6">{errors.agreeTerms}</p>
                    )}
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
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>

                  {/* Social Signup Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Divider className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  {/* Social Signup Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="bordered"
                      className="w-full"
                      onPress={() => handleSocialSignup('google')}
                    >
                      <FaGoogle className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="bordered"
                      className="w-full"
                      onPress={() => handleSocialSignup('facebook')}
                    >
                      <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                    </Button>

                    <Button
                      variant="bordered"
                      className="w-full"
                      onPress={() => handleSocialSignup('apple')}
                    >
                      <FaApple className="w-5 h-5" />
                    </Button>
                  </div>
                </form>

                {/* Marketing Consent */}
                <div className="mt-6">
                  <Checkbox
                    size="sm"
                    classNames={{
                      label: "text-xs text-gray-500",
                    }}
                  >
                    Send me exclusive offers, personalized recommendations, and shopping tips
                  </Checkbox>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;