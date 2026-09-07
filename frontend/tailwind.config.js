/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Principal Emerald Green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        civic: {
          navy: '#0f172a',
          slate: '#1e293b',
          card: '#ffffff',
          darkCard: '#1e293b',
          accent: '#06b6d4', // Cyan
        },
        status: {
          pending: '#f59e0b', // Amber
          in_review: '#6366f1', // Indigo
          in_progress: '#3b82f6', // Blue
          resolved: '#10b981', // Emerald
          rejected: '#ef4444', // Rose
          cancelled: '#6b7280', // Gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'card': '0 2px 12px -2px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
