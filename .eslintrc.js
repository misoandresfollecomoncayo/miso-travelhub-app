module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js', '__tests__/**/*.{ts,tsx,js,jsx}'],
      env: {
        jest: true,
      },
    },
    {
      // Tests E2E de Detox: el runner inyecta `device`, `element`, `by`,
      // `waitFor` y los hooks de jest como globals en runtime. Permitimos
      // `it.skip` / `describe.skip` para documentar flujos bloqueados por
      // el bug de Detox + Fabric (ver smoke.test.js y login.test.js).
      files: ['e2e/**/*.{js,ts}'],
      env: {
        jest: true,
        node: true,
      },
      globals: {
        device: 'readonly',
        element: 'readonly',
        by: 'readonly',
        waitFor: 'readonly',
      },
      rules: {
        'jest/no-disabled-tests': 'off',
      },
    },
  ],
};
