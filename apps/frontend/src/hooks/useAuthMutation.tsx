import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useAuthMutation = () => {
  const auth = useAuth();
  const { showToast } = useToast();

  const useLogin = (options?: MutationOptions<void>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await auth.login(email, password);

        if (options?.successMessage) {
          showToast({
            type: 'success',
            title: 'Success',
            description: options.successMessage,
          });
        }

        options?.onSuccess?.(undefined);
      } catch (err) {
        const error = err as Error;
        setError(error);

        if (options?.errorMessage) {
          showToast({
            type: 'error',
            title: 'Error',
            description: options.errorMessage,
          });
        }

        options?.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    return { mutate, isLoading, error };
  };

  const useRegister = (options?: MutationOptions<void>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = async (data: { name: string; email: string; password: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        await auth.register(data);

        if (options?.successMessage) {
          showToast({
            type: 'success',
            title: 'Success',
            description: options.successMessage,
          });
        }

        options?.onSuccess?.(undefined);
      } catch (err) {
        const error = err as Error;
        setError(error);

        if (options?.errorMessage) {
          showToast({
            type: 'error',
            title: 'Error',
            description: options.errorMessage,
          });
        }

        options?.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    return { mutate, isLoading, error };
  };

  const useLogout = (options?: MutationOptions<void>) => {
    const mutate = () => {
      auth.logout();

      if (options?.successMessage) {
        showToast({
          type: 'success',
          title: 'Success',
          description: options.successMessage,
        });
      }

      options?.onSuccess?.(undefined);
    };

    return { mutate };
  };

  return {
    useLogin,
    useRegister,
    useLogout,
  };
};

export default useAuthMutation;
