# SEO API Client - Shared Library

This documentation explains how to use the shared SEO API client and hooks that have been implemented in the shared library for use across both admin and client applications.

## Overview

The SEO API client provides a unified interface for managing SEO data across the Quasar workspace. It includes:

- **Type-safe API client interfaces** for both admin and client operations
- **Shared hooks** that work with tRPC clients
- **Automatic document head updates** for SEO metadata
- **Consistent error handling** across applications

## Architecture

```
libs/shared/src/
├── api/
│   └── seo.api.ts          # API client interfaces and types
├── hooks/
│   └── useSeo.ts           # Shared hooks for SEO operations
├── types/
│   └── seo.types.ts        # SEO type definitions
└── index.ts                # Exports all SEO functionality
```

## API Client Interfaces

### Admin API Client (Full CRUD)

```typescript
export interface SeoAdminApiClient {
  getAll: () => Promise<ISEO[]>;
  getById: (id: string) => Promise<ISEO>;
  getByPath: (params: GetSEOByPathParams) => Promise<ISEO>;
  create: (data: CreateSeoInput) => Promise<ISEO>;
  update: (id: string, data: UpdateSeoInput) => Promise<ISEO>;
  delete: (id: string) => Promise<boolean>;
}
```

### Client API Client (Read-only)

```typescript
export interface SeoClientApiClient {
  getByPath: (params: GetSEOByPathParams) => Promise<ISEOResponse>;
}
```

## Shared Hooks

### 1. `createUseSeoHook(trpcClient)`

Creates a hook for reading SEO data (client-side usage).

```typescript
import { createUseSeoHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeo = createUseSeoHook(trpc);

// Usage in component
const { seo, isLoading, error, updateDocumentHead } = useSeo({
  path: '/current-page',
  defaultTitle: 'Default Title',
  defaultDescription: 'Default Description',
  defaultKeywords: 'default, keywords'
});

// Update the document head with SEO data
useEffect(() => {
  updateDocumentHead();
}, [updateDocumentHead]);
```

### 2. `createUseSeoAdminHook(trpcClient)`

Creates a hook for managing SEO data with full CRUD operations (admin-side usage).

```typescript
import { createUseSeoAdminHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeoAdmin = createUseSeoAdminHook(trpc);

// Usage in admin component
const { 
  seos, 
  isLoading, 
  error,
  createSeo, 
  updateSeo, 
  deleteSeo 
} = useSeoAdmin();

// Create new SEO entry
const handleCreate = () => {
  createSeo.mutate({
    title: 'New Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
    path: '/new-page',
    isActive: true
  });
};

// Update existing SEO entry
const handleUpdate = (id: string) => {
  updateSeo.mutate({
    id,
    title: 'Updated Title',
    description: 'Updated description'
  });
};

// Delete SEO entry
const handleDelete = (id: string) => {
  deleteSeo.mutate({ id });
};
```

### 3. `createUseSeoByPathHook(trpcClient)`

Creates a hook for searching SEO data by path (admin context).

```typescript
import { createUseSeoByPathHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeoByPath = createUseSeoByPathHook(trpc);

// Usage
const { data, isLoading, error } = useSeoByPath('/about', {
  enabled: true
});
```

### 4. `createUseSeoByIdHook(trpcClient)`

Creates a hook for getting SEO data by ID (admin context).

```typescript
import { createUseSeoByIdHook } from '@shared';
import { trpc } from '../utils/trpc';

const useSeoById = createUseSeoByIdHook(trpc);

// Usage
const { data, isLoading, error } = useSeoById(seoId, {
  enabled: Boolean(seoId)
});
```

## Implementation Examples

### Admin App Implementation

```typescript
// apps/admin/src/hooks/useSeo.ts
import { trpc } from '../utils/trpc';
import { 
  createUseSeoHook, 
  createUseSeoAdminHook, 
  createUseSeoByPathHook, 
  createUseSeoByIdHook,
  UseSeoOptions
} from '@shared';

export const useSeo = createUseSeoHook(trpc);
export const useSeoAdmin = createUseSeoAdminHook(trpc);
export const useSeoByPath = createUseSeoByPathHook(trpc);
export const useSeoById = createUseSeoByIdHook(trpc);
```

