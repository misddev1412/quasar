/**
 * Responsive Breakpoint System
 * Consistent breakpoints for responsive design
 */

// Breakpoint values (mobile-first approach)
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Max-width media queries
  maxXs: `(max-width: ${parseFloat(breakpoints.sm) - 0.02}px)`,
  maxSm: `(max-width: ${parseFloat(breakpoints.md) - 0.02}px)`,
  maxMd: `(max-width: ${parseFloat(breakpoints.lg) - 0.02}px)`,
  maxLg: `(max-width: ${parseFloat(breakpoints.xl) - 0.02}px)`,
  maxXl: `(max-width: ${parseFloat(breakpoints['2xl']) - 0.02}px)`,
  
  // Range media queries
  smToMd: `(min-width: ${breakpoints.sm}) and (max-width: ${parseFloat(breakpoints.lg) - 0.02}px)`,
  mdToLg: `(min-width: ${breakpoints.md}) and (max-width: ${parseFloat(breakpoints.xl) - 0.02}px)`,
  lgToXl: `(min-width: ${breakpoints.lg}) and (max-width: ${parseFloat(breakpoints['2xl']) - 0.02}px)`,
} as const;

// Container sizes for different breakpoints
export const containerSizes = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Grid system
export const gridSystem = {
  columns: 12,
  gutter: {
    xs: '1rem',    // 16px
    sm: '1.5rem',  // 24px
    md: '2rem',    // 32px
    lg: '2rem',    // 32px
    xl: '2rem',    // 32px
    '2xl': '2rem', // 32px
  },
} as const;

// Responsive utilities
export const responsiveUtils = {
  // Helper to create responsive properties
  createResponsive: <T>(values: Partial<Record<keyof typeof breakpoints, T>>) => {
    return Object.entries(values).reduce((acc, [key, value]) => {
      const breakpoint = key as keyof typeof breakpoints;
      if (breakpoint === 'xs') {
        acc[breakpoint] = value;
      } else {
        acc[`@media ${mediaQueries[breakpoint]}`] = value;
      }
      return acc;
    }, {} as any);
  },
  
  // Common responsive patterns
  show: {
    xs: { display: 'block' },
    sm: { [`@media ${mediaQueries.sm}`]: { display: 'block' } },
    md: { [`@media ${mediaQueries.md}`]: { display: 'block' } },
    lg: { [`@media ${mediaQueries.lg}`]: { display: 'block' } },
    xl: { [`@media ${mediaQueries.xl}`]: { display: 'block' } },
    '2xl': { [`@media ${mediaQueries['2xl']}`]: { display: 'block' } },
  },
  
  hide: {
    xs: { display: 'none' },
    sm: { [`@media ${mediaQueries.sm}`]: { display: 'none' } },
    md: { [`@media ${mediaQueries.md}`]: { display: 'none' } },
    lg: { [`@media ${mediaQueries.lg}`]: { display: 'none' } },
    xl: { [`@media ${mediaQueries.xl}`]: { display: 'none' } },
    '2xl': { [`@media ${mediaQueries['2xl']}`]: { display: 'none' } },
  },
} as const;

export type Breakpoints = typeof breakpoints;
export type MediaQueries = typeof mediaQueries;
export type ContainerSizes = typeof containerSizes; 