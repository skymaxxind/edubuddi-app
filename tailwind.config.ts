import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#D9E5FF',
          200: '#BBCFFF',
          300: '#8DB0FF',
          400: '#5785FF',
          500: '#3B6BF5',
          600: '#2451DB',
          700: '#1A3FB5',
          800: '#1B3694',
          900: '#1C3175',
          950: '#141F49',
        },
        dark: {
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
    },
  },
  plugins: [],
}
export default config
