import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:     '#0f0f14',
          panel:  '#16161e',
          card:   '#1e1e2a',
          border: '#2a2a3a',
          accent: '#f97316', // orange — distinct from WanderStreet's purple
          gold:   '#f0a500',
          text:   '#e8e8f0',
          muted:  '#8888a8',
        },
        cat: {
          food:    '#f97316',
          drinks:  '#8b5cf6',
          shops:   '#3b82f6',
          entert:  '#ec4899',
          hotels:  '#14b8a6',
          health:  '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
