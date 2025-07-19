
import '@testing-library/jest-dom';

// Set up any global mocks or configurations for tests here

// Suppress console errors in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18./i.test(args[0]) ||
    /Warning: The current testing environment is not configured to support act/i.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock window.matchMedia for responsive component tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
