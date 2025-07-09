/**
 * Shadow Design Tokens
 * Elevation system using consistent shadows
 */

// Base shadow definitions
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Semantic shadow tokens for different use cases
export const semanticShadows = {
  // Card elevations
  card: {
    flat: shadows.none,
    raised: shadows.sm,
    floating: shadows.base,
    elevated: shadows.md,
    overlay: shadows.lg,
    modal: shadows.xl,
  },

  // Focus states
  focus: {
    ring: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    ringOffset: '0 0 0 2px #ffffff, 0 0 0 4px rgba(59, 130, 246, 0.1)',
  },

  // Button states
  button: {
    default: shadows.sm,
    hover: shadows.base,
    active: shadows.inner,
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },

  // Input states
  input: {
    default: shadows.inner,
    focus: '0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.1)',
    error: '0 0 0 1px rgba(239, 68, 68, 0.5), 0 0 0 3px rgba(239, 68, 68, 0.1)',
  },

  // Dropdown and tooltip
  dropdown: shadows.lg,
  tooltip: shadows.md,

  // Navigation
  navbar: shadows.sm,
  sidebar: shadows.base,
} as const;

export type Shadows = typeof shadows;
export type SemanticShadows = typeof semanticShadows; 