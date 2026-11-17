// Adds jest-dom's DOM matchers (toBeInTheDocument, toHaveTextContent, ...) to Vitest's expect.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { afterEach } from 'vitest';

// jsdom no incluye SubtleCrypto, que auth.ts usa para hashear contraseñas.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

// Testing Library only cleans up automatically when Vitest globals are enabled.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia, which Ionic uses for platform and dark mode checks.
window.matchMedia =
  window.matchMedia ||
  function (query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    };
  };
