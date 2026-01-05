module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['react'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  env: {
    browser: true,
    es2021: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
