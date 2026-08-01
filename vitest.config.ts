import { defineConfig } from 'vitest/config';

// Solo los tests del código fuente. Sin esto vitest también levanta los
// .test.js compilados en dist/, que quedan viejos y hacen creer que hay
// más pruebas pasando de las que hay.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
