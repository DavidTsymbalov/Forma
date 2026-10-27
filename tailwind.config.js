/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        sidebar: 'var(--sidebar)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'text-muted': 'var(--text-muted)',
        'text-active': 'var(--text-active)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        prompt: 'var(--prompt-radius)',
      },
      maxWidth: {
        prompt: 'var(--prompt-width)',
      },
      spacing: {
        'prompt-bottom': 'var(--prompt-bottom)',
        'prompt-padding': 'var(--prompt-padding)',
      },
      lineHeight: {
        prompt: 'var(--prompt-line-height)',
      },
      maxHeight: {
        'prompt-textarea': 'calc(var(--prompt-line-height) * 8)',
      },
    },
  },
  plugins: [],
}
