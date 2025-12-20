/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
        },
        purple: {
          500: '#764ba2',
        },
        success: {
          500: '#48bb78',
          600: '#38a169',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-success': 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 20px 60px rgba(0, 0, 0, 0.3)',
        message: '0 2px 5px rgba(0, 0, 0, 0.1)',
        'message-primary': '0 2px 5px rgba(102, 126, 234, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        progress: 'progress 20s linear forwards',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
