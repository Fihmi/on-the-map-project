import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tunis: {
          blue: '#164e63', // Deeper, more elegant cyan/blue (Tailwind cyan-900 style)
          sand: '#f3e5ab', // Softer vanilla/sand
          terracotta: '#d97757', // Softer, more natural terracotta
          white: '#fafafa'
        }
      },
      animation: {
        'kenburns': 'kenburns 20s ease-out infinite alternate',
        'fade-up': 'fadeUp 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(-2%, -2%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
