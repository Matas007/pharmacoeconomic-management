import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        blue: {
          50: '#e8ebed',
          100: '#d1d7db',
          200: '#a3afb7',
          300: '#758793',
          400: '#475f6f',
          500: '#2c3e50',
          600: '#2c3e50',
          700: '#233140',
          800: '#1a2530',
          900: '#121820',
          950: '#090c10',
        },
      },
      screens: {
        'xs': '475px',
        // sm: '640px' (default)
        // md: '768px' (default)
        // lg: '1024px' (default)
        // xl: '1280px' (default)
        // 2xl: '1536px' (default)
      },
    },
  },
  plugins: [],
}
export default config
