import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fafaf7',
        grid: '#e5e5e0',
        surface: '#ffffff',
        'ui-border': '#e8e8e3',
        'text-primary': '#1a1a1a',
        'text-secondary': '#6b6b6b',
        accent: {
          DEFAULT: '#0a0a0a',
          positive: '#10b981',
          danger: '#ef4444',
        },
        sticky: {
          event: '#ff9900',
          'event-border': '#b36b00',
          command: '#4a90e2',
          'command-border': '#2e5c8a',
          actor: '#ffeb3b',
          'actor-border': '#b8a82a',
          policy: '#9c27b0',
          'policy-border': '#6a1b9a',
          external: '#ec407a',
          'external-border': '#ad1457',
          aggregate: '#fff59d',
          'aggregate-border': '#bfa726',
          readmodel: '#66bb6a',
          'readmodel-border': '#2e7d32',
          'context-border': '#424242',
        },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      boxShadow: {
        'sticky-rest': '0 2px 8px rgba(0,0,0,0.08)',
        'sticky-hover': '0 8px 24px rgba(0,0,0,0.15)',
        dock: '0 4px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        sticky: '4px',
        dock: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
