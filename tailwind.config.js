/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        physics: {
          dark: '#0a0f1d',
          card: '#111827',
          panel: '#1e293b',
          accent: '#38bdf8',
          velocity: '#22c55e',
          force: '#ef4444',
          acceleration: '#f59e0b',
          tension: '#a855f7',
          normal: '#06b6d4',
          friction: '#f97316',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
