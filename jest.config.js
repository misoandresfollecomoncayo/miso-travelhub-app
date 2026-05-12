module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // Los tests E2E (Detox) viven en /e2e y usan su propio jest config; aquí
  // los ignoramos para que `npx jest` corra sólo la suite unitaria.
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|react-native-safe-area-context|react-native-screens)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'App.tsx',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
