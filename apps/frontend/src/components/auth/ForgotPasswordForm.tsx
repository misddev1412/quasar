import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Link } from '@heroui/react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email);
      setIsSubmitted(true);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Check your email</h3>
          <p className="text-gray-600 mb-6">We've sent password reset instructions to {email}</p>
          {onBackToLogin && (
            <Button color="primary" variant="light" onPress={onBackToLogin} className="w-full">
              Back to Login
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-0 pt-6 px-6">
        <h2 className="text-2xl font-bold text-center w-full">Reset Password</h2>
        <p className="text-gray-600 text-center w-full mt-2">
          Enter your email to receive reset instructions
        </p>
      </CardHeader>
      <CardBody className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            isInvalid={!!error}
            errorMessage={error}
            variant="bordered"
          />

          <Button type="submit" color="primary" size="lg" className="w-full" isLoading={isLoading}>
            Send Reset Email
          </Button>
        </form>

        {onBackToLogin && (
          <div className="text-center mt-6">
            <Link className="cursor-pointer text-sm" onPress={onBackToLogin}>
              ← Back to Login
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ForgotPasswordForm;
