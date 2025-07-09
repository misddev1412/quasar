const sharedConfig = require('../../libs/shared/src/styles/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../libs/shared/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../libs/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      // Client-specific theme extensions can go here
    },
  },
  plugins: [],
}; 