### Client App Implementation (Next.js)

```typescript
// apps/client/src/hooks/useSeo.ts
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { createUseSeoHook } from '@shared';

const useSharedSeo = createUseSeoHook(trpc);

export function useSeo(options = {}) {
  const router = useRouter();
  
  // Use the shared hook with Next.js router path
  const { seo, isLoading, error } = useSharedSeo({
    path: router.asPath,
    defaultTitle: options.defaultTitle || 'App Title',
    defaultDescription: options.defaultDescription || '',
    defaultKeywords: options.defaultKeywords || '',
    enabled: router.isReady
  });

  // Convert to Next.js SEO format
  const nextSeo = {
    title: seo.title,
    description: seo.description,
    additionalMetaTags: [
      ...(seo.keywords ? [{ name: 'keywords', content: seo.keywords }] : []),
      ...Object.entries(seo.additionalMetaTags).map(([name, content]) => ({
        name,
        content
      }))
    ]
  };

  return { seo: nextSeo, isLoading, error };
}
```

## Types

### Core SEO Types

```typescript
interface ISEO extends BaseEntity {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  isActive: boolean;
  additionalMetaTags?: Record<string, string>;
}

interface ISEOResponse {
  title: string;
  description?: string;
  keywords?: string;
  additionalMetaTags?: Record<string, string>;
}

interface CreateSeoInput {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  isActive?: boolean;
  additionalMetaTags?: Record<string, string>;
}

interface UpdateSeoInput {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
  isActive?: boolean;
  additionalMetaTags?: Record<string, string>;
}
```

## Features

### ✅ Automatic Document Head Updates

The `useSeo` hook provides an `updateDocumentHead()` function that automatically updates:
- Document title
- Meta description
- Meta keywords
- Additional meta tags

### ✅ Type Safety

All hooks and API clients are fully typed with TypeScript for better developer experience and compile-time error checking.

### ✅ Error Handling

Consistent error handling across all operations with proper error types and messages.

### ✅ Loading States

All hooks provide loading states for better UX during API calls.

### ✅ Caching & Refetching

Built-in caching and refetching strategies optimized for SEO data patterns.

## Usage Best Practices

1. **Use appropriate hooks for your context**:
   - `useSeo` for reading SEO data (client-side)
   - `useSeoAdmin` for managing SEO data (admin-side)

2. **Handle loading states**:
   ```typescript
   if (isLoading) return <div>Loading SEO data...</div>;
   ```

3. **Update document head for SEO**:
   ```typescript
   useEffect(() => {
     updateDocumentHead();
   }, [updateDocumentHead]);
   ```

4. **Handle errors gracefully**:
   ```typescript
   if (error) {
     console.error('SEO error:', error);
     return <div>Error loading SEO data</div>;
   }
   ```

5. **Use path-based SEO loading**:
   ```typescript
   const { seo } = useSeo({
     path: router.asPath, // Next.js
     // or
     path: location.pathname, // React Router
     defaultTitle: 'Fallback Title'
   });
   ```

## Migration Guide

If you're migrating from existing SEO implementations:

1. **Update imports**:
   ```typescript
   // Before
   import { useSeo } from '../hooks/useSeo';
   
   // After
   import { useSeo } from '@shared';
   ```

2. **Update hook creation**:
   ```typescript
   // Before
   export function useSeo(options) { ... }
   
   // After
   export const useSeo = createUseSeoHook(trpc);
   ```

3. **Update component usage**:
   ```typescript
   // The hook API remains the same
   const { seo, isLoading, error, updateDocumentHead } = useSeo({
     path: '/current-page',
     defaultTitle: 'Default Title'
   });
   ```

This shared SEO implementation provides a consistent, type-safe, and maintainable way to manage SEO across all applications in the Quasar workspace. 