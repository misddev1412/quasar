'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { HiOutlineHome, HiOutlineRefresh } from 'react-icons/hi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">
            500
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We apologize for the inconvenience. Please try again or contact support if the problem persists.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            color="primary"
            size="lg"
            onPress={() => router.push('/')}
            startContent={<HiOutlineHome className="text-xl" />}
          >
            Go Home
          </Button>

          <Button
            variant="bordered"
            size="lg"
            onPress={reset}
            startContent={<HiOutlineRefresh className="text-xl" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}