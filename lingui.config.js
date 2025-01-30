import { defineConfig } from '@lingui/cli'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['ca-ES', 'en'],
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}/messages',
      include: ['<rootDir>'],
      exclude: ['**/node_modules/**'],
    },
  ],
})
