# Quasar Admin App

This is the admin application for the Quasar project, built with React and TypeScript.

## Project Structure

The project follows a modern, scalable React application structure:

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   ├── common/      # Generic UI components (Button, Input)
│   ├── layout/      # Layout components (Header, Sidebar)
│   ├── SEO/         # SEO components
│   └── features/    # Feature-specific components
├── contexts/        # React Context providers
├── config/          # Configuration files
├── hooks/           # Custom React hooks
├── pages/           # Page components (route-based)
├── routes/          # Routing configuration
├── services/        # API and external service integration
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Path Aliases

For cleaner imports, we use path aliases. For example:

```tsx
// Instead of this:
import Button from '../../../components/common/Button';

// Use this:
import Button from '@admin/components/common/Button';
```

## Best Practices

### Component Organization

1. **Atomic Design Principles**: Organize components using atomic design (atoms, molecules, organisms)
2. **Component Folder Structure**:
   ```
   Button/
   ├── Button.tsx
   ├── Button.module.scss
   └── index.ts
   ```

### State Management

1. Use React Context for global state
2. Keep component state local when possible
3. Use Redux only for complex global state

### Code Style

1. Use TypeScript for type safety
2. Use functional components with hooks
3. Follow ESLint and Prettier configurations

## Getting Started

```bash
# Install dependencies
yarn

# Start the development server
nx serve admin
```

## Contributing

Please follow the project structure and best practices when adding new features or making changes. 