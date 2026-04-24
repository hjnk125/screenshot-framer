/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'page':       '#e8e8e6',
        'card':       '#fafaf9',
        'card-dense': '#f7f7f5',
        'card-inner': '#ffffff',
        'ink':        '#17181a',
        'soft':       '#5a5a58',
        'muted':      '#8a8a88',
        'accent':     '#d7ff3a',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      borderRadius: {
        'card':       '20px',
        'card-dense': '14px',
      },
    },
  },
  plugins: [],
}
