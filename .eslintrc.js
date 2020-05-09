module.exports = {
  extends: ['@ofa2/eslint-config'],
  parserOptions: { project: ['./tsconfig.json'] },
  globals: {},
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id', '_leaf', '_children', '_parent'] }],
  },
  settings: {
    'import/core-modules': ['mongodb', 'nedb'],
  },
};
