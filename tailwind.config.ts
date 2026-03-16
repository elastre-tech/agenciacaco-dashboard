import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD100',
          50: '#FFF9E0',
          100: '#FFF3C2',
          200: '#FFE780',
          300: '#FFDB40',
          400: '#FFD100',
          500: '#E0B800',
          600: '#C2A000',
          700: '#8A7200',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#9A9A9A',
          400: '#6B6B6B',
          500: '#3D3D3D',
          600: '#2E2E2E',
          700: '#1A1A1A',
          800: '#111111',
          900: '#0A0A0A',
        },
        background: '#F8F8F6',
        surface: '#FFFFFF',
        border: '#E8E8E8',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
export default config;
