---
name: Create Component
description: Create a new React component following the project's strict architecture of separating UI, Logic, and Types.
---

# Create Component Skill

This skill automates the creation of a new React component that adheres to the *Quasar* project's architectural standards.

## Standards
1.  **Separation of Concerns**: Every component must be split into 3 files:
    *   `ComponentName.tsx`: Pure UI rendering (in `components/...`).
    *   `useComponentName.ts`: Business logic, state, and API calls (in `apps/frontend/src/hooks`).
    *   `ComponentName.types.ts`: TypeScript interfaces and types. **Do NOT use `any`**.
2.  **Common Components**: Prefer using components from `@heroui/react` or `apps/frontend/src/components/common` over HTML tags.
3.  **Internationalization**: Always use `useTranslations` from `next-intl`. Do not hardcode strings.
4.  **Imports**: Always use import aliases (e.g., `@/components/...`, `@/hooks/...`) instead of relative paths (`../../`).

## Instructions

When the user asks to create a component (e.g., "Create a ProductReview component"):

1.  **Determine Location**:
    *   Ask the user where to place the component if not specified (e.g., `apps/frontend/src/components/ecommerce`).
    *   Create a directory with the component's name if it doesn't represent a simple leaf node (optional, but good for grouping). *For this skill, we will assume the files sit directly in the target directory.*

2.  **Generate Files**:
    You must create 3 files. Use the templates below.

    *   **Target Directory**: `[TargetDirectory]`
    *   **Component Name**: `[ComponentName]` (PascalCase)

3.  **Review**:
    *   Ensure all imports are absolute or properly relative.
    *   Ensure the exported component name matches the filename.

## Templates

### 1. `[ComponentName].types.ts`
```typescript
export interface [ComponentName]Props {
  // Define props here
  className?: string;
  // exampleProp?: string;
}

export interface [ComponentName]Data {
  // Define data interfaces here
}
```

### 2. `use[ComponentName].ts`
```typescript
import { useState, useCallback } from 'react';
import type { [ComponentName]Props } from './[ComponentName].types';

interface Use[ComponentName]Params extends [ComponentName]Props {
  // Additional params if needed
}

interface Use[ComponentName]Result {
  // State
  isLoading: boolean;
  
  // Handlers
  handleAction: () => void;
  
  // Computed
  formattedData: string;
}

export const use[ComponentName] = (params: Use[ComponentName]Params): Use[ComponentName]Result => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(() => {
    setIsLoading(true);
    // Logic here
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const formattedData = 'Example Data';

  return {
    isLoading,
    handleAction,
    formattedData,
  };
};
```

### 3. `[ComponentName].tsx`
```typescript
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, Spinner, Button } from '@heroui/react'; // Adjust based on needs
// import { Input } from '../common/Input'; // Example of common component import

import { use[ComponentName] } from './use[ComponentName]';
import type { [ComponentName]Props } from './[ComponentName].types';

export const [ComponentName]: React.FC<[ComponentName]Props> = (props) => {
  const t = useTranslations('domains.[domainName].[componentName]'); // Adjust translation namespace
  
  const {
    isLoading,
    handleAction,
    formattedData
  } = use[ComponentName](props);

  return (
    <Card className={`p-4 ${props.className || ''}`}>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">{t('title')}</h2>
        
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <p className="text-gray-600">{formattedData}</p>
            <Button color="primary" onPress={handleAction}>
              {t('actions.submit')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
```
