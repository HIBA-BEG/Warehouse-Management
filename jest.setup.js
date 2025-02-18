jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      EXPO_PUBLIC_API_URL: 'http://test-api-url.com'
    }
  }
}));

global.fetch = require('jest-fetch-mock');
