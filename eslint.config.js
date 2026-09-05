import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-multiple-empty-lines': ['error', { max: 1 }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
