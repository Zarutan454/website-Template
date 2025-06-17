
// Globale Test-Typdefinitionen
import '@testing-library/jest-dom';

// Declare global Jest types for TypeScript
declare global {
  // Jest globals
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const test: typeof it;
  const expect: jest.Expect;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const jest: typeof import('jest');
}

// Verhindern, dass diese Datei als ES-Modul behandelt wird
export {};
