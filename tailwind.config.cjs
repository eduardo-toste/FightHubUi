module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d72638',
          dark: '#b21d2c',
          light: '#f56b76',
        },
        accent: {
          DEFAULT: '#0ea5a4',
        },
        fh: {
          bg: '#f4f6f8',
          card: '#ffffff',
          text: '#111827',
          body: '#374151',
          muted: '#6b7280',
          border: '#e6e9ee',
          divider: '#eaedf2',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
        input: '8px',
      },
      boxShadow: {
        card: '0 6px 24px rgba(0,0,0,0.05)',
        soft: '0 2px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
