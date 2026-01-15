# Global Agent Rules

These rules apply to all tasks and skills executed by the agent.

1.  **TypeScript Strictness**:
    *   **NEVER use the `any` type**.
    *   Always define proper interfaces or types for variables, function arguments, and return values.
    *   If a type is truly unknown, use `unknown` and perform type narrowing, but prefer specific types whenever possible.
