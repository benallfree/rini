module.exports = {
  extends: [
    'universe',
    'universe/shared/typescript-analysis',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  rules: {
    'react/prop-types': 0,
    'import/order': 0,
    'react/display-name': 0,
  },
}
