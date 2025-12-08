import { httpLink } from '@trpc/client';
import { experimental_createTRPCNextAppDirServer } from '@trpc/next/app-dir/server';
import { buildApiUrl } from './apiBase';
import type { AppRouter } from '../../../backend/src/types/app-router';

const createLinks = () => [
  httpLink({
    url: buildApiUrl('/trpc'),
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
