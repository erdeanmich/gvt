module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 'off',
    'no-use-before-define': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'import/extensions': 'off',
  },
};
