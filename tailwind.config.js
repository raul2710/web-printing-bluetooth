/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#fbfbfa',
        panel: '#ffffff',
        borderSubtle: '#eae8e1',
        borderStrong: '#d5d2c8',
        ink: {
          900: '#18181b',
          700: '#3f3f46',
          500: '#71717a',
          400: '#a1a1aa',
          200: '#e4e4e7',
          100: '#f4f4f5',
        },
        terracotta: {
          50: '#fff5f3',
          100: '#ffe8e4',
          500: '#f05338',
          600: '#dc381c',
          700: '#b82a13',
        },
        sage: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
        },
        amberSoft: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        indigoSoft: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        friendly: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.03), 0 10px 24px -6px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.05), 0 18px 36px -8px rgba(0,0,0,0.07)',
        'receipt': '0 8px 30px -4px rgba(24, 24, 27, 0.12), 0 0 0 1px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}
