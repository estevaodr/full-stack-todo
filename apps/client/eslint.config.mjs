import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/next-env.d.ts'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
];
