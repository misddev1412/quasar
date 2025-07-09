/**
 * Border Design Tokens
 * Consistent border widths, radius, and styles
 */

// Border widths
export const borderWidths = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const;

// Border radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',
} as const;

// Border styles
export const borderStyles = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
  none: 'none',
} as const;

// Semantic border tokens
export const semanticBorders = {
  // Input borders
  input: {
    default: {
      width: borderWidths[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    focus: {
      width: borderWidths[2],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    error: {
      width: borderWidths[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
  },

  // Button borders
  button: {
    default: {
      width: borderWidths[1],
      style: borderStyles.solid,
      radius: borderRadius.md,
    },
    rounded: {
      width: borderWidths[1],
      style: borderStyles.solid,
      radius: borderRadius.full,
    },
  },

  // Card borders
  card: {
    default: {
      width: borderWidths[1],
      style: borderStyles.solid,
      radius: borderRadius.lg,
    },
    rounded: {
      width: borderWidths[1],
      style: borderStyles.solid,
      radius: borderRadius.xl,
    },
  },

  // Modal borders
  modal: {
    width: borderWidths[0],
    style: borderStyles.none,
    radius: borderRadius['2xl'],
  },

  // Divider borders
  divider: {
    width: borderWidths[1],
    style: borderStyles.solid,
    radius: borderRadius.none,
  },
} as const;

export type BorderWidths = typeof borderWidths;
export type BorderRadius = typeof borderRadius;
export type BorderStyles = typeof borderStyles;
export type SemanticBorders = typeof semanticBorders; 