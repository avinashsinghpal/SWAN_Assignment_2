/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      colors: {
        background: '#FFFFFF',
        surface: '#FAFAFA',
        cardgrey: '#E9E9E9',
        border: '#E5E5E5',
        primary: {
          DEFAULT: '#156D95',
          dark: '#00517F',
          light: '#9ED2FC',
        },
        navy: '#111A4A',
        text: {
          primary: '#202020',
          secondary: '#666666',
          muted: '#7C7F88',
        },
        success: '#16B364',
        warning: '#D9A100',
        danger: '#D92D20',
        status: {
          todo: '#64748B',
          inprogress: '#156D95',
          completed: '#16B364',
        }
      },
      borderRadius: {
        'large-card': '40px',
      },
      transitionTimingFunction: {
        'pill-morph': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
        'entrance': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      }
    },
  },
  plugins: [],
}
