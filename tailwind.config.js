/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        night: '#0f172a',
        neon: '#ff2ec4',
        uv: '#7c3aed',
      },
      boxShadow: {
        glow: '0 0 24px rgba(255,46,196,0.45)',
      },
    },
  },
  plugins: [],
};
