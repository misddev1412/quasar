---
name: Refactor UI
description: Refactor an existing UI component to separate logic and styles, use common components, and enhance the design.
---

# Refactor UI Skill

This skill guides the agent to refactor existing React components to improve code quality, maintainability, and visual consistency.

## Objectives
1.  **Separation of Concerns**: Split the component into `Ui.tsx` (in components folder), `useHook.ts` (in `apps/frontend/src/hooks`), and `types.ts`.
2.  **Modern UI**: Replace HTML elements and custom styles with `@heroui/react` and project-specific common components.
3.  **Type Safety**: Fix TypeScript errors, ensure strict typing, and **NEVER use `any`**.
4.  **Enhancement**: Improve the aesthetic quality using the project's design system.
5.  **Clean Imports**: Always use import aliases (e.g., `@/components/...`, `@/hooks/...`) instead of relative paths (`../../`).

## Instructions

When the user asks to "refactor" or "enhance" a component/page:

1.  **Analyze the Target**:
    *   Read the existing component file.
    *   Identify the state, effects, and handlers (Business Logic).
    *   Identify the JSX structure (UI).
    *   Identify the props and data structures (Types).

2.  **Execute Refactoring**:
    Perform the following steps. **Do not modify the original file until the new files are ready or you are sure about the replacement.**

    ### Step 2.1: Extract Types
    Create or update `[ComponentName].types.ts`.
    *   Move all interfaces and types here.
    *   Export them clearly.

    ### Step 2.2: Extract Logic
    Create or update `apps/frontend/src/hooks/use[ComponentName].ts`.
    *   Move `useState`, `useEffect`, `useQuery`, and handlers here.
    *   Return an object containing everything the UI needs (state values, handler functions).
    *   Import types from `[ComponentName].types.ts`.

    ### Step 2.3: Rebuild UI
    Update `[ComponentName].tsx`.
    *   Import the hook: `const { ... } = use[ComponentName](props);`
    *   Replace `<div>`, `<button>`, `<input>` with:
        *   `Card`, `Button`, `Input` from `@heroui/react`.
        *   `LoadingOverlay`, `StatusBadge`, `PageBreadcrumbs` from `apps/frontend/src/components/common`.
    *   **Crucial**: Use `useTranslations` for all text.
    *   Ensure the design looks "Premium" (spacing, shadows, rounded corners).

3.  **Verify**:
    *   Check for any leftover unused imports.
    *   Ensure no logic remains in the `.tsx` file (except strictly UI logic like simple toggles if necessary).
    *   **Fix TS Errors**: Ensure the refactored code compiles without errors. Pay special attention to the hook file (`use[ComponentName].ts`) to ensure strict typing for arguments and return values. **Do NOT use `any`**; define proper interfaces.

## Common Replacements
*   `div.card` -> `<Card>`
*   `button` -> `<Button color="primary">`
*   `input` -> `<Input variant="bordered">`
*   `loading...` -> `<Spinner />` or `<LoadingOverlay />`
