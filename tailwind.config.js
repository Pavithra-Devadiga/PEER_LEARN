/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        app: 'var(--color-bg-app)',
        card: {
          DEFAULT: 'var(--color-bg-card)',
          hover: 'var(--color-bg-card-hover)',
          muted: 'var(--color-bg-surface-muted)',
          subtle: 'var(--color-bg-surface-subtle)',
        },
        pill: {
          DEFAULT: 'var(--color-bg-pill)',
          hover: 'var(--color-bg-pill-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
          text: 'var(--color-accent-text)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          card: 'var(--color-border-card)',
          pill: 'var(--color-border-pill)',
        },
        text: {
          main: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'pill': 'var(--shadow-pill)',
        'popover': 'var(--shadow-popover)',
      },
      transitionDuration: {
        '200': '200ms',
      }
    },
  },
  plugins: [],
}
