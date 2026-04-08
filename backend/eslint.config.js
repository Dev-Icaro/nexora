const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const unicorn = require('eslint-plugin-unicorn');
const sonarjs = require('eslint-plugin-sonarjs');
const security = require('eslint-plugin-security');
const promise = require('eslint-plugin-promise');
const n = require('eslint-plugin-n');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  sonarjs.configs.recommended,
  promise.configs['flat/recommended'],
  {
    ...n.configs['flat/recommended-script'],
    settings: {
      n: {
        tryExtensions: ['.ts', '.tsx', '.js', '.json', '.node'],
        convertPath: {
          'src/**/*.ts': ['^src/(.+)\\.ts$', 'src/$1.ts'],
        },
      },
    },
  },
  prettierRecommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      unicorn,
      security,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unicorn/prefer-node-protocol': 'off',
      'security/detect-object-injection': 'off',
      'no-console': 'warn',
    },
  },
];
