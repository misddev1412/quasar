const sharedConfig = require('./libs/shared/src/styles/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    './apps/admin/src/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/client/src/**/*.{js,ts,jsx,tsx,mdx}',
    './libs/shared/src/**/*.{js,ts,jsx,tsx,mdx}',
    './libs/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

