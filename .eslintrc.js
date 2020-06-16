module.exports = {
  extends: ['@ofa2/eslint-config'],
  parserOptions: { project: ['./tsconfig.json'] },
  globals: {},
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id', '_leaf', '_children', '_parent'] }],
    '@typescript-eslint/ban-ts-ignore': ['off'],
  },
  settings: {
    'import/core-modules': ['mongodb', 'nedb'],
  },
};
