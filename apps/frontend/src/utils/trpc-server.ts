import { httpLink } from '@trpc/client';
import { experimental_createTRPCNextAppDirServer } from '@trpc/next/app-dir/server';
import type { AppRouter } from '../../../backend/src/types/app-router';

const createLinks = () => [
  httpLink({
    url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc`,
    headers() {
      return {
        'X-Client-Type': 'frontend',
      };
    },
  }),
];

export const serverTrpc = experimental_createTRPCNextAppDirServer<AppRouter>({
  config() {
    return {
      links: createLinks(),
    };
  },
});
