import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:       '#0D0546',
          marinho:    '#0E7490',
          'marinho-glow': '#22D3EE',
          silver:     '#94A3B8',
          offwhite:   '#F8FAFC',
          borda:      'rgba(255, 255, 255, 0.1)',
          texto:      '#3D4F6B',
          'texto-light': '#94A3B8',
          dark:       '#0F1425',
          // Aliases legados (arquivos que ainda usam paleta antiga)
          azul:       '#0D0546',
          'azul-sec': '#0E4F6A',
          gelo:       '#F8FAFC',
          dourado:    '#C9A84C',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-outfit)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'reveal': 'reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
